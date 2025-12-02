// ========================================
// VARIABILI GLOBALI
// ========================================

let lcdFont;
let csvData;

// Scroll
let scrollY = 0;
let scrollTarget = -1;
let scrollVelocita = 15;
let lastScrollY = 0;

// Sezione 1: Intro
let introCaratteriVisibili = 0;
//testo nelle variabili perchè deve avere l'animazione di comparsa lettera per lettera
let introTestoCompleto = 'LA SITUAZIONE DEGLI INCIDENTI STRADALI\nIN ITALIA È PIÚ GRANDE DI CIÒ CHE PENSIAMO';
let sottotitoloOpacita = 0;
let introOpacita = 255;

// Sezione 2: Quadrato
let quadratoDimensione = 0;
let quadratoCaratteriVisibili = 0;
let quadratoTestoCompleto = 'QUESTO QUADRATO RAPPRESENTA\n300 INCIDENTI';
let quadratoFrecciaOpacita = 0;

// Sezione 3: "Ma sai quanti sono ogni anno?"
let terzaSezioneTitoloOpacita = 0;
let terzaSezioneSottotitoloOpacita = 0;
let terzaSezioneCaratteriVisibili = 0;
let terzaSezioneTestoCompleto = 'MA SAI QUANTI SONO OGNI ANNO?';

// Sezione 4: Griglia incidenti
let numeroTotaleQuadratini = 0;
let numeroTotaleIncidenti = 0;
let counterAttuale = 0;

// Sezione 5: Cubo feriti
let quintaSezioneCaratteriVisibili = 0;
let quintaSezioneTestoCompleto = 'E PER OGNI 300 INCIDENTI\n 790 LESIONATI';
let cuboRotazione = 0;
let cuboAnimazioneAutomatica = false;
let cuboAnimazioneInizio = 0;

// Sezione 6: Counter giornaliero
let incidentiOggi = 0;
let mortiOggi = 0;
let feritiOggi = 0;
let animIncidenti = 0;
let animMorti = 0;
let animFeriti = 0;
let sestaSezioneOpacita = 0;
let counterAnimazioneAutomatica = false;
let counterAnimazioneInizio = 0;

// Sezione 7: Griglia responsabilità
let animRegroupActive = false;
let animRegroupProgress = 0;
let animRegroupTarget = 0;

// ========================================
// SETUP E PRELOAD
// ========================================

function preload() {
  lcdFont = loadFont('Assets/Fonts/LCD5x7VF.ttf');
  csvData = loadTable('Assets/Datasets/Incidenti-totale.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(lcdFont);
  textAlign(CENTER, CENTER);
  
  // Carica dati dal CSV
  for (let i = 0; i < csvData.getRowCount(); i++) {
    let classe = csvData.getString(i, 'Classe').trim();
    if (classe === 'Totale') {
      numeroTotaleQuadratini = int(csvData.getString(i, 'I/300'));
      let incidentiStringa = csvData.getString(i, 'Incidenti').replace(/\s/g, '').replace(/\./g, '');
      numeroTotaleIncidenti = int(incidentiStringa);
      
      let incidentiTotali = parseInt(csvData.getString(i, 'Incidenti').replace(/[\s.]/g, ''));
      let mortiTotali = parseInt(csvData.getString(i, 'Morti').replace(/[\s.]/g, ''));
      let feritiTotali = parseInt(csvData.getString(i, 'Feriti').replace(/[\s.]/g, ''));

      incidentiOggi = floor(incidentiTotali / 366);
      mortiOggi = floor(mortiTotali / 366);
      feritiOggi = floor(feritiTotali / 366);
      break;
    }
  }
  
  document.body.style.height = '6000px';
  document.body.style.overflow = 'auto';
}

function mouseWheel(event) {
  scrollY += event.delta;
  scrollY = constrain(scrollY, 0, 6000);
  return false;
}

// ========================================
// DRAW PRINCIPALE
// ========================================

function draw() {
  background(0);
  
  // Gestione scroll automatico
  handleAutoScroll();
  
  // Aggiorna animazioni caratteri
  updateCharacterAnimations();
  
  // Calcola parametri sezioni
  let navbarOpacita = calcNavbarOpacity();
  let sezioneAttiva = calcActiveSection();
  let quadratoFadeOut = calcQuadratoFadeOut();
  let quadratoTestoOpacita = calcQuadratoTextOpacity();
  let terzaSezioneFadeOut = calcTerzaSezioneFadeOut();
  
  // Disegna sezioni in ordine
  drawSezioneIntro();
  drawNavbar(navbarOpacita, sezioneAttiva);
  drawSezioneQuadrato(quadratoFadeOut, quadratoTestoOpacita);
  drawSezioneTerza(terzaSezioneFadeOut);
  drawSezioneGrigliaIncidenti();
  drawSezioneQuinta();
  drawSezioneSesta();
  drawSezioneSettima();
  
  // Aggiorna animazioni
  updateAnimations();
  
  // Debug
  drawDebugInfo();
}

// ========================================
// FUNZIONI DI UTILITÀ
// ========================================

function handleAutoScroll() { //scroll automatico 
  if (scrollTarget > -1) {
    if (abs(scrollY - scrollTarget) > scrollVelocita) {
      if (scrollY < scrollTarget) {
        scrollY += scrollVelocita;
      } else {
        scrollY -= scrollVelocita;
      }
    } else {
      scrollY = scrollTarget;
      scrollTarget = -1;
    }
  }
}

function updateCharacterAnimations() { //animazione scritte che si scrivono
  // Intro
  if (frameCount % 2 == 0 && introCaratteriVisibili < introTestoCompleto.length) {
    introCaratteriVisibili++;
  }
  
  if (introCaratteriVisibili >= introTestoCompleto.length && sottotitoloOpacita < 255) {
    sottotitoloOpacita += 1;
  }
  
  // Quadrato
  if (scrollY > 50) {
    introOpacita = map(scrollY, 50, 300, 255, 0);
    introOpacita = constrain(introOpacita, 0, 255);
    quadratoDimensione = map(scrollY, 300, 600, 0, 200);
    quadratoDimensione = constrain(quadratoDimensione, 0, 200);
  }
  
  if (quadratoDimensione >= 200) {
    if (frameCount % 2 == 0 && quadratoCaratteriVisibili < quadratoTestoCompleto.length) {
      quadratoCaratteriVisibili++;
    }
  } else {
    quadratoCaratteriVisibili = 0;
  }
  
  if (quadratoCaratteriVisibili >= quadratoTestoCompleto.length && quadratoFrecciaOpacita < 255) {
    quadratoFrecciaOpacita += 3;
  } else if (quadratoCaratteriVisibili < quadratoTestoCompleto.length) {
    quadratoFrecciaOpacita = 0;
  }
  
  // Terza sezione
  if (scrollY > 1100 && scrollY < 1300) {
    terzaSezioneTitoloOpacita = map(scrollY, 1100, 1300, 0, 255);
    terzaSezioneTitoloOpacita = constrain(terzaSezioneTitoloOpacita, 0, 255);
    
    if (frameCount % 2 === 0 && terzaSezioneCaratteriVisibili < terzaSezioneTestoCompleto.length) {
      terzaSezioneCaratteriVisibili++;
    }
    
    terzaSezioneSottotitoloOpacita = map(scrollY, 1200, 1400, 0, 255);
    terzaSezioneSottotitoloOpacita = constrain(terzaSezioneSottotitoloOpacita, 0, 255);
  } else if (scrollY >= 1300) {
    terzaSezioneTitoloOpacita = 255;
    terzaSezioneCaratteriVisibili = terzaSezioneTestoCompleto.length;
    terzaSezioneSottotitoloOpacita = map(scrollY, 1200, 1400, 0, 255);
    terzaSezioneSottotitoloOpacita = constrain(terzaSezioneSottotitoloOpacita, 0, 255);
  } else {
    terzaSezioneTitoloOpacita = 0;
    terzaSezioneCaratteriVisibili = 0;
    terzaSezioneSottotitoloOpacita = 0;
  }
  
  // Quinta sezione testo
  if (scrollY > 3200 && scrollY < 3600) {
    if (frameCount % 2 === 0 && quintaSezioneCaratteriVisibili < quintaSezioneTestoCompleto.length) {
      quintaSezioneCaratteriVisibili++;
    }
  } else if (scrollY >= 3600) {
    quintaSezioneCaratteriVisibili = quintaSezioneTestoCompleto.length;
  } else {
    quintaSezioneCaratteriVisibili = 0;
  }
}

function calcNavbarOpacity() { // effetto opacità navbar
  let opacity = map(scrollY, 300, 600, 0, 255);
  return constrain(opacity, 0, 255);
} 

function calcActiveSection() { // calcola dove sono e lo segna per la navbar
  if (scrollY < 1600) return 0;
  else if (scrollY < 4300) return 1;
  else return 2;
}

function calcQuadratoFadeOut() {
  if (scrollY > 900) {
    let fade = map(scrollY, 900, 1000, 255, 0);
    return constrain(fade, 0, 255);
  }
  return 255;
}

function calcQuadratoTextOpacity() {
  if (quadratoDimensione >= 200) {
    let opacity = map(scrollY, 600, 800, 0, 255);
    return constrain(opacity, 0, 255);
  }
  return 0;
}

function calcTerzaSezioneFadeOut() {
  if (scrollY > 1500) {
    let fade = map(scrollY, 1500, 1600, 255, 0);
    return constrain(fade, 0, 255);
  }
  return 255;
}

function updateAnimations() {
  // Animazione cubo
  if (scrollY >= 3150 && !cuboAnimazioneAutomatica) {
    cuboAnimazioneAutomatica = true;
    cuboAnimazioneInizio = frameCount;
  } else if (scrollY < 3000) {
    cuboAnimazioneAutomatica = false;
    cuboRotazione = 0;
  }
  
  if (cuboAnimazioneAutomatica) {
    let framePassati = frameCount - cuboAnimazioneInizio;
    cuboRotazione = map(framePassati, 0, 240, 0, 1);
    cuboRotazione = constrain(cuboRotazione, 0, 1);
  } else if (scrollY > 3000 && scrollY < 3150) {
    cuboRotazione = map(scrollY, 3000, 3150, 0, 0.02);
    cuboRotazione = constrain(cuboRotazione, 0, 0.02);
  }
  
  // Animazione counter giornaliero
  if (scrollY > 4100 && !counterAnimazioneAutomatica) {
    counterAnimazioneAutomatica = true;
    counterAnimazioneInizio = frameCount;
  } else if (scrollY < 4100) {
    counterAnimazioneAutomatica = false;
    animIncidenti = 0;
    animMorti = 0;
    animFeriti = 0;
  }
  
  if (counterAnimazioneAutomatica) {
    let now = new Date();
    let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let secondiTotali = 24 * 3600;
    let progress = secondiOggi / secondiTotali;

    let targetIncidenti = incidentiOggi * progress;
    let targetMorti = mortiOggi * progress;
    let targetFeriti = feritiOggi * progress;

    if (frameCount - counterAnimazioneInizio < 120) {
      animIncidenti += (targetIncidenti - animIncidenti) * 0.1;
      animMorti += (targetMorti - animMorti) * 0.1;
      animFeriti += (targetFeriti - animFeriti) * 0.1;
    } else {
      animIncidenti = targetIncidenti;
      animMorti = targetMorti;
      animFeriti = targetFeriti;
    }
  }
  
  // Animazione regroup
  if (scrollY > 5600) {
    animRegroupTarget = 1;
  } else {
    animRegroupTarget = 0;
  }
  let speed = 0.07;
  animRegroupProgress += (animRegroupTarget - animRegroupProgress) * speed;
  animRegroupProgress = constrain(animRegroupProgress, 0, 1);
  lastScrollY = scrollY;
}

// ========================================
// FUNZIONI DI DISEGNO SEZIONI
// ========================================

function drawSezioneIntro() {
  // Testo intro
  fill(255, 122, 0, introOpacita);
  let testoMostrato = introTestoCompleto.substring(0, introCaratteriVisibili);
  let txtSize = width * 0.025;
  txtSize = constrain(txtSize, 12, 60);
  textSize(txtSize);
  textLeading(txtSize * 1.4);
  text(testoMostrato, width / 2, height / 2);
  
  // Sottotitolo e freccia
  if (sottotitoloOpacita > 0) {
    push();
    textFont('Helvetica');
    textSize(16);
    fill(255, 255, 255, min(sottotitoloOpacita, introOpacita));
    text('Scoprila analizzando i dati ISTAT del 2024', width / 2, height - 70);
    
    let oscillazione = sin(frameCount * 0.05) * 5;
    let frecciaY = height - 45 + oscillazione;
    fill(255, 255, 255, min(sottotitoloOpacita, introOpacita));
    triangle(width / 2, frecciaY + 10, width / 2 - 8, frecciaY, width / 2 + 8, frecciaY);
    pop();
  }
}

function drawNavbar(navbarOpacita, sezioneAttiva) {
  if (navbarOpacita <= 0) return;
  
  push();
  textFont('Helvetica');
  textSize(14);
  textAlign(CENTER, TOP);
  
  let spaziatura = width / 4;
  let startX = width / 4;

  fill(sezioneAttiva == 0 ? color(255, 122, 0, navbarOpacita) : color(255, 255, 255, navbarOpacita));
  text('Intro', startX, 20);

  fill(sezioneAttiva == 1 ? color(255, 122, 0, navbarOpacita) : color(255, 255, 255, navbarOpacita));
  text('Incidenti', startX + spaziatura, 20);

  fill(sezioneAttiva == 2 ? color(255, 122, 0, navbarOpacita) : color(255, 255, 255, navbarOpacita));
  text('Responsabilità', startX + spaziatura * 2, 20);
  pop();
}

function drawSezioneQuadrato(quadratoFadeOut, quadratoTestoOpacita) {
  // Quadrato bianco
  if (quadratoDimensione > 0) {
    push();
    rectMode(CENTER);
    fill(255, 255, 255, quadratoFadeOut);
    rect(width / 2, height / 2, quadratoDimensione, quadratoDimensione);
    pop();
  }
  
  // Testo sotto quadrato
  if (quadratoCaratteriVisibili > 0 && quadratoTestoOpacita > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, TOP);
    let txtSize = width * 0.018;
    txtSize = constrain(txtSize, 12, 30);
    textSize(txtSize);
    textLeading(txtSize * 1.3);
    fill(255, 122, 0, min(quadratoTestoOpacita, quadratoFadeOut));
    let testoMostrato = quadratoTestoCompleto.substring(0, quadratoCaratteriVisibili);
    text(testoMostrato, width / 2, height / 2 + quadratoDimensione / 2 + 20);
    pop();
  }
  
  // Freccia
  if (quadratoFrecciaOpacita > 0) {
    push();
    let oscillazione = sin(frameCount * 0.05) * 5;
    let frecciaY = height - 45 + oscillazione;
    fill(255, 255, 255, min(quadratoFrecciaOpacita, quadratoTestoOpacita, quadratoFadeOut));
    triangle(width / 2, frecciaY + 10, width / 2 - 8, frecciaY, width / 2 + 8, frecciaY);
    pop();
  }
}

function drawSezioneTerza(terzaSezioneFadeOut) {
  // Titolo
  if (terzaSezioneCaratteriVisibili > 0 && terzaSezioneTitoloOpacita > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, CENTER);
    let txtSize = width * 0.03;
    txtSize = constrain(txtSize, 16, 70);
    textSize(txtSize);
    fill(255, 122, 0, min(terzaSezioneTitoloOpacita, terzaSezioneFadeOut));
    let testoMostrato = terzaSezioneTestoCompleto.substring(0, terzaSezioneCaratteriVisibili);
    text(testoMostrato, width / 2, height / 2 - 30);
    pop();
  }
  
  // Sottotitolo
  if (terzaSezioneSottotitoloOpacita > 0) {
    push();
    textFont('Helvetica');
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(255, 255, 255, min(terzaSezioneSottotitoloOpacita, terzaSezioneFadeOut));
    text('Prova a scorrere...', width / 2, height / 2 + 30);
    pop();
  }
}

function drawSezioneGrigliaIncidenti() {
  // Calcola numero quadratini visibili
  let numeroQuadratiniVisibili = 0;
  if (scrollY > 1600 && scrollY < 2800) {
    let progressione = map(scrollY, 1600, 2800, 0, numeroTotaleIncidenti);
    counterAttuale = floor(progressione);
    let progressioneQuadratini = map(scrollY, 1600, 2800, 0, numeroTotaleQuadratini);
    numeroQuadratiniVisibili = floor(progressioneQuadratini);
  } else if (scrollY >= 2800) {
    numeroQuadratiniVisibili = numeroTotaleQuadratini;
    counterAttuale = numeroTotaleIncidenti;
  } else {
    numeroQuadratiniVisibili = 0;
    counterAttuale = 0;
  }
  
  // Layout griglia
  let dimensioneQuadratino = width * 0.008;
  dimensioneQuadratino = constrain(dimensioneQuadratino, 8, 15);
  let spaziatura = dimensioneQuadratino * 0.5;
  let quadratiniPerRiga = floor(width * 0.4 / (dimensioneQuadratino + spaziatura));
  quadratiniPerRiga = constrain(quadratiniPerRiga, 30, 60);
  let numeroRighe = ceil(numeroTotaleQuadratini / quadratiniPerRiga);
  
  let larghezzaGriglia = quadratiniPerRiga * (dimensioneQuadratino + spaziatura);
  let altezzaGriglia = numeroRighe * (dimensioneQuadratino + spaziatura);
  let startX = (width - larghezzaGriglia) / 2;
  let startY = (height - altezzaGriglia) / 2;
  
  // Fade out
  let grigliaFadeOut = 255;
  if (scrollY > 2900) {
    grigliaFadeOut = map(scrollY, 2900, 3000, 255, 0);
    grigliaFadeOut = constrain(grigliaFadeOut, 0, 255);
  }
  
  // Counter
  if (counterAttuale > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, BOTTOM);
    let txtSize = width * 0.04;
    txtSize = constrain(txtSize, 20, 80);
    textSize(txtSize);
    fill(255, 122, 0, grigliaFadeOut);
    let numeroFormattato = counterAttuale.toLocaleString('it-IT');
    text(numeroFormattato, width / 2, startY - 20);
    pop();
  }
  
  // Griglia
  if (numeroQuadratiniVisibili > 0) {
    push();
    fill(255, 255, 255, grigliaFadeOut);
    noStroke();
    
    for (let i = 0; i < numeroQuadratiniVisibili; i++) {
      let riga = floor(i / quadratiniPerRiga);
      let colonna = i % quadratiniPerRiga;
      let x = startX + colonna * (dimensioneQuadratino + spaziatura);
      let y = startY + riga * (dimensioneQuadratino + spaziatura);
      rect(x, y, dimensioneQuadratino, dimensioneQuadratino);
    }
    pop();
  }
}

function drawSezioneQuinta() {
  // Opacità
  let quintaSezioneOpacita = 0;
  if (scrollY > 3000 && scrollY < 3100) {
    quintaSezioneOpacita = map(scrollY, 3000, 3100, 0, 255);
    quintaSezioneOpacita = constrain(quintaSezioneOpacita, 0, 255);
  } else if (scrollY >= 3100) {
    quintaSezioneOpacita = 255;
  }
  
  // Fade out
  let quintaSezioneFadeOut = 255;
  if (scrollY > 3700) {
    quintaSezioneFadeOut = map(scrollY, 3700, 3800, 255, 0);
    quintaSezioneFadeOut = constrain(quintaSezioneFadeOut, 0, 255);
  }
  
  // Cubo
  if (cuboRotazione > 0) {
    drawCubo(quintaSezioneOpacita, quintaSezioneFadeOut);
  }
  
  // Testo
  if (quintaSezioneCaratteriVisibili > 0 && quintaSezioneOpacita > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, CENTER);
    let txtSize = width * 0.03;
    txtSize = constrain(txtSize, 16, 70);
    textSize(txtSize);
    textLeading(txtSize * 1.4);
    fill(255, 122, 0, min(quintaSezioneOpacita, quintaSezioneFadeOut));
    let testoMostrato = quintaSezioneTestoCompleto.substring(0, quintaSezioneCaratteriVisibili);
    text(testoMostrato, width / 2, height / 2 - 120);
    pop();
  }
}

function drawCubo(quintaSezioneOpacita, quintaSezioneFadeOut) {
  push();
  translate(width / 2, height / 2 + 80);
  
  let semilatoQuadrato = 100;
  let easingRallentamento = (tempo) => 1 - pow(1 - tempo, 3);
  
  let progressioneAnimazione = cuboRotazione;
  let angoloRotazione = lerp(0, PI/4, easingRallentamento(constrain((progressioneAnimazione - 0.143) / 0.286, 0, 1)));
  let fattoreSchiacciamento = lerp(1, 0.38, easingRallentamento(constrain((progressioneAnimazione - 0.429) / 0.142, 0, 1)));
  let altezzaLatiVerticali = lerp(0, semilatoQuadrato * 1.7, easingRallentamento(constrain((progressioneAnimazione - 0.571) / 0.429, 0, 1)));
  
  let puntiBaseQuadrato = [
    {x: -semilatoQuadrato, y: -semilatoQuadrato}, {x: semilatoQuadrato, y: -semilatoQuadrato},
    {x: semilatoQuadrato, y: semilatoQuadrato}, {x: -semilatoQuadrato, y: semilatoQuadrato}
  ];
  
  let applicaRotazioneESchiacciamento = (punto) => {
    let coseno = cos(angoloRotazione), seno = sin(angoloRotazione);
    let xRuotato = punto.x * coseno - punto.y * seno;
    let yRuotato = (punto.x * seno + punto.y * coseno) * fattoreSchiacciamento;
    return {x: xRuotato, y: yRuotato};
  };
  
  let puntoAltoSinistra = applicaRotazioneESchiacciamento(puntiBaseQuadrato[0]);
  let puntoAltoDestra = applicaRotazioneESchiacciamento(puntiBaseQuadrato[1]);
  let puntoBassoDestro = applicaRotazioneESchiacciamento(puntiBaseQuadrato[2]);
  let puntoBassoSinistra = applicaRotazioneESchiacciamento(puntiBaseQuadrato[3]);
  
  // Facce arancioni
  if (altezzaLatiVerticali > 0) {
    fill(255, 122, 0, quintaSezioneFadeOut);
    
    // Faccia sinistra
    quad(
      puntoBassoSinistra.x, puntoBassoSinistra.y,
      puntoBassoDestro.x, puntoBassoDestro.y,
      puntoBassoDestro.x, puntoBassoDestro.y + altezzaLatiVerticali,
      puntoBassoSinistra.x, puntoBassoSinistra.y + altezzaLatiVerticali
    );
    
    // Faccia destra
    quad(
      puntoBassoDestro.x, puntoBassoDestro.y,
      puntoAltoDestra.x, puntoAltoDestra.y,
      puntoAltoDestra.x, puntoAltoDestra.y + altezzaLatiVerticali,
      puntoBassoDestro.x, puntoBassoDestro.y + altezzaLatiVerticali
    );
  }
  
  // Top bianco
  fill(255, 255, 255, min(quintaSezioneOpacita, quintaSezioneFadeOut));
  quad(
    puntoAltoSinistra.x, puntoAltoSinistra.y,
    puntoAltoDestra.x, puntoAltoDestra.y,
    puntoBassoDestro.x, puntoBassoDestro.y,
    puntoBassoSinistra.x, puntoBassoSinistra.y
  );
  
  pop();
}

function drawSezioneSesta() {
  // Fade-in sezione
  if (scrollY > 3900 && scrollY < 4100) {
    sestaSezioneOpacita = map(scrollY, 3900, 4100, 0, 255);
    sestaSezioneOpacita = constrain(sestaSezioneOpacita, 0, 255);
  } else if (scrollY >= 4100) {
    sestaSezioneOpacita = 255;
  } else {
    sestaSezioneOpacita = 0;
  }
  
  // Fade out counter
  let counterFadeOut = 255;
  if (scrollY > 4300 && scrollY < 4600) {
    counterFadeOut = map(scrollY, 4300, 4600, 255, 0);
    counterFadeOut = constrain(counterFadeOut, 0, 255);
  } else if (scrollY >= 4600) {
    counterFadeOut = 0;
  } else {
    counterFadeOut = sestaSezioneOpacita;
  }
  
  // Disegna counter
  if (counterFadeOut > 0) {
    push();
    textAlign(CENTER, CENTER);
    textFont(lcdFont);

    fill(255, 255, 255, counterFadeOut);
    textSize(width * 0.03);
    text("PENSA CHE SOLO OGGI:", width / 2, height * 0.3);

    fill(255, 122, 0, counterFadeOut);
    textSize(width * 0.06);
    text(floor(animIncidenti), width * 0.25, height * 0.5);
    text(floor(animMorti), width * 0.50, height * 0.5);
    text(floor(animFeriti), width * 0.75, height * 0.5);

    textSize(width * 0.03);
    fill(255, 255, 255, counterFadeOut);
    text("INCIDENTI", width * 0.25, height * 0.7);
    text("MORTI", width * 0.50, height * 0.7);
    text("FERITI", width * 0.75, height * 0.7);
    pop();
  }
  
  // Fade in "MA DI CHI È LA COLPA?"
  let colpaFadeIn = 0;
  if (scrollY >= 4600 && scrollY < 4800) {
    colpaFadeIn = map(scrollY, 4600, 4800, 0, 255);
    colpaFadeIn = constrain(colpaFadeIn, 0, 255);
  } else if (scrollY >= 4800) {
    colpaFadeIn = 255;
  }
  
  // Fade out "MA DI CHI È LA COLPA?"
  let colpaFadeOut = 255;
  if (scrollY > 4900 && scrollY < 5200) {
    colpaFadeOut = map(scrollY, 4900, 5200, 255, 0);
    colpaFadeOut = constrain(colpaFadeOut, 0, 255);
  } else if (scrollY >= 5200) {
    colpaFadeOut = 0;
  } else {
    colpaFadeOut = colpaFadeIn;
  }
  
  if (colpaFadeOut > 0) {
    push();
    textAlign(CENTER, CENTER);
    textFont(lcdFont);
    textSize(width * 0.05);
    fill(255, 122, 0, colpaFadeOut);
    text("MA DI CHI È LA COLPA?", width / 2, height / 2);
    pop();
  }
}

function drawSezioneSettima() {
  // Fade in griglia
  let grigliaFadeIn = 0;
  if (scrollY > 5200 && scrollY < 5400) {
    grigliaFadeIn = map(scrollY, 5200, 5400, 0, 255);
    grigliaFadeIn = constrain(grigliaFadeIn, 0, 255);
    animRegroupActive = true;
  } else if (scrollY >= 5400) {
    grigliaFadeIn = 255;
    animRegroupActive = true;
  } else {
    grigliaFadeIn = 0;
    animRegroupActive = false;
  }
  
  if (grigliaFadeIn <= 0) return;
  
  // Estrai dati dal CSV
  let quadConducenti = 0, quadCauseEsterne = 0, quadNonConducenti = 0;
  for (let i = 0; i < csvData.getRowCount(); i++) {
    let classe = csvData.getString(i, 'Classe').trim().toLowerCase();
    if (classe === 'conducenti') {
      quadConducenti = int(csvData.getString(i, 'I/300'));
    } else if (classe === 'cause-esterne-concomitanti') {
      quadCauseEsterne = int(csvData.getString(i, 'I/300'));
    } else if (classe === 'non-conducenti') {
      quadNonConducenti = int(csvData.getString(i, 'I/300'));
    }
  }
  const quadTotale = quadConducenti + quadCauseEsterne + quadNonConducenti;
  
  // Colori
  const coloreBlu = color(0, 161, 241);
  const coloreVerde = color(51, 187, 68);
  const coloreRosa = color(253, 115, 237);
  
  // Layout
  let dimensioneQuadratino = width * 0.008;
  dimensioneQuadratino = constrain(dimensioneQuadratino, 8, 15);
  let spaziatura = dimensioneQuadratino * 0.5;
  let quadratiniPerRiga = floor(width * 0.4 / (dimensioneQuadratino + spaziatura));
  quadratiniPerRiga = constrain(quadratiniPerRiga, 30, 60);
  let numeroRighe = ceil(numeroTotaleQuadratini / quadratiniPerRiga);
  
  const quadPerRiga = quadratiniPerRiga;
  const quadSize = dimensioneQuadratino;
  const quadSpacing = spaziatura;
  
  // Crea array colori mischiati
  if (typeof window.coloriQuadratiniMischiati === 'undefined' || scrollY < 5200) {
    let arr = [];
    for (let i = 0; i < quadConducenti; i++) arr.push(coloreBlu);
    for (let i = 0; i < quadCauseEsterne; i++) arr.push(coloreVerde);
    for (let i = 0; i < quadNonConducenti; i++) arr.push(coloreRosa);
    
    for (let i = arr.length - 1; i > 0; i--) {
      let j = floor(random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    window.coloriQuadratiniMischiati = arr;
  }
  let coloriQuadratini = window.coloriQuadratiniMischiati;
  
  // Disegna griglia
  let animProgress = floor(map(grigliaFadeIn, 0, 255, 0, quadTotale));
  let x0 = (width - quadPerRiga * (quadSize + quadSpacing)) / 2;
  let y0 = (height - numeroRighe * (quadSize + quadSpacing)) / 2 + 100;
  rectMode(CORNER);
  
  // Layout 3 griglie
  let groupSpacing = quadSize * 8;
  function getWideGridDims(count) {
    let cols = min(15, count);
    let rows = ceil(count / cols);
    return {cols, rows};
  }
  let blueDims = getWideGridDims(quadConducenti);
  let greenDims = getWideGridDims(quadCauseEsterne);
  let pinkDims = getWideGridDims(quadNonConducenti);
  
  let totalWidth = blueDims.cols * (quadSize + quadSpacing) + groupSpacing + 
                   greenDims.cols * (quadSize + quadSpacing) + groupSpacing + 
                   pinkDims.cols * (quadSize + quadSpacing);
  let startX = (width - totalWidth) / 2;
  let topY = height / 2 - max(blueDims.rows, greenDims.rows, pinkDims.rows) * (quadSize + quadSpacing) / 2 + 100;
  
  let blueStartX = startX;
  let greenStartX = blueStartX + blueDims.cols * (quadSize + quadSpacing) + groupSpacing;
  let pinkStartX = greenStartX + greenDims.cols * (quadSize + quadSpacing) + groupSpacing;
  
  let blueIdx = 0, greenIdx = 0, pinkIdx = 0;
  for (let i = 0; i < quadTotale && i < animProgress; i++) {
    let r = floor(i / quadPerRiga);
    let c = i % quadPerRiga;
    let xStartGrid = x0 + c * (quadSize + quadSpacing);
    let yStartGrid = y0 + r * (quadSize + quadSpacing);
    
    let fillCol = coloriQuadratini[i];
    let xDest, yDest;
    
    if (red(fillCol) === 0 && green(fillCol) === 161) {
      let row = floor(blueIdx / blueDims.cols);
      let col = blueIdx % blueDims.cols;
      xDest = blueStartX + col * (quadSize + quadSpacing);
      yDest = topY + row * (quadSize + quadSpacing);
      blueIdx++;
    } else if (red(fillCol) === 51 && green(fillCol) === 187) {
      let row = floor(greenIdx / greenDims.cols);
      let col = greenIdx % greenDims.cols;
      xDest = greenStartX + col * (quadSize + quadSpacing);
      yDest = topY + row * (quadSize + quadSpacing);
      greenIdx++;
    } else {
      let row = floor(pinkIdx / pinkDims.cols);
      let col = pinkIdx % pinkDims.cols;
      xDest = pinkStartX + col * (quadSize + quadSpacing);
      yDest = topY + row * (quadSize + quadSpacing);
      pinkIdx++;
    }
    
    let x = xStartGrid;
    let y = yStartGrid;
    if (animRegroupActive) {
      x = lerp(xStartGrid, xDest, animRegroupProgress);
      y = lerp(yStartGrid, yDest, animRegroupProgress);
    }
    
    fill(red(fillCol), green(fillCol), blue(fillCol), grigliaFadeIn);
    noStroke();
    rect(x, y, quadSize, quadSize);
  }
}

function drawDebugInfo() {
  push();
  textFont('Courier');
  textAlign(RIGHT, BOTTOM);
  textSize(14);
  fill(255, 122, 0, 150);
  text('scrollY: ' + floor(scrollY), width - 10, height - 10);
  pop();
}

// ========================================
// EVENT HANDLERS
// ========================================

function mouseClicked() {
  let frecciaY = height - 45;
  let distanza = dist(mouseX, mouseY, width / 2, frecciaY);
  
  if (distanza < 20) {
    if (sottotitoloOpacita > 100 && quadratoFrecciaOpacita < 50) {
      scrollTarget = 800;
    } else if (quadratoFrecciaOpacita > 100) {
      scrollTarget = 1400;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  document.body.style.height = (windowHeight * 3) + 'px';
}
