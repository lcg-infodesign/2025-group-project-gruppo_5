// ========================================
// VARIABILI GLOBALI
// ========================================

let csvData;
let csvConducenti;
let csvCauseEsterne;
let csvNonConducenti;

// Scroll
let scrollY = 0;
let scrollTarget = -1;
let scrollVelocita = 8; // Ridotto da 15 a 8 per scroll più lento e fluido

// Scroll Snap - Checkpoint per sezioni
let scrollSnapEnabled = true;
let scrollCheckpoints = [
  0,      // Sezione 1: Intro
  800,    // Sezione 2: Quadrato
  1400,   // Sezione 3: "Ma sai quanti sono"
  2900,   // Sezione 4: Griglia incidenti
  3300,   // Sezione 5: Cubo feriti
  3850,   // Sezione 6: Counter giornaliero (500px dopo sez 5)
  4300,   // Dopo counter - "Ma di chi è la colpa?"
  4900,    // Sezione 7: Griglia responsabilità
  5200,   // Sezione 7: divisione per responsabilità
  6500,   // Sezione 8: Dettaglio categoria selezionata (dopo animazione completa)
];
let currentCheckpointIndex = 0;
let isScrolling = false;
let scrollAccumulator = 0;
let scrollThreshold = 100; // Quantità di scroll necessaria per cambiare checkpoint

// Sezione 1: Intro
let introCaratteriVisibili = 0;
//testo nelle variabili perchè deve avere l'animazione di comparsa lettera per lettera
let introTestoCompleto = 'LA REALTÀ DEGLI INCIDENTI STRADALI\nIN ITALIA È PIÚ GRAVE DI QUANTO IMMAGINI';
let sottotitoloOpacita = 0;
let introOpacita = 255;

// Sezione 2: Quadrato
let quadratoDimensione = 0;
let quadratoCaratteriVisibili = 0;
let quadratoTestoCompleto = 'QUESTO QUADRATO RAPPRESENTA\n300 INCIDENTI';

// Sezione 3: "Ma sai quanti sono ogni anno?"
let terzaSezioneTitoloOpacita = 0;
let terzaSezioneSottotitoloOpacita = 0;
let terzaSezioneCaratteriVisibili = 0;
let terzaSezioneTestoCompleto = 'MA SAI QUANTI SONO OGNI ANNO?';

// Sezione 4: Griglia incidenti
let numeroTotaleQuadratini = 0;
let grigliaIncidentiSottotitoloOpacita = 0; // Opacità sottotitolo finale incidenti
let numeroTotaleIncidenti = 0;
let counterAttuale = 0;

// Sezione 5: Cubo feriti
let quintaSezioneCaratteriVisibili = 0;
let quintaSezioneTestoCompleto = 'E OGNUNO DI QUESTI \n HA PROVOCATO MORTI E FERITI';
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
let navbarCounterAttivato = false; // Traccia se il counter navbar è già apparso
let counterAnimazioneCompletata = false; // Traccia se l'animazione iniziale è stata completata

// Sezione 7: Griglia responsabilità
let animRegroupActive = false;
let animRegroupProgress = 0;
let animRegroupTarget = 0;
let dimensioneQuadratino = 0; // Dimensione dei quadratini, calcolata in sezione 7

// Sezione 8: visualizzazione di dettaglio (NON più overlay)
let sezioneOttavaHitboxes = [];
let categoriaSelezionata = null; // 'conducenti' | 'cause-esterne-concomitanti' | 'non-conducenti'
const categorie = ['conducenti', 'cause-esterne-concomitanti', 'non-conducenti'];
let sezioneOttavaSquareHitboxes = []; // hitbox per i quadrati
let showBars = false; // false = quadrati, true = istogramma con barre
let sezioneOttavaTrans = 0; // 0 = quadrati, 1 = parallelepipedi (animazione)
let sezioneOttavaTransTarget = 0; // target per l'animazione
let hoveredSezioneOttavaItem = null; // traccia quale elemento è in hover
let sezioneOttavaFadeIn = 0; // fade in della sezione 8

// Frecce navigazione sezione 8
let frecceSezioneOttava = {
  sinistra: { x: 50, y: 0, size: 40, hover: false },
  destra: { x: 0, y: 0, size: 40, hover: false }
};
let categorieArray = ['conducenti', 'cause-esterne-concomitanti', 'non-conducenti'];

// Animazione transizione sezione 7 -> 8 (tra scroll 5200 e 6500)
let transizioneAttiva = false; // true quando è in corso la transizione
let transizioneProgress = 0; // 0 = inizio (5200), 1 = fine (6500)
let quadratiniTransizione = []; // array con posizioni iniziali e finali di ogni quadratino

// =========================================
// SETUP E PRELOAD
// =========================================

function preload() {
  console.log('Preload started...');
  
  // Carica Fonts con error handling
  loadFont('Assets/Fonts/LCD5x7VF.ttf', 
    (font) => { 
      lcdFont = font; 
      console.log('LCD font loaded'); 
    },
    (err) => { 
      console.error('Error loading LCD font:', err);
      lcdFont = null;
    }
  );
  
  loadFont('Assets/Fonts/NewTransportAAWEBRegular.ttf',
    (font) => { 
      transportFont = font; 
      console.log('Transport font loaded'); 
    },
    (err) => { 
      console.error('Error loading Transport font:', err);
      transportFont = null;
    }
  );
  
  // Carica CSV con error handling
  loadTable('Assets/Datasets/Incidenti-totale.csv', 'csv', 'header',
    (table) => { 
      csvData = table; 
      console.log('Incidenti-totale.csv loaded:', csvData.getRowCount(), 'rows'); 
    },
    (err) => { 
      console.error('Error loading Incidenti-totale.csv:', err);
      csvData = null;
    }
  );
  
  loadTable('Assets/Datasets/Incidenti-conducenti.csv', 'csv', 'header',
    (table) => { 
      csvConducenti = table; 
      console.log('Incidenti-conducenti.csv loaded:', csvConducenti.getRowCount(), 'rows'); 
    },
    (err) => { 
      console.error('Error loading Incidenti-conducenti.csv:', err);
      csvConducenti = null;
    }
  );
  
  loadTable('Assets/Datasets/Incidenti-esterne_concomitanti.csv', 'csv', 'header',
    (table) => { 
      csvCauseEsterne = table; 
      console.log('Incidenti-esterne_concomitanti.csv loaded:', csvCauseEsterne.getRowCount(), 'rows'); 
    },
    (err) => { 
      console.error('Error loading Incidenti-esterne_concomitanti.csv:', err);
      csvCauseEsterne = null;
    }
  );
  
  loadTable('Assets/Datasets/Incidenti-persone.csv', 'csv', 'header',
    (table) => { 
      csvNonConducenti = table; 
      console.log('Incidenti-persone.csv loaded:', csvNonConducenti.getRowCount(), 'rows'); 
    },
    (err) => { 
      console.error('Error loading Incidenti-persone.csv:', err);
      csvNonConducenti = null;
    }
  );
}

function setup() {
  console.log('🎨 Setup started...');
  
  createCanvas(windowWidth, windowHeight);
  
  // Verifica che i file siano caricati
  if (!lcdFont) {
    console.warn('LCD font not loaded, using default font');
  } else {
    textFont(lcdFont);
  }
  
  if (!transportFont) {
    console.warn('Transport font not loaded');
  }
  
  if (!csvData) {
    console.error('CRITICAL: csvData not loaded! Animation will not work properly.');
  }
  
  textAlign(CENTER, CENTER);
  
  // Carica dati dal CSV (con protezione da errori)
  if (csvData && csvData.getRowCount() > 0) {
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
        
        console.log('Dati caricati:', {
          numeroTotaleIncidenti,
          numeroTotaleQuadratini,
          incidentiOggi,
          mortiOggi,
          feritiOggi
        });
        break;
      }
    }
  } else {
    console.error('CRITICAL: Cannot process CSV data - file not loaded or empty!');
  }
  
  console.log('Setup completed!');
  
  document.body.style.height = '7000px'; // Include sezione 8 con transizione più lunga
  document.body.style.overflow = 'auto';
  
  // Crea le legende via JS e inizializza la visibilità
  createLegends();
  updateLegendVisibility();
  
  // Setup scroll arrow click handler
  let scrollArrow = document.getElementById('scroll-arrow');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', function() {
      // Vai al prossimo checkpoint
      if (currentCheckpointIndex < scrollCheckpoints.length - 1) {
        currentCheckpointIndex++;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
        scrollAccumulator = 0;
      }
    });
  }
  
  // Setup navbar navigation click handlers
  let navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      let section = parseInt(item.getAttribute('data-section'));
      
      // Mappa sezione navbar a scrollY specifico:
      // 0 = Intro → scrollY 800
      // 1 = Incidenti → checkpoint 3 (scrollY 2900)
      // 2 = Responsabilità → scrollY 5200
      let targetScrollY = 0;
      let targetCheckpoint = 0;
      
      if (section === 0) {
        targetScrollY = 0;
        targetCheckpoint = 0; // checkpoint 0 - intro iniziale
        // Reset variabili intro per mostrare il testo iniziale
        introCaratteriVisibili = introTestoCompleto.length;
        sottotitoloOpacita = 255;
        introOpacita = 255;
        quadratoDimensione = 0;
        quadratoCaratteriVisibili = 0;
      } else if (section === 1) {
        targetScrollY = 2900;
        targetCheckpoint = 3; // checkpoint 2900 - griglia incidenti
      } else if (section === 2) {
        targetScrollY = 5200;
        targetCheckpoint = 8; // checkpoint 5200 - griglia responsabilità
      }
      
      // Salto diretto senza animazione
      currentCheckpointIndex = targetCheckpoint;
      scrollY = targetScrollY;
      scrollTarget = -1;
      isScrolling = false;
      scrollAccumulator = 0;
    });
  });
}

function mouseWheel(event) {
  if (scrollTarget !== -1) {
    // Se c'è già un'animazione in corso, ignora lo scroll
    return false;
  }
  
  // Accumula lo scroll
  scrollAccumulator += event.delta;
  
  // Controlla se abbiamo superato la soglia per cambiare checkpoint
  if (abs(scrollAccumulator) >= scrollThreshold) {
    if (scrollAccumulator > 0) {
      // Scroll verso il basso - vai al checkpoint successivo
      if (currentCheckpointIndex < scrollCheckpoints.length - 1) {
        currentCheckpointIndex++;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
      }
    } else {
      // Scroll verso l'alto - vai al checkpoint precedente
      if (currentCheckpointIndex > 0) {
        currentCheckpointIndex--;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
      }
    }
    
    // Reset dell'accumulatore dopo aver cambiato checkpoint
    scrollAccumulator = 0;
  }
  
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
  
  // Aggiorna visibilità legende
  updateLegendVisibility();
  
  // Calcola parametri sezioni
  let navbarOpacita = calcNavbarOpacity();
  let sezioneAttiva = calcActiveSection();
  let quadratoFadeOut = calcQuadratoFadeOut();
  let quadratoTestoOpacita = calcQuadratoTextOpacity();
  let terzaSezioneFadeOut = calcTerzaSezioneFadeOut();
  
  // Disegna sezioni in ordine
  drawSezioneIntro();
  // NAVBAR: aggiornata tramite HTML/CSS (vedi index.html e style.css)
  updateNavbarHTML(navbarOpacita, sezioneAttiva);
  drawSezioneQuadrato(quadratoFadeOut, quadratoTestoOpacita);
  drawSezioneTerza(terzaSezioneFadeOut);
  drawSezioneGrigliaIncidenti();
  drawSezioneQuinta();
  drawSezioneSesta();
  drawSezioneSettima();
  drawTransizioneSezioneOttava(); // Transizione animata tra 5200 e 6500
  drawSezioneOttava();
  
  // Aggiorna animazioni
  updateAnimations();
  updateCursor();
  
  // Debug
  drawDebugInfo();
}

// ========================================
// FUNZIONI DI UTILITÀ
// ========================================

function handleAutoScroll() { //scroll automatico verso i checkpoint
  if (scrollTarget > -1) {
    isScrolling = true;
    if (abs(scrollY - scrollTarget) > scrollVelocita) {
      if (scrollY < scrollTarget) {
        scrollY += scrollVelocita;
      } else {
        scrollY -= scrollVelocita;
      }
    } else {
      scrollY = scrollTarget;
      scrollTarget = -1;
      isScrolling = false;
      scrollVelocita = 8; // Reset alla velocità normale
      
      // Aggiorna il checkpoint corrente basandosi sulla posizione finale
      for (let i = 0; i < scrollCheckpoints.length; i++) {
        if (abs(scrollY - scrollCheckpoints[i]) < 10) {
          currentCheckpointIndex = i;
          break;
        }
      }
    }
  } else {
    isScrolling = false;
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
  
  // Terza sezione
  if (scrollY > 1100 && scrollY < 1400) {
    terzaSezioneTitoloOpacita = map(scrollY, 1100, 1400, 0, 255);
    terzaSezioneTitoloOpacita = constrain(terzaSezioneTitoloOpacita, 0, 255);
    // Animazione testo come intro
    if (frameCount % 2 == 0 && terzaSezioneCaratteriVisibili < terzaSezioneTestoCompleto.length) {
      terzaSezioneCaratteriVisibili++;
    }
    terzaSezioneSottotitoloOpacita = map(scrollY, 1200, 1400, 0, 255);
    terzaSezioneSottotitoloOpacita = constrain(terzaSezioneSottotitoloOpacita, 0, 255);
  } else if (scrollY >= 1400 && scrollY < 1600) {
    // Mantieni opacità massima, continua animazione se non completata
    terzaSezioneTitoloOpacita = 255;
    if (frameCount % 2 == 0 && terzaSezioneCaratteriVisibili < terzaSezioneTestoCompleto.length) {
      terzaSezioneCaratteriVisibili++;
    }
    terzaSezioneSottotitoloOpacita = map(scrollY, 1200, 1400, 0, 255);
    terzaSezioneSottotitoloOpacita = constrain(terzaSezioneSottotitoloOpacita, 0, 255);
  } else if (scrollY >= 1600) {
    // Fade out
    terzaSezioneTitoloOpacita = map(scrollY, 1600, 1700, 255, 0);
    terzaSezioneTitoloOpacita = constrain(terzaSezioneTitoloOpacita, 0, 255);
    terzaSezioneSottotitoloOpacita = map(scrollY, 1600, 1700, 255, 0);
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
  } else if (scrollY > 3000 && quintaSezioneCaratteriVisibili > 0) {
    // Mantieni il testo già scritto tra 3000-3200 per il fade out (non riscrivere)
    // Non cambiare quintaSezioneCaratteriVisibili
  } else {
    quintaSezioneCaratteriVisibili = 0;
  }
}

function updateCatCausaInfo(nome, incidenti, lesionati, morti) { //visualizza i dati specidici per categoria
  const container = document.getElementById('catCausaContainer');
  if (!container) return;
  
  // Determina il colore hex della categoria
  let categoryHex = '#ffffff';
  if (categoriaSelezionata === 'conducenti') {
    categoryHex = '#00a1f1';
  } else if (categoriaSelezionata === 'cause-esterne-concomitanti') {
    categoryHex = '#33bb44';
  } else if (categoriaSelezionata === 'non-conducenti') {
    categoryHex = '#fd73ed';
  }
  
  // Mostra feriti e morti solo se aperta la modalità istogramma
  let feritiMortiHTML = '';
  if (showBars) {
    feritiMortiHTML = `
      <p style="margin: 0;"><span style="color: var(--orange);">Feriti:</span> <span style="color: white;">${lesionati.toLocaleString('it-IT')}</span></p>
      <p style="margin: 0;"><span style="color: var(--orange);">Morti:</span> <span style="color: white;">${morti.toLocaleString('it-IT')}</span></p>
    `;
  }
  
  // Crea l'HTML dinamicamente
  container.innerHTML = `
    <h3 style="color: white; margin: 0;">${nome}</h3>
    <div class="riga">
      <p style="margin: 0;"><span style="color: ${categoryHex};">Incidenti:</span> <span style="color: white;">${incidenti.toLocaleString('it-IT')}</span></p>
      ${feritiMortiHTML}
    </div>
  `;
}

function createLegends() {
  // legenda incidenti
  if (!document.getElementById('legIncidenti')) {
    let legIncidenti = document.createElement('div');
    legIncidenti.className = 'container';
    legIncidenti.id = 'legIncidenti';
    legIncidenti.style.display = 'none';

    // riga 1: quadrato pieno
    let r1 = document.createElement('div');
    r1.className = 'riga';
    let rect = document.createElement('span');
    rect.className = 'rect';
    r1.appendChild(rect);
    r1.appendChild(document.createTextNode(' area proporzionale al numero di incidenti'));
    legIncidenti.appendChild(r1);

    // riga 2: quadrato vuoto
    let r2 = document.createElement('div');
    r2.className = 'riga';
    let empty = document.createElement('span');
    empty.className = 'emptyRect';
    r2.appendChild(empty);
    r2.appendChild(document.createTextNode(' numero di incidenti inferiore a 300'));
    legIncidenti.appendChild(r2);

    document.body.appendChild(legIncidenti);
  }

  // legenda lesionati
  if (!document.getElementById('legLesionati')) {
    let legLesionati = document.createElement('div');
    legLesionati.className = 'container';
    legLesionati.id = 'legLesionati';
    legLesionati.style.display = 'none';

    // riga 1: cubo
    let r1 = document.createElement('div');
    r1.className = 'riga';
    let cube = document.createElement('div');
    r1.appendChild(cube);
    r1.appendChild(document.createTextNode(' altezza proporzionale al numero di lesionati'));
    legLesionati.appendChild(r1);

    // riga 2: gradiente
    let r2 = document.createElement('div');
    r2.className = 'riga';
    let grad = document.createElement('span');
    grad.className = 'gradiente';
    r2.appendChild(grad);
    r2.appendChild(document.createTextNode(' opacità proporzionale alla percentuale di incidenti mortali'));
    legLesionati.appendChild(r2);

    document.body.appendChild(legLesionati);
  }
}

function updateLegendVisibility() {
  let legIncidenti = document.getElementById('legIncidenti');
  let legLesionati = document.getElementById('legLesionati');
  let catCausa = document.querySelector('.catCausa');
  
  // Mostra leggende solo nella sezione 8
  if (scrollY >= 6500 && scrollY < 6700 && categoriaSelezionata !== null) {
    if (!showBars) {
      // Mostra legenda incidenti, nascondi lesionati
      if (legIncidenti) legIncidenti.style.display = 'flex';
      if (legLesionati) legLesionati.style.display = 'none';
      if (catCausa) catCausa.style.display = 'block';
    } else {
      // Mostra legenda lesionati, nascondi incidenti
      if (legIncidenti) legIncidenti.style.display = 'none';
      if (legLesionati) legLesionati.style.display = 'flex';
      if (catCausa) catCausa.style.display = 'block';
    }
  } else {
    // Nascondi entrambe
    if (legIncidenti) legIncidenti.style.display = 'none';
    if (legLesionati) legLesionati.style.display = 'none';
    if (catCausa) catCausa.style.display = 'none';
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
  if (scrollY > 3700 && !counterAnimazioneCompletata) {
    if (!counterAnimazioneAutomatica) {
      counterAnimazioneAutomatica = true;
      counterAnimazioneInizio = frameCount;
    }
  }
  
  // Calcola e aggiorna i valori in tempo reale (sia per sezione 6 che navbar)
  if (counterAnimazioneAutomatica || counterAnimazioneCompletata || navbarCounterAttivato) {
    let now = new Date();
    let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let secondiTotali = 24 * 3600;
    let progress = secondiOggi / secondiTotali;

    let targetIncidenti = incidentiOggi * progress;
    let targetMorti = mortiOggi * progress;
    let targetFeriti = feritiOggi * progress;

    if (counterAnimazioneAutomatica && !counterAnimazioneCompletata && frameCount - counterAnimazioneInizio < 240) {
      // Animazione smooth più lenta solo per la PRIMA apparizione nella sezione 6
      animIncidenti += (targetIncidenti - animIncidenti) * 0.03;
      animMorti += (targetMorti - animMorti) * 0.03;
      animFeriti += (targetFeriti - animFeriti) * 0.03;
    } else {
      // Segna l'animazione come completata
      if (counterAnimazioneAutomatica && !counterAnimazioneCompletata) {
        counterAnimazioneCompletata = true;
      }
      
      // Aggiornamento diretto in tempo reale (mantiene sempre i valori)
      animIncidenti = targetIncidenti;
      animMorti = targetMorti;
      animFeriti = targetFeriti;
    }
  }
  
  // Animazione regroup
  if (scrollY > 5100) {
    animRegroupTarget = 1;
  } else {
    animRegroupTarget = 0;
  }
  let speed = 0.07;
  animRegroupProgress += (animRegroupTarget - animRegroupProgress) * speed;
  animRegroupProgress = constrain(animRegroupProgress, 0, 1);
  
  // Animazione sezione 8 cubo
  sezioneOttavaTransTarget = showBars ? 1 : 0;
  sezioneOttavaTrans += (sezioneOttavaTransTarget - sezioneOttavaTrans) * 0.12;
  sezioneOttavaTrans = constrain(sezioneOttavaTrans, 0, 1);
}

function isMouseOver(x, y, w, h) { // controllo hover generico
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

function getOverlayColor(cat) {
  if (cat === 'conducenti') return color(0, 161, 241);
  if (cat === 'cause-esterne-concomitanti') return color(51, 187, 68);
  if (cat === 'non-conducenti') return color(253, 115, 237);
  return color(255);
}

function getCategoriaData(cat) {
  if (cat === 'conducenti') return csvConducenti;
  if (cat === 'cause-esterne-concomitanti') return csvCauseEsterne;
  if (cat === 'non-conducenti') return csvNonConducenti;
  return null;
}

function updateCursor() { // cursore mano sugli elementi cliccabili
  // Sezione 7: hover sulle categorie cliccabili
  if (scrollY >= 4850 && scrollY < 6500 && sezioneOttavaHitboxes.length > 0) {
    for (let hitbox of sezioneOttavaHitboxes) {
      if (isMouseOver(hitbox.x, hitbox.y, hitbox.w, hitbox.h)) {
        cursor(HAND);
        return;
      }
    }
  }
  
  // Sezione 8: hover sulle frecce e sui cubi
  if (scrollY >= 6500 && scrollY < 6700) {
    let arrowSize = frecceSezioneOttava.sinistra.size;
    
    // Check hover freccia sinistra
    if (dist(mouseX, mouseY, frecceSezioneOttava.sinistra.x, frecceSezioneOttava.sinistra.y) < arrowSize) {
      frecceSezioneOttava.sinistra.hover = true;
      cursor(HAND);
      return;
    } else {
      frecceSezioneOttava.sinistra.hover = false;
    }
    
    // Check hover freccia destra
    if (dist(mouseX, mouseY, frecceSezioneOttava.destra.x, frecceSezioneOttava.destra.y) < arrowSize) {
      frecceSezioneOttava.destra.hover = true;
      cursor(HAND);
      return;
    } else {
      frecceSezioneOttava.destra.hover = false;
    }
    
    // Check hover sui cubi
    if (sezioneOttavaSquareHitboxes.length > 0) {
      for (let hitbox of sezioneOttavaSquareHitboxes) {
        if (isMouseOver(hitbox.x, hitbox.y, hitbox.w, hitbox.h)) {
          cursor(HAND);
          return;
        }
      }
    }
  } else {
    frecceSezioneOttava.sinistra.hover = false;
    frecceSezioneOttava.destra.hover = false;
  }
  
  cursor(ARROW);
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
  
  // Sottotitolo
  if (sottotitoloOpacita > 0) {
    push();
    textFont(transportFont);
    textSize(16);
    fill(255, 255, 255, min(sottotitoloOpacita, introOpacita));
    text('Scoprila analizzando i dati ISTAT del 2024', width / 2, height - 70);
    pop();
  }
}

// ========================================
// NAVBAR HTML - Aggiorna visibilità e sezione attiva
// ========================================
function updateNavbarHTML(navbarOpacita, sezioneAttiva) {
  // Ottieni elemento navbar HTML
  let navbar = document.getElementById('navbar');
  if (!navbar) return;
  
  // Mostra/nascondi navbar in base all'opacità
  if (navbarOpacita > 50) {
    navbar.classList.add('visible');
  } else {
    navbar.classList.remove('visible');
  }
  
  // Aggiorna quale sezione è attiva
  let navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item, index) => {
    if (index === sezioneAttiva) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // COUNTER NAVBAR: Attiva solo quando si procede OLTRE la sezione 6 (dopo scrollY 4100)
  let navbarCounter = document.getElementById('navbar-counter');
  if (navbarCounter && scrollY >= 4100 && !navbarCounterAttivato) {
    navbarCounterAttivato = true;
    
    // Mostra il counter con fade-in (senza animazione di conteggio)
    setTimeout(() => {
      navbarCounter.classList.add('visible');
    }, 300);
  }
  
  // Se il counter è stato attivato, aggiorna i valori in tempo reale
  if (navbarCounterAttivato) {
    updateNavbarCounterValues();
  }
  
  // SCROLL ARROW: Nascondi quando sei all'ultimo checkpoint
  let scrollArrow = document.getElementById('scroll-arrow');
  if (scrollArrow) {
    if (currentCheckpointIndex >= scrollCheckpoints.length - 1) {
      scrollArrow.style.opacity = '0';
      scrollArrow.style.pointerEvents = 'none';
    } else {
      scrollArrow.style.opacity = '1';
      scrollArrow.style.pointerEvents = 'all';
    }
    
    // Attiva/disattiva animazione bounce: solo quando NON si sta scrollando
    if (isScrolling) {
      scrollArrow.style.animationPlayState = 'paused';
    } else {
      scrollArrow.style.animationPlayState = 'running';
    }
  }
}

// NAVBAR COUNTER: Aggiorna i valori in tempo reale (senza animazione di conteggio)
function updateNavbarCounterValues() {
  document.getElementById('nav-incidenti').textContent = Math.floor(animIncidenti);
  document.getElementById('nav-morti').textContent = Math.floor(animMorti);
  document.getElementById('nav-feriti').textContent = Math.floor(animFeriti);
  
  // Aggiorna anche il tooltip con data e ora attuali
  updateCounterTooltip();
}

// NAVBAR COUNTER TOOLTIP: Aggiorna con data e ora attuali
function updateCounterTooltip() {
  let tooltip = document.getElementById('counter-tooltip');
  if (!tooltip) return;
  
  let now = new Date();
  let giorno = String(now.getDate()).padStart(2, '0');
  let mese = String(now.getMonth() + 1).padStart(2, '0');
  let ore = String(now.getHours()).padStart(2, '0');
  let minuti = String(now.getMinutes()).padStart(2, '0');
  
  tooltip.innerHTML = `Statistiche medie del<br>${giorno}/${mese}/2024 alle ore ${ore}:${minuti}`;
}

// NAVBAR: Gestione click sui link per scroll automatico
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      let section = parseInt(item.dataset.section);
      
      // Scroll automatico verso la sezione
      if (section === 0) scrollTarget = 0;
      else if (section === 1) scrollTarget = 1600;
      else if (section === 2) scrollTarget = 4300;
    });
  });
});

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
    textFont(transportFont);
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
    // Attiva sottotitolo finale solo quando animazione è completata
    if (grigliaIncidentiSottotitoloOpacita < 255) {
      grigliaIncidentiSottotitoloOpacita += 3; // fade-in veloce
      grigliaIncidentiSottotitoloOpacita = constrain(grigliaIncidentiSottotitoloOpacita, 0, 255);
    }
  } else {
    numeroQuadratiniVisibili = 0;
    counterAttuale = 0;
    grigliaIncidentiSottotitoloOpacita = 0;
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
  let startY = (height - altezzaGriglia) / 2 + 70;
  
  // Fade out
  let grigliaFadeOut = 255;
  if (scrollY > 2900) {
    grigliaFadeOut = map(scrollY, 2900, 3000, 255, 0);
    grigliaFadeOut = constrain(grigliaFadeOut, 0, 255);
  }

  // Sottotitolo finale incidenti
  if (grigliaIncidentiSottotitoloOpacita > 0) {
    push();
    textFont(transportFont);
    textAlign(CENTER, TOP);
    textSize(18);
    fill(255, 255, 255, min(grigliaIncidentiSottotitoloOpacita, grigliaFadeOut));
    // Il numero viene disegnato a startY - 20, quindi il testo va subito sotto
    text('Sono stati gli incidenti in Italia nel 2024', width / 2, startY - 40);
    pop();
  }
  
  // Counter numero totale incidenti
  if (counterAttuale > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, BOTTOM);
    let txtSize = width * 0.04;
    txtSize = constrain(txtSize, 20, 80);
    textSize(txtSize);
    fill(255, 122, 0, grigliaFadeOut);
    let numeroFormattato = counterAttuale.toLocaleString('it-IT');
    text(numeroFormattato, width / 2, startY - 60);
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
  
  // Fade out (veloce come il testo)
  let quintaSezioneFadeOut = 255;
  if (scrollY > 3350) {
    quintaSezioneFadeOut = map(scrollY, 3350, 3400, 255, 0);
    quintaSezioneFadeOut = constrain(quintaSezioneFadeOut, 0, 255);
  }
  
  // Cubo (mostra solo quando ha iniziato l'animazione 3D per evitare flash)
  if (cuboRotazione > 0.02) {
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
  
  // Facce arancioni (mostra solo se hanno un'altezza significativa)
  if (altezzaLatiVerticali > 5) {
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
    // Linea sottile nera lungo la giunzione tra le due facce (replica dell'effetto)
    push();
    stroke(0); // nero semi-trasparente
    strokeWeight(2);
    strokeJoin(ROUND);
    // linea verticale che segue l'edge tra le due facce
    line(puntoBassoDestro.x, puntoBassoDestro.y, puntoBassoDestro.x, puntoBassoDestro.y + altezzaLatiVerticali);
    pop();
  }
  
  // Top bianco (con stesso fadeOut delle facce laterali)
  fill(255, 255, 255, quintaSezioneFadeOut);
  // Aggiungi un bordo sottile al top per coerenza con la giunzione
  stroke(0, quintaSezioneFadeOut);
  strokeWeight(2);
  strokeJoin(ROUND);
  quad(
    puntoAltoSinistra.x, puntoAltoSinistra.y,
    puntoAltoDestra.x, puntoAltoDestra.y,
    puntoBassoDestro.x, puntoBassoDestro.y,
    puntoBassoSinistra.x, puntoBassoSinistra.y
  );
  noStroke();
  
  pop();
}

// Funzione per disegnare i cubi nell'istogramma (riutilizza la stessa logica di drawCubo)
function drawCuboOverlay(half, H, trans, categoryColor, isFilled, lesionati, incidenti, nome, morti, cubeOpacity, minMortPercent, maxMortPercent) {
  function easeOutCubic(t) {
    return 1 - pow(1 - t, 3);
  }
  
  let angle = (PI/4) * easeOutCubic(constrain((trans - 0.00) / 0.35, 0, 1));
  let squash = lerp(1, 0.40, easeOutCubic(constrain((trans - 0.35) / 0.20, 0, 1)));
  let grow = easeOutCubic(constrain((trans - 0.55) / 0.45, 0, 1));
  
  let baseY = -half;
  let sideH = H * grow;
  
  // Calcola percentuale di incidenti mortali
  let percIncMortali = (incidenti > 0) ? (morti * 100) / incidenti : 0;
  // Normalizza rispetto al range min-max della categoria
  let normalizedPercent = (maxMortPercent > minMortPercent) 
    ? map(percIncMortali, minMortPercent, maxMortPercent, 0, 1)
    : 0.5; // Default a 50% se non c'è range
  normalizedPercent = constrain(normalizedPercent, 0, 1);
  // Gradiente da bianco (255,255,255) a minimo, ad arancione (255,139,67) a massimo
  let sideColor = lerpColor(color(255, 255, 255), color(255, 139, 67), normalizedPercent);
  
  let base = [
    {x: -half, y: -half}, {x: +half, y: -half},
    {x: +half, y: +half}, {x: -half, y: +half}
  ];
  
  function rot(pt, lift) {
    let c = cos(angle), s = sin(angle);
    let rx = pt.x * c - pt.y * s;
    let ry = (pt.x * s + pt.y * c) * squash;
    return { x: rx, y: (baseY - lift) + ry };
  }
  
  let p0 = rot(base[0], sideH);
  let p1 = rot(base[1], sideH);
  let p2 = rot(base[2], sideH);
  let p3 = rot(base[3], sideH);
  
  let bL0 = rot(base[3], 0);
  let bL1 = rot(base[0], 0);
  let L0 = {x: bL0.x, y: 0};
  let L1 = {x: bL1.x, y: 0};
  let L2 = rot(base[0], sideH);
  let L3 = rot(base[3], sideH);
  let L = [L0, L1, L2, L3];
  
  let mirror = (pt) => ({x: -pt.x, y: pt.y});
  let R = [mirror(L0), mirror(L1), mirror(L2), mirror(L3)];
  
  // Lati con gradiente bianco-arancione in base alla percentuale di incidenti mortali
  if (sideH > 0) {
    fill(red(sideColor), green(sideColor), blue(sideColor), 255 * cubeOpacity);
    // draw filled sides
    noStroke();
    quad(L[0].x, L[0].y, L[1].x, L[1].y, L[2].x, L[2].y, L[3].x, L[3].y);
    quad(R[0].x, R[0].y, R[1].x, R[1].y, R[2].x, R[2].y, R[3].x, R[3].y);
    // outline the side faces with a thin black stroke to reproduce seam effect
    push();
    stroke(0, 140 * cubeOpacity); // nero semi-trasparente scaled by cubeOpacity
    strokeWeight(1.2);
    strokeJoin(ROUND);
    noFill();
    quad(L[0].x, L[0].y, L[1].x, L[1].y, L[2].x, L[2].y, L[3].x, L[3].y);
    quad(R[0].x, R[0].y, R[1].x, R[1].y, R[2].x, R[2].y, R[3].x, R[3].y);
    pop();
    
    // Numero lesionati sopra
    fill(255, 255, 255, 255 * cubeOpacity);
    textFont(transportFont);
    textSize(12);
    textAlign(CENTER, BOTTOM);
    let topY = min(p0.y, p1.y, p2.y, p3.y);
    text(lesionati.toLocaleString('it-IT'), 0, topY - 5);
  }
  
  // Top del cubo
  // Draw top with a thin black outline (consistent with main drawCubo)
  push();
  if (isFilled) {
    fill(red(categoryColor), green(categoryColor), blue(categoryColor), 255 * cubeOpacity);
  } else {
    fill(0, 0, 0, 255 * cubeOpacity);
  }
  stroke(0, 255 * cubeOpacity);
  strokeWeight(1.2);
  strokeJoin(ROUND);
  quad(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  pop();
  
  // Debug: numero incidenti sopra
  fill(255, 0, 0, 255 * cubeOpacity);
  noStroke();
  textFont(transportFont);
  textSize(10);
  textAlign(CENTER, BOTTOM);
  let debugY = min(p0.y, p1.y, p2.y, p3.y);
  text(incidenti.toLocaleString('it-IT'), 0, debugY - 20);
  
  // Nome categoria sotto
  fill(255, 255, 255, 255 * cubeOpacity);
  noStroke();
  textFont(transportFont);
  textSize(9);
  textAlign(CENTER, TOP);
  text(nome, 0, 5);
}

function drawSezioneSesta() {
  // Fade-in sezione
  if (scrollY > 3400 && scrollY < 3600) {
    sestaSezioneOpacita = map(scrollY, 3400, 3600, 0, 255);
    sestaSezioneOpacita = constrain(sestaSezioneOpacita, 0, 255);
  } else if (scrollY >= 3600) {
    sestaSezioneOpacita = 255;
  } else {
    sestaSezioneOpacita = 0;
  }
  
  // Fade out counter
  let counterFadeOut = 255;
  if (scrollY > 3800 && scrollY < 4100) {
    counterFadeOut = map(scrollY, 3800, 4100, 255, 0);
    counterFadeOut = constrain(counterFadeOut, 0, 255);
  } else if (scrollY >= 4100) {
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
  if (scrollY >= 4100 && scrollY < 4300) {
    colpaFadeIn = map(scrollY, 4100, 4300, 0, 255);
    colpaFadeIn = constrain(colpaFadeIn, 0, 255);
  } else if (scrollY >= 4300) {
    colpaFadeIn = 255;
  }
  
  // Fade out "MA DI CHI È LA COLPA?"
  let colpaFadeOut = 255;
  if (scrollY > 4600 && scrollY < 4750) {
    colpaFadeOut = map(scrollY, 4600, 4750, 255, 0);
    colpaFadeOut = constrain(colpaFadeOut, 0, 255);
  } else if (scrollY >= 4750) {
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
  // Non disegnare se siamo nella sezione 8 o in transizione attiva oltre 5200
  if (scrollY >= 6500) return;
  if (transizioneAttiva && scrollY > 5200) return;
  
  // Fade in griglia
  let grigliaFadeIn = 0;
  if (scrollY > 4700 && scrollY < 4850) {
    grigliaFadeIn = map(scrollY, 4700, 4850, 0, 255);
    grigliaFadeIn = constrain(grigliaFadeIn, 0, 255);
    animRegroupActive = true;
  } else if (scrollY >= 4850) {
    grigliaFadeIn = 255;
    animRegroupActive = true;
  } else {
    grigliaFadeIn = 0;
    animRegroupActive = false;
  }
  
  if (grigliaFadeIn <= 0) return;
  
  push(); // Isolamento stile per sezione 7
  
  // Estrai dati dal CSV
  let quadConducenti = 0, quadCauseEsterne = 0, quadNonConducenti = 0;
  let incidentiConducenti = 0, incidentiCauseEsterne = 0, incidentiNonConducenti = 0;
  for (let i = 0; i < csvData.getRowCount(); i++) {
    let classe = csvData.getString(i, 'Classe').trim().toLowerCase();
    if (classe === 'conducenti') {
      quadConducenti = int(csvData.getString(i, 'I/300'));
      incidentiConducenti = parseInt(csvData.getString(i, 'Incidenti').replace(/[\s.]/g, ''));
    } else if (classe === 'cause-esterne-concomitanti') {
      quadCauseEsterne = int(csvData.getString(i, 'I/300'));
      incidentiCauseEsterne = parseInt(csvData.getString(i, 'Incidenti').replace(/[\s.]/g, ''));
    } else if (classe === 'non-conducenti') {
      quadNonConducenti = int(csvData.getString(i, 'I/300'));
      incidentiNonConducenti = parseInt(csvData.getString(i, 'Incidenti').replace(/[\s.]/g, ''));
    }
  }
  const quadTotale = quadConducenti + quadCauseEsterne + quadNonConducenti;
  
  // Colori
  const coloreBlu = color(0, 161, 241);
  const coloreVerde = color(51, 187, 68);
  const coloreRosa = color(253, 115, 237);
  
  // Layout
  dimensioneQuadratino = width * 0.008;
  dimensioneQuadratino = constrain(dimensioneQuadratino, 8, 15);
  let spaziatura = dimensioneQuadratino * 0.5;
  let quadratiniPerRiga = floor(width * 0.4 / (dimensioneQuadratino + spaziatura));
  quadratiniPerRiga = constrain(quadratiniPerRiga, 30, 60);
  let numeroRighe = ceil(numeroTotaleQuadratini / quadratiniPerRiga);
  
  const quadPerRiga = quadratiniPerRiga;
  const quadSize = dimensioneQuadratino;
  const quadSpacing = spaziatura;
  
  // Crea array colori mischiati (solo una volta)
  if (typeof window.coloriQuadratiniMischiati === 'undefined') {
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

  // Hitbox per click su categorie -- esattamente le dimensioni delle griglie
  let blueWidth = blueDims.cols * (quadSize + quadSpacing) - quadSpacing;
  let blueHeight = blueDims.rows * (quadSize + quadSpacing) - quadSpacing;
  let greenWidth = greenDims.cols * (quadSize + quadSpacing) - quadSpacing;
  let greenHeight = greenDims.rows * (quadSize + quadSpacing) - quadSpacing;
  let pinkWidth = pinkDims.cols * (quadSize + quadSpacing) - quadSpacing;
  let pinkHeight = pinkDims.rows * (quadSize + quadSpacing) - quadSpacing;
  
  sezioneOttavaHitboxes = [
    { x: blueStartX, y: topY, w: blueWidth, h: blueHeight },
    { x: greenStartX, y: topY, w: greenWidth, h: greenHeight },
    { x: pinkStartX, y: topY, w: pinkWidth, h: pinkHeight }
  ];
  
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
  
  // Disegna i numeri sopra ogni gruppo (appaiono gradualmente con l'animazione di riordino)
  if (animRegroupProgress > 0.3) { // Inizia a mostrare i numeri quando il riordino è al 30%
    let numberOpacity = map(animRegroupProgress, 0.3, 1, 0, grigliaFadeIn);
    numberOpacity = constrain(numberOpacity, 0, grigliaFadeIn);
    
    push();
    textFont(lcdFont);
    textAlign(CENTER, BOTTOM);
    let txtSize = width * 0.025;
    txtSize = constrain(txtSize, 18, 50);
    textSize(txtSize);
    
    // Calcola i numeri animati (salgono gradualmente)
    let animFactor = map(animRegroupProgress, 0.3, 1, 0, 1);
    animFactor = constrain(animFactor, 0, 1);
    
    let currentConducenti = floor(incidentiConducenti * animFactor);
    let currentCauseEsterne = floor(incidentiCauseEsterne * animFactor);
    let currentNonConducenti = floor(incidentiNonConducenti * animFactor);
    
    // Numero gruppo BLU (Conducenti)
    let blueCenterX = blueStartX + (blueDims.cols * (quadSize + quadSpacing)) / 2;
    fill(0, 161, 241, numberOpacity);
    text(currentConducenti.toLocaleString('it-IT'), blueCenterX, topY - 30);
    
    // Label sotto il numero
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, numberOpacity);
    text('Conducente', blueCenterX, topY - 10);
    
    // Numero gruppo VERDE (Cause esterne)
    let greenCenterX = greenStartX + (greenDims.cols * (quadSize + quadSpacing)) / 2;
    textFont(lcdFont);
    textSize(txtSize);
    fill(51, 187, 68, numberOpacity);
    text(currentCauseEsterne.toLocaleString('it-IT'), greenCenterX, topY - 30);
    
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, numberOpacity);
    text('Cause esterne', greenCenterX, topY - 10);
    
    // Numero gruppo ROSA (Non conducenti)
    let pinkCenterX = pinkStartX + (pinkDims.cols * (quadSize + quadSpacing)) / 2;
    textFont(lcdFont);
    textSize(txtSize);
    fill(253, 115, 237, numberOpacity);
    text(currentNonConducenti.toLocaleString('it-IT'), pinkCenterX, topY - 30);
    
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, numberOpacity);
    text('Non conducenti', pinkCenterX, topY - 10);
    
    pop();
  }
  
  pop(); // Fine isolamento stile sezione 7
}

function drawTransizioneSezioneOttava() {
  // Mostra la transizione solo tra scroll 5200 e 6500 quando transizioneAttiva è true
  if (!transizioneAttiva) return;
  if (scrollY < 5200 || scrollY >= 6500) {
    transizioneAttiva = false;
    return;
  }
  
  // Calcola progress dell'animazione basato su scrollY
  // Dividiamo in 2 fasi: amalgama (5200-6200) e posizionamento (6200-6500)
  transizioneProgress = map(scrollY, 5200, 6500, 0, 1);
  transizioneProgress = constrain(transizioneProgress, 0, 1);
  
  // Fase amalgama: scroll 5200-6200
  let amalgamaProgress = map(scrollY, 5200, 6200, 0, 1);
  amalgamaProgress = constrain(amalgamaProgress, 0, 1);
  amalgamaProgress = amalgamaProgress * amalgamaProgress * (3 - 2 * amalgamaProgress); // smoothstep
  
  // Fase posizionamento: scroll 6200-6500
  let posizionamentoProgress = map(scrollY, 6200, 6500, 0, 1);
  posizionamentoProgress = constrain(posizionamentoProgress, 0, 1);
  
  push();
  background(0); // Sfondo nero
  
  // Ottieni dati della categoria selezionata
  let categoryData = getCategoriaData(categoriaSelezionata);
  if (!categoryData || !csvData) {
    pop();
    return;
  }
  
  // Ottieni info categoria dalla sezione 7
  let quadConducenti = 0, quadCauseEsterne = 0, quadNonConducenti = 0;
  for (let i = 0; i < csvData.getRowCount(); i++) {
    let classe = csvData.getString(i, 'Classe').trim().toLowerCase();
    if (classe === 'conducenti') quadConducenti = int(csvData.getString(i, 'I/300'));
    else if (classe === 'cause-esterne-concomitanti') quadCauseEsterne = int(csvData.getString(i, 'I/300'));
    else if (classe === 'non-conducenti') quadNonConducenti = int(csvData.getString(i, 'I/300'));
  }
  
  // Determina quanti quadratini appartengono alla categoria selezionata
  let numQuadratiniCategoria = 0;
  if (categoriaSelezionata === 'conducenti') numQuadratiniCategoria = quadConducenti;
  else if (categoriaSelezionata === 'cause-esterne-concomitanti') numQuadratiniCategoria = quadCauseEsterne;
  else if (categoriaSelezionata === 'non-conducenti') numQuadratiniCategoria = quadNonConducenti;
  
  // Layout sezione 7 (ricrea lo stesso layout)
  let quadSize = dimensioneQuadratino;
  let quadSpacing = quadSize * 0.5;
  let quadPerRiga = floor(width * 0.4 / (quadSize + quadSpacing));
  quadPerRiga = constrain(quadPerRiga, 30, 60);
  
  // Colore categoria
  let categoryColor = getOverlayColor(categoriaSelezionata);
  
  // Fase 1: Fade out degli altri elementi (numeri, labels, quadratini delle altre categorie)
  let fadeOutOthers = map(amalgamaProgress, 0, 0.2, 255, 0);
  fadeOutOthers = constrain(fadeOutOthers, 0, 255);
  
  // Posizioni iniziali dei quadratini nella sezione 7
  // Calcola dove sono nella griglia delle 3 categorie
  function getWideGridDims(count) {
    let cols = min(15, count);
    let rows = ceil(count / cols);
    return { cols, rows };
  }
  
  let blueDims = getWideGridDims(quadConducenti);
  let greenDims = getWideGridDims(quadCauseEsterne);
  let pinkDims = getWideGridDims(quadNonConducenti);
  
  let groupSpacing = quadSize * 8;
  let totalGroupWidth = blueDims.cols * (quadSize + quadSpacing) - quadSpacing +
                        greenDims.cols * (quadSize + quadSpacing) - quadSpacing +
                        pinkDims.cols * (quadSize + quadSpacing) - quadSpacing +
                        groupSpacing * 2;
  
  let blueStartX = (width - totalGroupWidth) / 2;
  let greenStartX = blueStartX + blueDims.cols * (quadSize + quadSpacing) - quadSpacing + groupSpacing;
  let pinkStartX = greenStartX + greenDims.cols * (quadSize + quadSpacing) - quadSpacing + groupSpacing;
  let topY = height * 0.35;
  
  // Determina posizioni iniziali in base alla categoria
  let startX, startDims;
  if (categoriaSelezionata === 'conducenti') {
    startX = blueStartX;
    startDims = blueDims;
  } else if (categoriaSelezionata === 'cause-esterne-concomitanti') {
    startX = greenStartX;
    startDims = greenDims;
  } else {
    startX = pinkStartX;
    startDims = pinkDims;
  }
  
  // Calcola posizioni finali nell'istogramma (sezione 8) - IDENTICHE alla sezione 8
  let numRows = categoryData.getRowCount();
  let baseQuadSize = quadSize;
  let finalQuadSpacing = 40;
  
  // Calcola larghezza totale istogramma per centrare a destra (stesso calcolo della sezione 8)
  let totalWidth = 0;
  for (let i = 0; i < numRows - 1; i++) {
    let i300 = int(categoryData.getString(i, 'I/300'));
    let area = baseQuadSize * baseQuadSize * i300;
    let size = (i300 >= 1) ? sqrt(area) : baseQuadSize;
    totalWidth += size + finalQuadSpacing;
  }
  totalWidth -= finalQuadSpacing;
  
  let finalXStart = width - 100 - totalWidth;
  let baselineY = height - 100;
  
  // Fase 3: Fade in elementi UI (titolo, frecce, etc) durante posizionamento (6200-6500)
  let fadeInUI = map(scrollY, 6200, 6500, 0, 255);
  fadeInUI = constrain(fadeInUI, 0, 255);
  
  // Disegna titolo con fade in
  if (fadeInUI > 0) {
    push();
    fill(255, 255, 255, fadeInUI);
    textFont(lcdFont);
    textSize(40);
    textAlign(LEFT, TOP);
    text(categoriaSelezionata.toUpperCase(), 100, 100);
    pop();
  }
  
  // Disegna frecce laterali con fade in
  if (fadeInUI > 0) {
    drawFrecceNavigazioneTransizione(fadeInUI);
  }
  
  // Calcola xPos corrente per disegnare i quadrati finali
  let xPos = finalXStart;
  
  // Disegna l'animazione dei quadratini che si fondono nei quadrati finali
  let quadIndex = 0;
  for (let causeIdx = 0; causeIdx < numRows - 1; causeIdx++) {
    let i300 = int(categoryData.getString(causeIdx, 'I/300'));
    let area = baseQuadSize * baseQuadSize * i300;
    let finalSize = (i300 >= 1) ? sqrt(area) : baseQuadSize;
    
    // Posizione finale ESATTA del quadrato (angolo in basso a sinistra)
    let finalX = xPos;
    let finalY = baselineY - finalSize;
    let finalCenterX = finalX + finalSize / 2;
    let finalCenterY = finalY + finalSize / 2;
    
    // Disegna i singoli quadratini che si amalgamano gradualmente nel quadrato finale
    let numQuadsForCause = floor(i300);
    
    // I quadratini si posizionano in una griglia che compone il quadrato finale
    let gridCols = ceil(sqrt(numQuadsForCause));
    let gridRows = ceil(numQuadsForCause / gridCols);
    let cellSize = finalSize / max(gridCols, gridRows);
    
    // FASE 1: Amalgama (scroll 5200-6100) - i quadratini si fondono al centro schermo
    // Posizione centro schermo per l'amalgama
    let amalgamaCenterX = width / 2 + (causeIdx - (numRows - 2) / 2) * (finalSize + finalQuadSpacing);
    let amalgamaCenterY = height / 2;
    
    // Disegna sempre i quadratini che si uniscono
    for (let q = 0; q < numQuadsForCause && quadIndex < numQuadratiniCategoria; q++) {
      // Posizione iniziale nella griglia della categoria
      let startRow = floor(quadIndex / startDims.cols);
      let startCol = quadIndex % startDims.cols;
      let startXPos = startX + startCol * (quadSize + quadSpacing);
      let startYPos = topY + startRow * (quadSize + quadSpacing);
      
      // Posizione di amalgama: griglia compatta al centro
      let amalgamaRow = floor(q / gridCols);
      let amalgamaCol = q % gridCols;
      let amalgamaXPos = amalgamaCenterX - finalSize/2 + amalgamaCol * cellSize;
      let amalgamaYPos = amalgamaCenterY - finalSize/2 + amalgamaRow * cellSize;
      
      // Posizione finale nell'istogramma
      let finalXPos = finalX + amalgamaCol * cellSize;
      let finalYPos = finalY + amalgamaRow * cellSize;
      
      // FASE 1: Convergono verso centro schermo e si espandono
      let phase1X = lerp(startXPos, amalgamaXPos, amalgamaProgress);
      let phase1Y = lerp(startYPos, amalgamaYPos, amalgamaProgress);
      let phase1Size = lerp(quadSize, cellSize, amalgamaProgress);
      
      // FASE 2: Si spostano dal centro all'istogramma (mantenendo dimensione finale)
      let currentX = lerp(phase1X, finalXPos, posizionamentoProgress);
      let currentY = lerp(phase1Y, finalYPos, posizionamentoProgress);
      let currentSize = phase1Size; // Mantiene la dimensione raggiunta nella fase 1
      
      fill(red(categoryColor), green(categoryColor), blue(categoryColor), 255);
      noStroke();
      rectMode(CORNER);
      rect(currentX, currentY, currentSize, currentSize);
      
      quadIndex++;
    }
    
    xPos += finalSize + finalQuadSpacing;
  }
  
  pop();
}

function drawFrecceNavigazioneTransizione(alpha) {
  // Versione delle frecce con alpha controllato per fade in durante transizione
  frecceSezioneOttava.sinistra.y = height / 2;
  frecceSezioneOttava.destra.x = width - 50;
  frecceSezioneOttava.destra.y = height / 2;
  
  let circleSize = frecceSezioneOttava.sinistra.size;
  let arrowWidth = circleSize * 0.65;
  let arrowHeight = circleSize * 0.35;
  
  let currentIndex = categorieArray.indexOf(categoriaSelezionata);
  let prevIndex = (currentIndex - 1 + categorieArray.length) % categorieArray.length;
  let nextIndex = (currentIndex + 1) % categorieArray.length;
  
  let prevColor = getOverlayColor(categorieArray[prevIndex]);
  let nextColor = getOverlayColor(categorieArray[nextIndex]);
  
  // Freccia sinistra
  push();
  stroke(red(prevColor), green(prevColor), blue(prevColor), alpha);
  strokeWeight(3);
  noFill();
  ellipse(frecceSezioneOttava.sinistra.x, frecceSezioneOttava.sinistra.y, circleSize, circleSize);
  
  fill(red(prevColor), green(prevColor), blue(prevColor), alpha);
  noStroke();
  beginShape();
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/2, frecceSezioneOttava.sinistra.y);
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/6, frecceSezioneOttava.sinistra.y - arrowHeight/2);
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/6, frecceSezioneOttava.sinistra.y - arrowHeight/4);
  vertex(frecceSezioneOttava.sinistra.x + arrowWidth/2, frecceSezioneOttava.sinistra.y - arrowHeight/4);
  vertex(frecceSezioneOttava.sinistra.x + arrowWidth/2, frecceSezioneOttava.sinistra.y + arrowHeight/4);
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/6, frecceSezioneOttava.sinistra.y + arrowHeight/4);
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/6, frecceSezioneOttava.sinistra.y + arrowHeight/2);
  endShape(CLOSE);
  pop();
  
  // Freccia destra
  push();
  stroke(red(nextColor), green(nextColor), blue(nextColor), alpha);
  strokeWeight(3);
  noFill();
  ellipse(frecceSezioneOttava.destra.x, frecceSezioneOttava.destra.y, circleSize, circleSize);
  
  fill(red(nextColor), green(nextColor), blue(nextColor), alpha);
  noStroke();
  beginShape();
  vertex(frecceSezioneOttava.destra.x + arrowWidth/2, frecceSezioneOttava.destra.y);
  vertex(frecceSezioneOttava.destra.x + arrowWidth/6, frecceSezioneOttava.destra.y - arrowHeight/2);
  vertex(frecceSezioneOttava.destra.x + arrowWidth/6, frecceSezioneOttava.destra.y - arrowHeight/4);
  vertex(frecceSezioneOttava.destra.x - arrowWidth/2, frecceSezioneOttava.destra.y - arrowHeight/4);
  vertex(frecceSezioneOttava.destra.x - arrowWidth/2, frecceSezioneOttava.destra.y + arrowHeight/4);
  vertex(frecceSezioneOttava.destra.x + arrowWidth/6, frecceSezioneOttava.destra.y + arrowHeight/4);
  vertex(frecceSezioneOttava.destra.x + arrowWidth/6, frecceSezioneOttava.destra.y + arrowHeight/2);
  endShape(CLOSE);
  pop();
}

function drawSezioneOttava() { //visualizzazione di dettaglio - ora sezione normale
  // Fade in sezione - inizia dopo il posizionamento
  if (scrollY > 6400 && scrollY < 6600) {
    sezioneOttavaFadeIn = map(scrollY, 6400, 6600, 0, 255);
    sezioneOttavaFadeIn = constrain(sezioneOttavaFadeIn, 0, 255);
  } else if (scrollY >= 6600) {
    sezioneOttavaFadeIn = 255;
  } else {
    sezioneOttavaFadeIn = 0;
  }
  
  if (sezioneOttavaFadeIn <= 0 || categoriaSelezionata === null) return;
  
  push();
  
  // Background nero completamente opaco (non più overlay)
  background(0);

  // Mostra dati dal CSV corrispondente
  let categoryData = getCategoriaData(categoriaSelezionata);
  if (categoryData) {
    fill(255, 255, 255, 255);
    textFont(lcdFont);
    textSize(40);
    textAlign(LEFT, TOP);
    let yPos = 100;
    text(categoriaSelezionata.toUpperCase(), 100, yPos);
    yPos += 80;
    
    // Disegna quadrati per ogni riga del dataset (escluso il totale)
    let categoryColor = getOverlayColor(categoriaSelezionata);
    let numRows = categoryData.getRowCount();
    let baseQuadSize = dimensioneQuadratino; // Usa la variabile calcolata nella sezione 7
    let quadSpacing = 40;
    
    // Calcola larghezza totale per centrare a destra
    let totalWidth = 0;
    for (let i = 0; i < numRows - 1; i++) {
      let i300 = int(categoryData.getString(i, 'I/300'));
      let area = baseQuadSize * baseQuadSize * i300;
      let size = (i300 >= 1) ? sqrt(area) : baseQuadSize;
      totalWidth += size + quadSpacing;
    }
    totalWidth -= quadSpacing;
    
    let xPos = width - 100 - totalWidth; // Inizia da destra
    let baselineY = height - 100; // Linea di base in basso
    
    sezioneOttavaSquareHitboxes = []; // Reset hitbox
    
    // Trova il massimo e minimo numero di lesionati per scalare l'altezza
    let maxLesionati = 0;
    let minLesionati = Infinity;
    for (let i = 0; i < numRows - 1; i++) {
      let lesionati = parseInt(categoryData.getString(i, 'Lesionati').replace(/[\s.]/g, '')) || 0;
      if (lesionati > maxLesionati) maxLesionati = lesionati;
      if (lesionati < minLesionati) minLesionati = lesionati;
    }
    
    // Altezze minime e massime per le barre
    let minBarHeight = 20;  // Altezza minima in pixel
    let maxBarHeight = height * 0.4; // Altezza massima
    
    // Calcola min e max percentuale di morti per il gradiente
    let minMortPercent = Infinity;
    let maxMortPercent = 0;
    for (let i = 0; i < numRows - 1; i++) {
      let morti = parseInt(categoryData.getString(i, 'Morti').replace(/[\s.]/g, '')) || 0;
      let incidenti = parseInt(categoryData.getString(i, 'Incidenti').replace(/[\s.]/g, '')) || 0;
      let mortPercent = (incidenti > 0) ? (morti * 100) / incidenti : 0;
      if (mortPercent < minMortPercent) minMortPercent = mortPercent;
      if (mortPercent > maxMortPercent) maxMortPercent = mortPercent;
    }
    
    // Prima passata: traccia quale elemento è hovato
    for (let i = 0; i < numRows - 1; i++) { // -1 per escludere l'ultima riga (che sarebbe quella di totale, quindi non ci interessa)
      let i300 = int(categoryData.getString(i, 'I/300'));
      let nome = categoryData.getString(i, 0);
      let lesionati = parseInt(categoryData.getString(i, 'Lesionati').replace(/[\s.]/g, '')) || 0;
      
      let area = baseQuadSize * baseQuadSize * i300;
      let quadSize = (i300 >= 1) ? sqrt(area) : baseQuadSize;
      let H = map(lesionati, minLesionati, maxLesionati, minBarHeight, maxBarHeight);
      
      let half = quadSize / 2;
      let cx = xPos + half;
      
      // Hitbox esteso: larghezza del cubo, altezza totale della colonna
      let hitboxLeft = cx - half;
      let hitboxRight = cx + half;
      let hitboxTop = baselineY - quadSize - H * sezioneOttavaTrans;
      let hitboxBottom = baselineY;
      
      if (mouseX >= hitboxLeft && mouseX <= hitboxRight && 
          mouseY >= hitboxTop && mouseY <= hitboxBottom) {
        hoveredSezioneOttavaItem = nome;
      }
      
      xPos += quadSize + quadSpacing;
    }
    
    // Reset xPos per la seconda passata
    xPos = width - 100 - totalWidth;
    
    // Seconda passata: disegna tutti i cubi con opacità corretta
    for (let i = 0; i < numRows - 1; i++) {
      let i300 = int(categoryData.getString(i, 'I/300'));
      let nome = categoryData.getString(i, 0); // Prima colonna: nome categoria
      let lesionati = parseInt(categoryData.getString(i, 'Lesionati').replace(/[\s.]/g, '')) || 0;
      let incidenti = parseInt(categoryData.getString(i, 'Incidenti').replace(/[\s.]/g, '')) || 0;
      let morti = parseInt(categoryData.getString(i, 'Morti').replace(/[\s.]/g, '')) || 0;
      
      // Calcola dimensione del quadrato in base a I/300
      let area = baseQuadSize * baseQuadSize * i300;
      let quadSize = (i300 >= 1) ? sqrt(area) : baseQuadSize;
      
      // Calcola altezza in base ai lesionati
      let H = map(lesionati, minLesionati, maxLesionati, minBarHeight, maxBarHeight);
      
      let half = quadSize / 2;
      let cx = xPos + half;
      
      // Determina opacità: 100% se hovato, 20% se altri sono hovati, 100% se nessuno è hovato
      let cubeOpacity = 1.0; // Opacità piena
      if (hoveredSezioneOttavaItem !== null && hoveredSezioneOttavaItem !== nome) {
        cubeOpacity = 0.3;
      }
      
      // Usa drawCubo per disegnare il parallelepipedo
      push();
      translate(cx, baselineY);
      drawCuboOverlay(half, H, sezioneOttavaTrans, categoryColor, i300 >= 1, lesionati, incidenti, nome, morti, cubeOpacity, minMortPercent, maxMortPercent);
      pop();
      
      if (nome === hoveredSezioneOttavaItem) {
        updateCatCausaInfo(nome, incidenti, lesionati, morti);
      }
      
      // Salva hitbox
      sezioneOttavaSquareHitboxes.push({
        x: xPos,
        y: baselineY - quadSize - H * sezioneOttavaTrans,
        w: quadSize,
        h: quadSize + H * sezioneOttavaTrans,
        index: i
      });
      
      xPos += quadSize + quadSpacing;
    }
    
    // Reset hover per il prossimo frame
    hoveredSezioneOttavaItem = null;
  }
  
  // Disegna frecce di navigazione laterali
  drawFrecceNavigazione();

  pop();
}

function drawFrecceNavigazione() {
  // Posiziona le frecce a metà altezza dello schermo
  frecceSezioneOttava.sinistra.y = height / 2;
  frecceSezioneOttava.destra.x = width - 50;
  frecceSezioneOttava.destra.y = height / 2;
  
  let circleSize = frecceSezioneOttava.sinistra.size;
  let arrowWidth = circleSize * 0.65; // Larghezza della freccia
  let arrowHeight = circleSize * 0.35; // Altezza della freccia
  
  // Determina categoria precedente e successiva
  let currentIndex = categorieArray.indexOf(categoriaSelezionata);
  let prevIndex = (currentIndex - 1 + categorieArray.length) % categorieArray.length;
  let nextIndex = (currentIndex + 1) % categorieArray.length;
  
  let prevColor = getOverlayColor(categorieArray[prevIndex]);
  let nextColor = getOverlayColor(categorieArray[nextIndex]);
  
  // Freccia sinistra (categoria precedente)
  push();
  let leftAlpha = frecceSezioneOttava.sinistra.hover ? 255 : 200;
  
  // Cerchio vuoto con bordo del colore della categoria precedente
  stroke(red(prevColor), green(prevColor), blue(prevColor), leftAlpha);
  strokeWeight(3);
  noFill();
  ellipse(frecceSezioneOttava.sinistra.x, frecceSezioneOttava.sinistra.y, circleSize, circleSize);
  
  // Freccia del colore della categoria precedente (verso sinistra)
  fill(red(prevColor), green(prevColor), blue(prevColor), leftAlpha);
  noStroke();
  beginShape();
  // Punta della freccia (sinistra)
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/2, frecceSezioneOttava.sinistra.y);
  // Lato superiore della punta
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/6, frecceSezioneOttava.sinistra.y - arrowHeight/2);
  // Parte alta del corpo
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/6, frecceSezioneOttava.sinistra.y - arrowHeight/6);
  vertex(frecceSezioneOttava.sinistra.x + arrowWidth/2, frecceSezioneOttava.sinistra.y - arrowHeight/6);
  // Parte bassa del corpo
  vertex(frecceSezioneOttava.sinistra.x + arrowWidth/2, frecceSezioneOttava.sinistra.y + arrowHeight/6);
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/6, frecceSezioneOttava.sinistra.y + arrowHeight/6);
  // Lato inferiore della punta
  vertex(frecceSezioneOttava.sinistra.x - arrowWidth/6, frecceSezioneOttava.sinistra.y + arrowHeight/2);
  endShape(CLOSE);
  pop();
  
  // Freccia destra (categoria successiva)
  push();
  let rightAlpha = frecceSezioneOttava.destra.hover ? 255 : 200;
  
  // Cerchio vuoto con bordo del colore della categoria successiva
  stroke(red(nextColor), green(nextColor), blue(nextColor), rightAlpha);
  strokeWeight(3);
  noFill();
  ellipse(frecceSezioneOttava.destra.x, frecceSezioneOttava.destra.y, circleSize, circleSize);
  
  // Freccia del colore della categoria successiva (verso destra)
  fill(red(nextColor), green(nextColor), blue(nextColor), rightAlpha);
  noStroke();
  beginShape();
  // Punta della freccia (destra)
  vertex(frecceSezioneOttava.destra.x + arrowWidth/2, frecceSezioneOttava.destra.y);
  // Lato superiore della punta
  vertex(frecceSezioneOttava.destra.x + arrowWidth/6, frecceSezioneOttava.destra.y - arrowHeight/2);
  // Parte alta del corpo
  vertex(frecceSezioneOttava.destra.x + arrowWidth/6, frecceSezioneOttava.destra.y - arrowHeight/6);
  vertex(frecceSezioneOttava.destra.x - arrowWidth/2, frecceSezioneOttava.destra.y - arrowHeight/6);
  // Parte bassa del corpo
  vertex(frecceSezioneOttava.destra.x - arrowWidth/2, frecceSezioneOttava.destra.y + arrowHeight/6);
  vertex(frecceSezioneOttava.destra.x + arrowWidth/6, frecceSezioneOttava.destra.y + arrowHeight/6);
  // Lato inferiore della punta
  vertex(frecceSezioneOttava.destra.x + arrowWidth/6, frecceSezioneOttava.destra.y + arrowHeight/2);
  endShape(CLOSE);
  pop();
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
  // Gestione click nella sezione 8
  if (scrollY >= 6500 && scrollY < 6700) {
    // Click sulle frecce laterali per navigare tra categorie
    let arrowSize = frecceSezioneOttava.sinistra.size;
    
    // Freccia sinistra
    if (dist(mouseX, mouseY, frecceSezioneOttava.sinistra.x, frecceSezioneOttava.sinistra.y) < arrowSize) {
      let currentIndex = categorieArray.indexOf(categoriaSelezionata);
      let prevIndex = (currentIndex - 1 + categorieArray.length) % categorieArray.length;
      categoriaSelezionata = categorieArray[prevIndex];
      sezioneOttavaTrans = 0; // Reset animazione barre
      transizioneAttiva = false; // Disattiva transizione
      return;
    }
    
    // Freccia destra
    if (dist(mouseX, mouseY, frecceSezioneOttava.destra.x, frecceSezioneOttava.destra.y) < arrowSize) {
      let currentIndex = categorieArray.indexOf(categoriaSelezionata);
      let nextIndex = (currentIndex + 1) % categorieArray.length;
      categoriaSelezionata = categorieArray[nextIndex];
      sezioneOttavaTrans = 0; // Reset animazione barre
      transizioneAttiva = false; // Disattiva transizione
      return;
    }
    
    // Click su un qualsiasi quadrato: toggle tutte le barre
    for (let hitbox of sezioneOttavaSquareHitboxes) {
      if (mouseX >= hitbox.x && mouseX <= hitbox.x + hitbox.w &&
          mouseY >= hitbox.y && mouseY <= hitbox.y + hitbox.h) {
        showBars = !showBars;
        return;
      }
    }
  }

  let frecciaY = height - 45;
  let distanza = dist(mouseX, mouseY, width / 2, frecciaY);
  
  if (distanza < 20) {
    if (sottotitoloOpacita > 100 && quadratoFrecciaOpacita < 50) {
      scrollTarget = 800;
    } else if (quadratoFrecciaOpacita > 100) {
      scrollTarget = 1400;
    }
  }

  // Se click su hitbox nella sezione 7, scrolla alla sezione 8 con la categoria selezionata
  if (scrollY >= 4850 && scrollY < 6500 && sezioneOttavaHitboxes.length) {
    for (let i = 0; i < sezioneOttavaHitboxes.length; i++) {
      let hb = sezioneOttavaHitboxes[i];
      if (mouseX >= hb.x && mouseX <= hb.x + hb.w && mouseY >= hb.y && mouseY <= hb.y + hb.h) {
        // Imposta la categoria in base all'indice: 0=conducenti, 1=cause-esterne, 2=non-conducenti
        if (i === 0) {
          categoriaSelezionata = 'conducenti';
        } else if (i === 1) {
          categoriaSelezionata = 'cause-esterne-concomitanti';
        } else if (i === 2) {
          categoriaSelezionata = 'non-conducenti';
        }
        // Attiva la transizione animata
        transizioneAttiva = true;
        transizioneProgress = 0;
        // Scrolla alla sezione 8
        scrollTarget = 6500;
        break;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Aumenta altezza per includere sezione 8 con transizione più lunga (fino a ~6700px)
  document.body.style.height = (windowHeight * 4) + 'px';
}
