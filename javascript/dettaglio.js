/* ============================================================================
   Grafico “quadrato → rombo → lati” + legenda animata (p5.js)
   - Larghezza ∝ Incidenti
   - Altezza  ∝ Feriti
   - Colore/Opacità lato ∝ Morti (grigio → arancione)
   - Due stati (bottoni): 'incidenti' e 'lesionati'
============================================================================ */

let tab, rows = [];                      // [{cat, incidenti, morti, feriti}]
let mode = 'incidenti';                  // stato iniziale
window.mode = mode;                      // usato dalla legenda

let trans = 0, transTgt = 0;             // 0 = quadrati, 1 = parallelepipedi

// layout grafico
const padL = 90, padR = 30, padT = 56, padB = 86;
const chartHMin = 360;
// spazio orizzontale riservato alle etichette percentuali
const LABEL_RESERVE = 8;
// fattore che aumenta visivamente la larghezza delle colonne
const COLUMN_WIDTH_FACTOR = 0.7;
// fattore verticale (0..1) per ridurre l'altezza massima delle colonne
const VERT_SCALE = 0.95;
// quanto cresce il quadrato di base ogni 100 incidenti
const BASE_STEP_SCALE = 0.08;

let maxInc=1, maxFer=1, maxMor=1, minMor=0;
let geom = [];
let hotspots = [];
let hover = null;
let mainCanvas = null;
// stato per hover iniziale automatico (non usato ma tenuto per compatibilità)
let initialHoverActive = true;
let userInteracted = false;
let selectedHotspot = null;
let selectedIndex = null;
let selectedKind = null;

/* ---------- util ---------- */
function parseIT(n){
  if(n==null) return 0;
  const s = String(n).trim();
  if(s==='-'||s==='—') return 0;
  return Number(s.replace(/[.\s]/g,'').replace(',', '.'))||0;
}
const fmt = n => Number(n).toLocaleString('it-IT');
function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }
function easeOut(t){ return 1 - Math.pow(1-t,3); }
function getCSS(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

/* ---------- p5: preload/setup ---------- */
function preload(){
  tab = loadTable('../assets/datasets/Incidenti-conducenti.csv', 'csv', 'header');
}

function setup(){
  mainCanvas = createCanvas(10,10);
  mainCanvas.parent('canvas-holder');
  textFont('system-ui, Segoe UI, Roboto, Arial');

  // Dataset
  for(let r=0;r<tab.getRowCount();r++){
    const cat = (tab.getString(r,'Circostanze riferibili al conducente')||'').trim();
    if(!cat || cat.toLowerCase().includes('totale')) break;
    const incidenti = parseIT(tab.getString(r,'Incidenti'));
    const morti     = parseIT(tab.getString(r,'Morti'));
    const feriti    = parseIT(tab.getString(r,'Feriti'));
    rows.push({cat, incidenti, morti, feriti});
  }
  if (rows.length===0){
    rows = [{cat:'ESEMPIO', incidenti:1000, morti:5, feriti:800}];
  }

  maxInc = max(rows.map(o=>o.incidenti)) || 1;
  maxFer = max(rows.map(o=>o.feriti))    || 1;
  maxMor = max(rows.map(o=>o.morti))     || 1;
  minMor = min(rows.map(o=>o.morti))     || 0;

  // Bottoni
  select('#btnInc').mousePressed(()=>switchMode('incidenti'));
  select('#btnLes').mousePressed(()=>switchMode('lesionati'));

  // Legenda (istanza p5 separata)
  new p5(legendSketch, document.getElementById('legend-canvas-holder'));

  // click per selezione persistente e cambio modalità
  mainCanvas.elt.addEventListener('pointerdown', (ev)=>{
    try{
      const rect = mainCanvas.elt.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      for(const h of hotspots){
        if(pointInPoly(x,y,h.poly)){
          userInteracted = true;
          initialHoverActive = false;
          selectedIndex = h.i;
          selectedKind = h.kind;
          selectedHotspot = h;
          hover = h;

          if(h.kind==='top' && mode==='incidenti'){
            setTimeout(()=>{ switchMode('lesionati'); }, 40);
          } else if(mode==='lesionati'){
            selectedKind = h.kind || 'top';
            setTimeout(()=>{ switchMode('incidenti'); }, 40);
          }
          break;
        }
      }
    }catch(e){ /* ignore */ }
  }, {passive:true});

  prepareLayout();
}

function switchMode(m){
  if(mode===m) return;
  mode = m; window.mode = m;

  document.getElementById('btnInc').classList.toggle('active', m==='incidenti');
  document.getElementById('btnLes').classList.toggle('active', m==='lesionati');

  document.getElementById('legend-title').textContent =
    (m==='incidenti') ? 'incidenti' : 'lesionati';
  const legendSub = document.getElementById('legend-sub');
  if (legendSub) {
    if (m === 'incidenti') {
      legendSub.innerHTML = 'AREA = numero di incidenti';
    } else {
      legendSub.innerHTML = 'ALTEZZA = feriti<br>OPACITÀ = mortalità';
    }
  }

  const note = document.getElementById('legend-mortality-note');
  if(note) note.hidden = (m !== 'lesionati');

  transTgt = (m==='incidenti') ? 0 : 1;
  if (window.__legendCtl) window.__legendCtl.setTarget(transTgt);

  prepareLayout();
}

/* ---------- layout grafico ---------- */
function sizeCanvasToHolder(){
  const holder = document.getElementById('plot-area');
  const w = holder.clientWidth;
  const availableH = Math.min(holder.clientHeight, window.innerHeight - 100);
  const h = Math.max(chartHMin, availableH);
  resizeCanvas(w, h);
}

function prepareLayout(){
  if(mode==='incidenti') rows.sort((a,b)=>b.incidenti-a.incidenti);
  else                   rows.sort((a,b)=>b.feriti-a.feriti);

  sizeCanvasToHolder();

  const gw = width - padL - padR;
  const totalLabelReserve = Math.min(rows.length * LABEL_RESERVE, Math.floor(gw * 0.25));
  const usableGw = gw - totalLabelReserve;

  const step = usableGw / Math.max(1, rows.length);
  const gh = height - padT - padB;
  const usableGh = Math.max(8, Math.floor(gh * VERT_SCALE));

  let minS = Math.max(8, step * 0.20 * COLUMN_WIDTH_FACTOR);
  const rotFactor = Math.SQRT2;
  const effectiveMaxWidth = step * 0.90 * COLUMN_WIDTH_FACTOR;
  let maxS = Math.min(effectiveMaxWidth / rotFactor, step * 0.85 * COLUMN_WIDTH_FACTOR);
  if (minS > maxS) minS = Math.max(8, maxS * 0.5);

  const n = rows.length;
  if (n === 0){
    geom = [];
    return;
  }

  // 1) larghezze colonne (fissate, nessun rescale successivo)
  const halves      = new Array(n);  // half "base" usato nel disegno
  const baseHalves  = new Array(n);  // half effettivo del quadrato di base
  let widthSum = 0;

  for (let i = 0; i < n; i++){
    const v = rows[i];

    let s = map(v.incidenti, 0, maxInc, minS, maxS);
    const allowedMax = Math.max(8, step * 0.95);
    if (s > allowedMax) s = allowedMax;
    const half = s * 0.5;
    halves[i] = half;

    const incSteps  = Math.floor((Number(v.incidenti) || 0) / 100);
    const baseScale = clamp(1 + incSteps * BASE_STEP_SCALE, 1, 2.5);
    const baseHalf  = half * baseScale;

    baseHalves[i] = baseHalf;
    widthSum     += 2 * baseHalf;
  }

  // 2) gap uniforme tra colonne SENZA cambiare le larghezze
  const availSpan  = usableGw;
  const colGapBase = Math.max(32, step * 0.8);          // gap "desiderato" (abbondante)
  const maxGap     = (availSpan - widthSum) / Math.max(1, n - 1);

  let colGap;
  if (maxGap <= 4){
    colGap = 4;                                         // caso limite, ma larghezze intatte
  } else {
    colGap = Math.min(colGapBase, maxGap);
  }

  // 3) posizioni centri
  const centers = new Array(n);

  let firstLeft = padL;                 // bordo sinistro di partenza
  centers[0] = firstLeft + baseHalves[0];

  for (let i = 1; i < n; i++){
    centers[i] = centers[i-1] + baseHalves[i-1] + baseHalves[i] + colGap;
  }

  // 4) allineo il bordo sinistro della prima colonna al titolo
  try{
    const titleEl    = document.querySelector('.title');
    const canvasRect = mainCanvas.elt.getBoundingClientRect();
    if (titleEl && canvasRect){
      const titleRect = titleEl.getBoundingClientRect();

      const currentLeft = centers[0] - baseHalves[0];
      const desiredLeft = titleRect.left - canvasRect.left;

      let delta = desiredLeft - currentLeft;

      const minLeft  = padL;
      const maxRight = width - padR - LABEL_RESERVE - 4;
      const lastRight = centers[n-1] + baseHalves[n-1];
      const deltaMin = minLeft - currentLeft;
      const deltaMax = maxRight - lastRight;
      delta = clamp(delta, deltaMin, deltaMax);

      if (Math.abs(delta) > 0.5){
        for (let i = 0; i < n; i++) centers[i] += delta;
      }
    }
  }catch(e){ /* ignore */ }

  // 5) geometria per il draw()
  geom = rows.map((v,i)=>{
    const cx   = centers[i];
    const half = halves[i];

    const Hfer = map(v.feriti, 0, maxFer, 0, usableGh);

    const tRaw = (maxMor>minMor) ? (v.morti - minMor)/(maxMor - minMor) : 0.5;
    const t = Math.pow(clamp(tRaw,0,1), 0.85);
    const cGray   = color('#c7c7c7ff');
    const cOrange = color(getCSS('--morti'));
    const sideCol = lerpColor(cGray, cOrange, t);

    return {
      cx,
      baseY: height - padB,   // baseline istogramma
      half,
      sideH: Hfer,
      sideColor: sideCol,
      data: v
    };
  });
}

/* ---------- draw grafico ---------- */
function draw(){
  sizeCanvasToHolder();
  background(0);

  const gx = padL, gy = padT, gw = width - padL - padR, gh = height - padT - padB;

  const usableGh = Math.max(8, Math.floor(gh * VERT_SCALE));
  const gridTop = gy + (gh - usableGh);
  stroke(255, 45); strokeWeight(1);
  for(let i=0;i<=4;i++){
    const y = map(i,0,4, gy+gh, gridTop);
    line(gx, y, gx+gw, y);
  }

  trans = lerp(trans, transTgt, 0.12);

  hotspots.length = 0;
  for(let i=0;i<geom.length;i++) drawBar(i, geom[i], trans);

  detectHover();
  drawTip();
}

function drawBar(i, g, t){
  const blue = getCSS('--blue');

  const angle  = (PI/4) * easeOut(clamp((t-0.00)/0.35, 0, 1));
  const squash = lerp(1, 0.40,        easeOut(clamp((t-0.35)/0.20, 0, 1)));
  const grow   = easeOut(clamp((t-0.55)/0.45,0,1));

  const half    = g.half;
  const groundY = g.baseY;   // linea di base istogramma

  // scala del quadrato di base (incidenti)
  const incidentsCount = Number(g.data.incidenti) || 0;
  const incSteps  = Math.floor(incidentsCount / 100);
  const baseScale = clamp(1 + incSteps * BASE_STEP_SCALE, 1, 2.5);
  const baseHalf  = half * baseScale;

  // centro verticale del quadrato
  // - in "incidenti": lato inferiore esattamente su groundY
  // - in "lesionati": centro sulla base
  let baseY;
  if (mode === 'incidenti') {
    baseY = groundY - baseHalf;    // bottom = baseY + baseHalf = groundY
  } else {
    baseY = groundY;               // parallelepipedi “appoggiati” al suolo
  }

  const base = [
    {x:-baseHalf,y:-baseHalf},{x:+baseHalf,y:-baseHalf},
    {x:+baseHalf,y:+baseHalf},{x:-baseHalf,y:+baseHalf}
  ];
  function rot(pt, lift){
    const c=Math.cos(angle), s=Math.sin(angle);
    const rx = pt.x*c - pt.y*s;
    const ry = (pt.x*s + pt.y*c) * squash;
    return { x: g.cx + rx, y: (baseY - lift) + ry };
  }

  const H = g.sideH * grow;

  const p0=rot(base[0],H), p1=rot(base[1],H), p2=rot(base[2],H), p3=rot(base[3],H);

  const bL0=rot(base[3],0), bL1=rot(base[0],0);
  const L0={x:bL0.x,y:groundY}, L1={x:bL1.x,y:groundY};
  const L2=rot(base[0],H), L3=rot(base[3],H);
  const L=[L0,L1,L2,L3];

  const mirror=pt=>({x:2*g.cx-pt.x,y:pt.y});
  const R=[ mirror(L0),mirror(L1),mirror(L2),mirror(L3) ];

  const isHoveredColumn = hover && hover.i === i;
  const isDimmed = hover && hover.i !== i;

  let sideAlpha = 1.0;
  if(hover && hover.i===i && hover.kind==='top') sideAlpha = 0.55;
  if (isDimmed) sideAlpha *= 0.5;

  let col = color(g.sideColor);
  if (isDimmed) {
    col = color('#9a9a9a');
  }
  col.setAlpha(255 * sideAlpha);

  noStroke();
  fill(col);
  quad(L[0].x,L[0].y, L[1].x,L[1].y, L[2].x,L[2].y, L[3].x,L[3].y);
  quad(R[0].x,R[0].y, R[1].x,R[1].y, R[2].x,R[2].y, R[3].x,R[3].y);

  let topCol = color(blue);
  if (isDimmed) {
    topCol = color('#b0b0b0');
    topCol.setAlpha(255 * 0.5);
  }
  fill(topCol);
  quad(p0.x,p0.y, p1.x,p1.y, p2.x,p2.y, p3.x,p3.y);

  if(mode==='lesionati'){
    hotspots.push({kind:'side', i, poly:[...L], data:g.data});
    hotspots.push({kind:'side', i, poly:[...R], data:g.data});
  }
  hotspots.push({kind:'top', i, poly:[p0,p1,p2,p3], data:g.data});

  if (mode === 'lesionati') {
    (function(){
      const incidents = Number(g.data.incidenti) || 0;
      const deaths = Number(g.data.morti) || 0;
      const pct = incidents > 0 ? (100 * deaths / incidents) : 0;
      const txt = incidents > 0 ? pct.toFixed(1) + '%' : '-';

      const topY = Math.min(p0.y, p1.y, p2.y, p3.y);
      const labelWidth = 56;
      let labelX = g.cx + baseHalf + 8;
      const maxLabelX = width - padR - labelWidth - 4;
      if (labelX > maxLabelX) labelX = Math.max(g.cx + baseHalf + 8, maxLabelX);

      push();
      textFont('Transport');
      textSize(16);
      textStyle(BOLD);
      textAlign(LEFT, CENTER);
      fill(255);
      text(txt, labelX, topY);
      textStyle(NORMAL);
      pop();
    })();
  }
}

/* ---------- hover/tooltip ---------- */
function detectHover(){
  const x = mouseX, y = mouseY;
  let found = null;
  for(const h of hotspots){
    if(pointInPoly(x,y,h.poly)){ found = h; break; }
  }

  if (found) {
    hover = found;
    return;
  }

  if (selectedIndex !== null && selectedIndex !== undefined){
    const sel = hotspots.find(h => h.i === selectedIndex && h.kind === selectedKind)
              || hotspots.find(h => h.i === selectedIndex);
    if (sel){ hover = sel; return; }
  }

  const first = hotspots.find(h => h.i === 0 && h.kind === 'top');
  hover = first || null;
}

function drawTip(){
  const tip = document.getElementById('tip');
  if(!hover){
    tip.hidden = true;
    return;
  }
  const v = hover.data;
  tip.hidden = false;

  let hintHtml = '';
  if (mode === 'incidenti') {
    hintHtml = `<div class="tip-hint">Muoviti sui quadrati per visualizzare i dettagli di ogni categoria</div>`;
  } else {
    hintHtml = `<div class="tip-hint">Muoviti sui parallelepipedi per visualizzare i dettagli di ogni categoria</div>`;
  }

  if (mode === 'incidenti') {
    tip.innerHTML = `${hintHtml}
      <div class="tip-title"><b>${v.cat}</b></div>
      <div class="tip-line"><span class="i">Incidenti:</span> ${fmt(v.incidenti)}</div>
    `;
  } else {
    tip.innerHTML = `${hintHtml}
      <div class="tip-title"><b>${v.cat}</b></div>
      <div class="tip-line"><span class="i">Incidenti:</span> ${fmt(v.incidenti)}</div>
      <div class="tip-line"><span class="f">Feriti:</span> ${fmt(v.feriti)}&nbsp;&nbsp;
        <span class="m">Morti:</span> ${fmt(v.morti)}</div>
    `;
  }

  tip.style.fontFamily   = 'system-ui, Segoe UI, Roboto, Arial';
  tip.style.fontsize     = '26px';
  tip.style.lineHeight   = '1.5';
  tip.style.padding      = '0';
  tip.style.borderRadius = '0';
  tip.style.background   = 'transparent';
  tip.style.boxShadow    = 'none';
  tip.style.border       = 'none';
  tip.style.pointerEvents = 'none';
  tip.style.maxWidth     = '1000px';
  tip.style.zIndex       = '1000';
  tip.style.textAlign    = 'left';
  tip.style.color        = '#ffffff';

  const canvasRect = mainCanvas.elt.getBoundingClientRect();
  const marginX = 70;
  const marginY = -50;

  const tipWidth  = tip.offsetWidth || 0;
  const tipHeight = tip.offsetHeight || 0;

  let left = canvasRect.right - marginX - tipWidth;
  let top  = canvasRect.top  + marginY;

  const minTop = 10;
  const maxTop = canvasRect.bottom - 10 - tipHeight;

  if (left < canvasRect.left + marginX) left = canvasRect.left + marginX;
  if (top  < minTop)                   top  = minTop;
  if (top  > maxTop)                   top  = maxTop;

  tip.style.left = `${left}px`;
  tip.style.top  = `${top}px`;
}

function pointInPoly(px,py,poly){
  return inTri(px,py,poly[0],poly[1],poly[2]) || inTri(px,py,poly[0],poly[2],poly[3]);
}
function inTri(px,py,a,b,c){
  const s=(a.x-c.x)*(py-c.y)-(a.y-c.y)*(px-c.x);
  const t=(b.x-a.x)*(py-a.y)-(b.y-a.y)*(px-a.x);
  const u=(c.x-b.x)*(py-b.y)-(c.y-b.y)*(px-b.x);
  const neg=(s<0)||(t<0)||(u<0), pos=(s>0)||(t>0)||(u>0);
  return !(neg&&pos);
}
function windowResized(){ redraw(); }

/* ============================================================================
   LEGEND (p5 instance mode)
============================================================================ */
function legendSketch(p){
  let W=10,H=10;
  let transL=0, transLTgt=0;

  window.__legendCtl = { setTarget:(t)=>{ transLTgt=t; } };

  p.setup = function(){
    p.createCanvas(10,10).parent('legend-canvas-holder');
  };

  function sizeToHolder(){
    const holder=document.getElementById('legend-canvas-holder');
    W=holder.clientWidth; H=holder.clientHeight;
    p.resizeCanvas(W,H);
  }

  p.draw = function(){
    sizeToHolder();
    p.background(0);

    transLTgt = (window.mode==='incidenti') ? 0 : 1;
    transL = p.lerp(transL, transLTgt, 0.12);

    const cx=W*0.5, baseY=H*0.58;
    const side=Math.min(W,H)*0.28, half=side/2;
    const grow = easeOut(clamp((transL-0.55)/0.45,0,1));
    const Hside = side * grow * 1.15;

    const angle  = (p.PI/4) * easeOut(clamp((transL-0.00)/0.35, 0, 1));
    const squash = p.lerp(1, 0.40,          easeOut(clamp((transL-0.35)/0.20, 0, 1)));

    const base=[{x:-half,y:-half},{x:+half,y:-half},{x:+half,y:+half},{x:-half,y:+half}];
    function rot(pt,lift){
      const c=Math.cos(angle), s=Math.sin(angle);
      const rx=pt.x*c - pt.y*s;
      const ry=(pt.x*s + pt.y*c)*squash;
      return {x:cx+rx,y:(baseY-lift)+ry};
    }

    const p0=rot(base[0],Hside), p1=rot(base[1],Hside), p2=rot(base[2],Hside), p3=rot(base[3],Hside);

    const sideH = Hside;
    const L = [
      { x: p3.x, y: p3.y },
      { x: p0.x, y: p0.y },
      { x: p2.x, y: p2.y + sideH },
      { x: p3.x, y: p3.y + sideH }
    ];
    const R = [
      { x: p1.x, y: p1.y },
      { x: p2.x, y: p2.y },
      { x: p2.x, y: p2.y + sideH },
      { x: p1.x, y: p1.y + sideH }
    ];

    const F = [
      { x: p0.x, y: p0.y + sideH },
      { x: p1.x, y: p1.y + sideH },
      { x: p2.x, y: p2.y + sideH },
      { x: p3.x, y: p3.y + sideH }
    ];

    p.noStroke();
    p.fill(0);

    if (transL < 0.5){
      const q0 = { x: cx - half, y: baseY - half };
      const q1 = { x: cx + half, y: baseY - half };
      const q2 = { x: cx + half, y: baseY + half };
      const q3 = { x: cx - half, y: baseY + half };
      p.quad(q0.x, q0.y, q1.x, q1.y, q2.x, q2.y, q3.x, q3.y);
      p.stroke(255);
      p.strokeWeight(3);
      p.noFill();
      p.quad(q0.x, q0.y, q1.x, q1.y, q2.x, q2.y, q3.x, q3.y);
    } else {
      p.quad(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      p.quad(L[0].x, L[0].y, L[1].x, L[1].y, L[2].x, L[2].y, L[3].x, L[3].y);
      p.quad(R[0].x, R[0].y, R[1].x, R[1].y, R[2].x, R[2].y, R[3].x, R[3].y);
      p.quad(F[0].x, F[0].y, F[1].x, F[1].y, F[2].x, F[2].y, F[3].x, F[3].y);

      p.stroke(255);
      p.strokeWeight(3);
      p.line(p0.x, p0.y, p1.x, p1.y);
      p.line(p2.x, p2.y, p3.x, p3.y);
      p.line(p3.x, p3.y, p0.x, p0.y);
      p.line(p0.x, p0.y, p3.x, p3.y);
      p.line(p1.x, p1.y, p2.x, p2.y);
      p.line(F[2].x, F[2].y, p2.x, p2.y);
      p.line(R[0].x, R[0].y, R[1].x, R[1].y);

      p.strokeWeight(3);
      p.noFill();
      p.beginShape();
      p.vertex(p0.x, p0.y);
      p.vertex(p1.x, p1.y);
      p.vertex(F[1].x, F[1].y);
      p.vertex(F[2].x, F[2].y);
      p.vertex(F[3].x, F[3].y);
      p.vertex(p3.x, p3.y);
      p.endShape(p.CLOSE);
    }
  };

  p.windowResized = function(){ p.redraw(); };
}
