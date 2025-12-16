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
let hoveredGridIndex = -1; // Traccia quale griglia è in hover (-1 = nessuna, 0 = blu, 1 = verde, 2 = rosa)
let hoverScales = [1, 1, 1]; // Scale per ogni griglia (animato con lerp)
let hoverScaleTarget = [1, 1, 1]; // Target scale per smooth animation
let categoriaSelezionata = null; // 'conducenti' | 'cause-esterne-concomitanti' | 'non-conducenti'
let hasClickedCategory = false; // Traccia se l'utente ha cliccato su una categoria
const categorie = ['conducenti', 'cause-esterne-concomitanti', 'non-conducenti'];
let sezioneOttavaSquareHitboxes = []; // hitbox per i quadrati
let showBars = false; // false = quadrati, true = istogramma con barre
let sezioneOttavaTrans = 0; // 0 = quadrati, 1 = parallelepipedi (animazione)
let sezioneOttavaTransTarget = 0; // target per l'animazione
let hoveredSezioneOttavaItem = null; // traccia quale elemento è in hover
let sezioneOttavaFadeIn = 0; // fade in della sezione 8
// Margine usato per il layout interno della sezione 8 e per le legende
const SEZIONE_MARGIN = 100;

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
  
  // Gestisci hash URL per navigazione da altre pagine
  handleURLHash();
  
  // Setup scroll arrows click handlers
  let scrollArrowDown = document.getElementById('scroll-arrow-down');
  if (scrollArrowDown) {
    scrollArrowDown.addEventListener('click', function() {
      // Vai al prossimo checkpoint
      if (currentCheckpointIndex < scrollCheckpoints.length - 1) {
        currentCheckpointIndex++;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
        scrollAccumulator = 0;
      }
    });
  }
  
  let scrollArrowUp = document.getElementById('scroll-arrow-up');
  if (scrollArrowUp) {
    scrollArrowUp.addEventListener('click', function() {
      // Vai al checkpoint precedente
      if (currentCheckpointIndex > 0) {
        currentCheckpointIndex--;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
        scrollAccumulator = 0;
      }
    });
  }
  
  // Back arrow: torna alla sezione responsabilità (scroll 5200)
  let backArrow = document.getElementById('back-arrow');
  if (backArrow) {
    backArrow.addEventListener('click', function() {
      scrollTarget = 5200;
      currentCheckpointIndex = 8; // Checkpoint 5200
      isScrolling = true;
      scrollAccumulator = 0;
      categoriaSelezionata = null; // Reset categoria
      hasClickedCategory = false; // Reset flag
    });
  }
  
  // Frecce navigazione dettaglio: cambio categoria
  let detailArrowLeft = document.getElementById('detail-arrow-left');
  let detailArrowRight = document.getElementById('detail-arrow-right');
  
  if (detailArrowLeft) {
    detailArrowLeft.addEventListener('click', function() {
      if (categoriaSelezionata !== null) {
        let currentIndex = categorieArray.indexOf(categoriaSelezionata);
        let prevIndex = (currentIndex - 1 + categorieArray.length) % categorieArray.length;
        categoriaSelezionata = categorieArray[prevIndex];
      }
    });
  }
  
  if (detailArrowRight) {
    detailArrowRight.addEventListener('click', function() {
      if (categoriaSelezionata !== null) {
        let currentIndex = categorieArray.indexOf(categoriaSelezionata);
        let nextIndex = (currentIndex + 1) % categorieArray.length;
        categoriaSelezionata = categorieArray[nextIndex];
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

// Gestisce hash URL per navigazione da altre pagine
function handleURLHash() {
  const hash = window.location.hash;
  
  if (hash === '#incidenti') {
    // Vai alla sezione incidenti
    currentCheckpointIndex = 3;
    scrollY = 2900;
    scrollTarget = -1;
    isScrolling = false;
    scrollAccumulator = 0;
  } else if (hash === '#responsabilita') {
    // Vai alla sezione responsabilità
    currentCheckpointIndex = 8;
    scrollY = 5200;
    scrollTarget = -1;
    isScrolling = false;
    scrollAccumulator = 0;
  }
  // Se non c'è hash o è #intro, rimane all'inizio (default)
}

function mouseWheel(event) {
  if (scrollTarget !== -1) {
    // Se c'è già un'animazione in corso, ignora lo scroll
    return false;
  }
  
  // Blocca scroll a 5200 (checkpoint index 8) se non ha cliccato una categoria
  if (currentCheckpointIndex === 8 && !hasClickedCategory && event.delta > 0) {
    // Impedisci scroll in avanti oltre 5200
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
  updateHoverScales(); // Aggiorna animazione hover
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
  const container = placeCatCausaContainer();
  
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
  // Crea un singolo contenitore legenda che verrà aggiornato dinamicamente
  if (!document.getElementById('legend')) {
    let legend = document.createElement('div');
    legend.id = 'legend';
    // Applichiamo gli stessi stili della classe `.container` via JS inline
    legend.style.display = 'none';
    legend.style.position = 'fixed';
    legend.style.backgroundColor = 'rgba(217,217,217,0.125)';
    legend.style.width = '300px';
    legend.style.padding = '1.5em';
    legend.style.borderRadius = '20px';
    legend.style.display = 'flex';
    legend.style.flexDirection = 'column';
    legend.style.justifyContent = 'left';
    legend.style.gap = '1em';
    legend.style.left = SEZIONE_MARGIN + 'px';
    legend.style.top = (SEZIONE_MARGIN + 60) + 'px';
    legend.style.boxSizing = 'border-box';
    legend.style.zIndex = '999';
    document.body.appendChild(legend);
  }

  // Crea anche il contenitore per le informazioni di categoria (catCausa) interamente via JS
  if (!document.getElementById('catCausaContainer')) {
    let cat = document.createElement('div');
    cat.id = 'catCausaContainer';
    // Applichiamo inline gli stessi stili di `.catCausa`
    cat.style.display = 'none';
    cat.style.position = 'fixed';
    cat.style.width = '400px';
    cat.style.padding = '1.5em';
    cat.style.display = 'flex';
    cat.style.flexDirection = 'column';
    cat.style.justifyContent = 'left';
    cat.style.gap = '1em';
    cat.style.left = (SEZIONE_MARGIN + 320) + 'px';
    cat.style.top = (SEZIONE_MARGIN + 50) + 'px';
    cat.style.color = 'white';
    cat.style.fontFamily = 'Transport, Arial, Helvetica, sans-serif';
    cat.style.fontSize = '14px';
    cat.style.lineHeight = '1.2';
    cat.style.maxWidth = '320px';
    cat.style.pointerEvents = 'none';
    cat.style.boxSizing = 'border-box';
    cat.style.zIndex = '999';
    document.body.appendChild(cat);
  }
}

// Ensure the category detail container exists and return it.
function placeCatCausaContainer() {
  let container = document.getElementById('catCausaContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'catCausaContainer';
    // Applichiamo inline gli stessi stili di `.catCausa`
    container.style.display = 'none';
    container.style.position = 'fixed';
    container.style.width = '400px';
    container.style.padding = '1.5em';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'left';
    container.style.gap = '1em';
    container.style.left = (SEZIONE_MARGIN + 320) + 'px';
    container.style.top = (SEZIONE_MARGIN + 50) + 'px';
    container.style.color = 'white';
    container.style.fontFamily = 'Transport, Arial, Helvetica, sans-serif';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.2';
    container.style.maxWidth = '320px';
    container.style.pointerEvents = 'none';
    container.style.boxSizing = 'border-box';
    container.style.zIndex = '999';
    document.body.appendChild(container);
  }
  return container;
}

function updateLegendVisibility() {
  let legend = document.getElementById('legend');
  let catCausa = document.getElementById('catCausaContainer');

  // Mostra la legenda dinamicamente solo nella sezione 8
  if (scrollY >= 6500 && scrollY < 6700 && categoriaSelezionata !== null) {
    if (legend) {
      legend.style.display = 'flex';
      legend.style.left = SEZIONE_MARGIN + 'px';
      legend.style.top = (SEZIONE_MARGIN + 60) + 'px';

      // Imposta il contenuto in base al tipo di visualizzazione
      if (!showBars) {
        // Contenuto per 'incidenti' creato interamente via JS con inline styles
        legend.innerHTML = '';
        let h = document.createElement('h3');
        h.style.color = 'white';
        h.style.margin = '0';
        h.style.fontFamily = 'Transport, Arial, Helvetica, sans-serif';
        h.style.fontSize = '18px';
        h.textContent = 'Legenda';
        legend.appendChild(h);

        // riga 1: rect pieno + testo
        let r1 = document.createElement('div');
        r1.style.display = 'flex';
        r1.style.flexDirection = 'row';
        r1.style.alignItems = 'center';
        r1.style.gap = '1em';
        let rectWrapper = document.createElement('div');
        rectWrapper.style.width = '2em';
        rectWrapper.style.display = 'flex';
        rectWrapper.style.justifyContent = 'center';
        rectWrapper.style.alignItems = 'center';
        rectWrapper.style.flexShrink = '0';
        let rect = document.createElement('div');
        rect.style.width = '2em';
        rect.style.height = '2em';
        rect.style.flexShrink = '0';
        rect.style.backgroundColor = '#ffffff';
        rectWrapper.appendChild(rect);
        r1.appendChild(rectWrapper);
        let t1 = document.createElement('div');
        t1.style.color = 'white';
        t1.textContent = 'area proporzionale al numero di incidenti';
        r1.appendChild(t1);
        legend.appendChild(r1);

        // riga 2: empty rect + testo
        let r2 = document.createElement('div');
        r2.style.display = 'flex';
        r2.style.flexDirection = 'row';
        r2.style.alignItems = 'center';
        r2.style.gap = '1em';
        let emptyWrapper = document.createElement('div');
        emptyWrapper.style.width = '2em';
        emptyWrapper.style.display = 'flex';
        emptyWrapper.style.justifyContent = 'center';
        emptyWrapper.style.alignItems = 'center';
        emptyWrapper.style.flexShrink = '0';
        let empty = document.createElement('div');
        empty.style.width = '0.7em';
        empty.style.height = '0.7em';
        empty.style.flexShrink = '0';
        empty.style.border = '2px solid #ffffff';
        empty.style.boxSizing = 'border-box';
        emptyWrapper.appendChild(empty);
        r2.appendChild(emptyWrapper);
        let t2 = document.createElement('div');
        t2.style.color = 'white';
        t2.textContent = 'numero di incidenti inferiore a 300';
        r2.appendChild(t2);
        legend.appendChild(r2);
      } else {
        // Contenuto per 'lesionati'
        legend.innerHTML = '';
        let h = document.createElement('h3');
        h.style.color = 'white';
        h.style.margin = '0';
        h.style.fontFamily = 'Transport, Arial, Helvetica, sans-serif';
        h.style.fontSize = '18px';
        h.textContent = 'Legenda';
        legend.appendChild(h);

        let r1 = document.createElement('div');
        r1.style.display = 'flex';
        r1.style.flexDirection = 'row';
        r1.style.alignItems = 'center';
        r1.style.gap = '1em';
        let cubeCanvas = createLegendCubeCanvasStyled(88);
        cubeCanvas.style.marginRight = '8px';
        cubeCanvas.style.flexShrink = '0';
        r1.appendChild(cubeCanvas);
        let t1 = document.createElement('div');
        t1.style.color = 'white';
        t1.textContent = 'altezza proporzionale al numero di lesionati';
        r1.appendChild(t1);
        legend.appendChild(r1);

        let r2 = document.createElement('div');
        r2.style.display = 'flex';
        r2.style.flexDirection = 'row';
        r2.style.alignItems = 'center';
        r2.style.gap = '1em';
        let grad = document.createElement('div');
        grad.style.width = '10em';
        grad.style.height = '0.5em';
        grad.style.borderRadius = '20px';
        grad.style.background = 'linear-gradient(to right, #ffffff, #ff8b43)';
        r2.appendChild(grad);
        let t2 = document.createElement('div');
        t2.style.color = 'white';
        t2.textContent = 'opacità proporzionale alla percentuale di incidenti mortali';
        r2.appendChild(t2);
        legend.appendChild(r2);
      }
    }

    if (catCausa) catCausa.style.display = 'block';
  } else {
    if (legend) legend.style.display = 'none';
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

function updateHoverScales() {
  // Smooth interpolation per scale animation (chiamato ogni frame)
  for (let i = 0; i < 3; i++) {
    hoverScales[i] = lerp(hoverScales[i], hoverScaleTarget[i], 0.15);
  }
}

function updateCursor() { // cursore mano sugli elementi cliccabili
  // Sezione 7: hover sulle categorie cliccabili
  hoveredGridIndex = -1; // Reset
  
  // Aggiorna target scale per tutte le griglie
  hoverScaleTarget = [1, 1, 1];
  
  if (scrollY >= 5100 && scrollY < 6500 && sezioneOttavaHitboxes.length > 0) {
    for (let i = 0; i < sezioneOttavaHitboxes.length; i++) {
      let hitbox = sezioneOttavaHitboxes[i];
      if (isMouseOver(hitbox.x, hitbox.y, hitbox.w, hitbox.h)) {
        cursor(HAND);
        hoveredGridIndex = i;
        hoverScaleTarget[i] = 1.05; // Zoom del 5%
        return;
      }
    }
  }
  
  // Sezione 8: hover sui cubi
  if (scrollY >= 6500 && scrollY < 6700) {
    
    // Check hover sui cubi
    if (sezioneOttavaSquareHitboxes.length > 0) {
      for (let hitbox of sezioneOttavaSquareHitboxes) {
        if (isMouseOver(hitbox.x, hitbox.y, hitbox.w, hitbox.h)) {
          cursor(HAND);
          return;
        }
      }
    }
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
    text('Scoprila analizzando i dati ISTAT del 2024', width / 2, height - 100);
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
  
  // Aggiorna link categoria dinamico
  updateNavbarCategoria();
  
  // Mostra/nascondi navbar in base all'opacità
  if (navbarOpacita > 50) {
    navbar.classList.add('visible');
  } else {
    navbar.classList.remove('visible');
  }
  
  // Aggiorna quale sezione è attiva
  let navItems = document.querySelectorAll('.nav-item');
  
  // Se siamo nella sezione dettaglio (scrollY >= 6500 e categoria selezionata), attiva Responsabilità + categoria
  if (scrollY >= 6500 && categoriaSelezionata !== null) {
    navItems.forEach((item) => {
      // Attiva sia Responsabilità (data-section="2") che la categoria
      if (item.dataset.section === '2' || item.id === 'nav-categoria') {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  } else {
    // Altrimenti usa la logica normale basata su sezioneAttiva
    navItems.forEach((item, index) => {
      if (index === sezioneAttiva) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
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
  
  // SCROLL ARROWS: Gestisci visibilità e animazioni
  let scrollArrowDown = document.getElementById('scroll-arrow-down');
  let scrollArrowUp = document.getElementById('scroll-arrow-up');
  let arrowsContainer = document.querySelector('.scroll-arrows-container');
  let backArrow = document.getElementById('back-arrow');
  
  let upVisible = false;
  let downVisible = false;
  
  // BACK ARROW: Mostra nella sezione dettaglio
  if (backArrow) {
    if (scrollY >= 6500 && categoriaSelezionata !== null) {
      backArrow.classList.add('visible');
    } else {
      backArrow.classList.remove('visible');
    }
  }
  
  // DETAIL ARROWS: Gestisci visibilità e colori dinamici
  let detailArrowLeft = document.getElementById('detail-arrow-left');
  let detailArrowRight = document.getElementById('detail-arrow-right');
  
  if (detailArrowLeft && detailArrowRight && categoriaSelezionata !== null) {
    // Mostra le frecce nella sezione dettaglio
    if (scrollY >= 6500) {
      detailArrowLeft.classList.add('visible');
      detailArrowRight.classList.add('visible');
      
      // Calcola categoria precedente e successiva
      let currentIndex = categorieArray.indexOf(categoriaSelezionata);
      let prevIndex = (currentIndex - 1 + categorieArray.length) % categorieArray.length;
      let nextIndex = (currentIndex + 1) % categorieArray.length;
      
      // Ottieni i colori
      let prevColor = getOverlayColor(categorieArray[prevIndex]);
      let nextColor = getOverlayColor(categorieArray[nextIndex]);
      
      // Converti colori p5 in RGB CSS
      let prevRGB = `rgb(${red(prevColor)}, ${green(prevColor)}, ${blue(prevColor)})`;
      let nextRGB = `rgb(${red(nextColor)}, ${green(nextColor)}, ${blue(nextColor)})`;
      
      // Applica i colori ai bordi e agli stroke degli SVG
      detailArrowLeft.style.borderColor = prevRGB;
      detailArrowLeft.querySelector('svg path').setAttribute('stroke', prevRGB);
      
      detailArrowRight.style.borderColor = nextRGB;
      detailArrowRight.querySelector('svg path').setAttribute('stroke', nextRGB);
    } else {
      detailArrowLeft.classList.remove('visible');
      detailArrowRight.classList.remove('visible');
    }
  } else if (detailArrowLeft && detailArrowRight) {
    detailArrowLeft.classList.remove('visible');
    detailArrowRight.classList.remove('visible');
  }
  
  // Freccia giù: nascondi quando sei al checkpoint 4900 (indice 7) o oltre
  if (scrollArrowDown) {
    if (currentCheckpointIndex >= 8) {
      scrollArrowDown.style.opacity = '0';
      scrollArrowDown.style.pointerEvents = 'none';
    } else {
      scrollArrowDown.style.opacity = '1';
      scrollArrowDown.style.pointerEvents = 'all';
      downVisible = true;
    }
    
    // Attiva/disattiva animazione bounce: solo quando NON si sta scrollando
    if (isScrolling) {
      scrollArrowDown.style.animationPlayState = 'paused';
    } else {
      scrollArrowDown.style.animationPlayState = 'running';
    }
  }
  
  // Freccia su: nascondi quando sei al primo checkpoint o quando scrollY supera 5200
  if (scrollArrowUp) {
    if (currentCheckpointIndex <= 0 || scrollY > 5200) {
      scrollArrowUp.style.opacity = '0';
      scrollArrowUp.style.pointerEvents = 'none';
    } else {
      scrollArrowUp.style.opacity = '0.5';
      scrollArrowUp.style.pointerEvents = 'all';
      upVisible = true;
    }
  }
  
  // Centra il container in base alle frecce visibili
  if (arrowsContainer) {
    if (upVisible && downVisible) {
      // Entrambe visibili: centra la coppia
      arrowsContainer.style.transform = 'translateX(-50%)';
    } else if (upVisible) {
      // Solo freccia su: offset per centrare la singola
      arrowsContainer.style.transform = 'translateX(calc(-50% + 22px))';
    } else if (downVisible) {
      // Solo freccia giù: offset per centrare la singola
      arrowsContainer.style.transform = 'translateX(calc(-50% - 22px))';
    }
  }
}

// NAVBAR CATEGORIA: Aggiorna il link dinamico della categoria di dettaglio
function updateNavbarCategoria() {
  let navCategoria = document.getElementById('nav-categoria');
  let navSeparator = document.getElementById('nav-separator');
  if (!navCategoria) return;
  
  // Mostra/nascondi in base a se siamo nella sezione dettaglio
  if (categoriaSelezionata !== null && scrollY >= 6500) {
    navCategoria.style.display = 'block';
    if (navSeparator) navSeparator.style.display = 'inline';
    
    // Aggiorna il testo in base alla categoria
    if (categoriaSelezionata === 'conducenti') {
      navCategoria.textContent = 'Conducenti';
    } else if (categoriaSelezionata === 'cause-esterne-concomitanti') {
      navCategoria.textContent = 'Cause esterne';
    } else if (categoriaSelezionata === 'non-conducenti') {
      navCategoria.textContent = 'Non conducenti';
    }
  } else {
    navCategoria.style.display = 'none';
    if (navSeparator) navSeparator.style.display = 'none';
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
  let centerY = height * 0.45; // Posizione responsive (45% dell'altezza dello schermo)
  
  // Quadrato bianco
  if (quadratoDimensione > 0) {
    push();
    rectMode(CENTER);
    fill(255, 255, 255, quadratoFadeOut);
    rect(width / 2, centerY, quadratoDimensione, quadratoDimensione);
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
    text(testoMostrato, width / 2, centerY + quadratoDimensione / 2 + 20);
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
  
  // Testo (ora sotto il cubo)
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
    text(testoMostrato, width / 2, height / 2 + 180);
    pop();
  }
}

function drawCubo(quintaSezioneOpacita, quintaSezioneFadeOut) {
  push();
  translate(width / 2, height / 2 - 140);
  
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

// Crea un cubo nello stile di sezionequinta per la legenda
function createLegendCubeCanvasStyled(size) {
  // Crea il canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  
  // Posizioni e dimensioni
  const centerX = size / 2;
  const centerY = size / 2.2;
  const halfWidth = size * 0.22;
  const sideHeight = size * 0.35;
  
  // Calcoli per la rotazione isometrica (45 gradi)
  const angle = Math.PI / 4;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const squashFactor = 0.38;
  
  // Funzione per ruotare i punti
  function rotatePoint(x, y) {
    let rotatedX = x * cosine - y * sine;
    let rotatedY = (x * sine + y * cosine) * squashFactor;
    return {
      x: centerX + rotatedX,
      y: centerY + rotatedY
    };
  }
  
  // Calcola i 4 punti del top
  const topLeft = rotatePoint(-halfWidth, -halfWidth);
  const topRight = rotatePoint(halfWidth, -halfWidth);
  const bottomRight = rotatePoint(halfWidth, halfWidth);
  const bottomLeft = rotatePoint(-halfWidth, halfWidth);
  
  // Disegna le due facce laterali (vuote)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(1, size * 0.07);
  
  // Faccia sinistra
  ctx.beginPath();
  ctx.moveTo(bottomLeft.x, bottomLeft.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.lineTo(bottomRight.x, bottomRight.y + sideHeight);
  ctx.lineTo(bottomLeft.x, bottomLeft.y + sideHeight);
  ctx.closePath();
  ctx.stroke();
  
  // Faccia destra
  ctx.beginPath();
  ctx.moveTo(bottomRight.x, bottomRight.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.lineTo(topRight.x, topRight.y + sideHeight);
  ctx.lineTo(bottomRight.x, bottomRight.y + sideHeight);
  ctx.closePath();
  ctx.stroke();
  
  // Disegna il top bianco
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(topLeft.x, topLeft.y);
  ctx.lineTo(topRight.x, topRight.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Disegna gli spigoli verticali
  ctx.beginPath();
  ctx.moveTo(topRight.x, topRight.y);
  ctx.lineTo(topRight.x, topRight.y + sideHeight);
  ctx.moveTo(bottomRight.x, bottomRight.y);
  ctx.lineTo(bottomRight.x, bottomRight.y + sideHeight);
  ctx.moveTo(bottomLeft.x, bottomLeft.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y + sideHeight);
  ctx.stroke();
  
  // Disegna il bordo della base
  ctx.beginPath();
  ctx.moveTo(bottomLeft.x, bottomLeft.y + sideHeight);
  ctx.lineTo(bottomRight.x, bottomRight.y + sideHeight);
  ctx.lineTo(topRight.x, topRight.y + sideHeight);
  ctx.stroke();
  
  return canvas;
}

// Funzione per disegnare i cubi nell'istogramma (simile a drawCubo, senza troncamento alla base)
function drawCuboIstogramma(half, H, trans, categoryColor, isFilled, lesionati, incidenti, nome, morti, cubeOpacity, minMortPercent, maxMortPercent) {
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
    : 0.5;
  normalizedPercent = constrain(normalizedPercent, 0, 1);
  // Gradiente da bianco a arancione
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
  
  // Punti del top (in alto)
  let p0 = rot(base[0], sideH);
  let p1 = rot(base[1], sideH);
  let p2 = rot(base[2], sideH);
  let p3 = rot(base[3], sideH);
  
  // Punti della base (in basso, senza troncamento)
  let bL0 = rot(base[3], 0);
  let bL1 = rot(base[0], 0);
  let L0 = {x: bL0.x, y: 0};
  let L1 = {x: bL1.x, y: 0};
  let L2 = rot(base[0], sideH);
  let L3 = rot(base[3], sideH);
  let L = [L0, L1, L2, L3];
  
  let mirror = (pt) => ({x: -pt.x, y: pt.y});
  let R = [mirror(L0), mirror(L1), mirror(L2), mirror(L3)];
  
  // Lati con gradiente bianco-arancione
  if (sideH > 0) {
    fill(red(sideColor), green(sideColor), blue(sideColor), 255 * cubeOpacity);
    noStroke();
    quad(L[0].x, L[0].y, L[1].x, L[1].y, L[2].x, L[2].y, L[3].x, L[3].y);
    quad(R[0].x, R[0].y, R[1].x, R[1].y, R[2].x, R[2].y, R[3].x, R[3].y);
    // Outline nero per effetto giuntura
    push();
    stroke(0, 140 * cubeOpacity);
    strokeWeight(1.2);
    strokeJoin(ROUND);
    noFill();
    quad(L[0].x, L[0].y, L[1].x, L[1].y, L[2].x, L[2].y, L[3].x, L[3].y);
    quad(R[0].x, R[0].y, R[1].x, R[1].y, R[2].x, R[2].y, R[3].x, R[3].y);
    pop();
  }
  
  // Top del cubo
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
  
  // Se l'elemento rappresenta meno di 300 incidenti, disegna
  // un secondo "top" più piccolo,
  // del colore della categoria (rispetta cubeOpacity sull'alpha)
  if (incidenti < 300) {
    push();
    // calcola centro del top
    let cx_small = (p0.x + p1.x + p2.x + p3.x) / 4.0;
    let cy_small = (p0.y + p1.y + p2.y + p3.y) / 4.0;
    let shrink = 0.65;
    let sp0x = cx_small + (p0.x - cx_small) * shrink;
    let sp0y = cy_small + (p0.y - cy_small) * shrink;
    let sp1x = cx_small + (p1.x - cx_small) * shrink;
    let sp1y = cy_small + (p1.y - cy_small) * shrink;
    let sp2x = cx_small + (p2.x - cx_small) * shrink;
    let sp2y = cy_small + (p2.y - cy_small) * shrink;
    let sp3x = cx_small + (p3.x - cx_small) * shrink;
    let sp3y = cy_small + (p3.y - cy_small) * shrink;

    noFill();
    stroke(red(categoryColor), green(categoryColor), blue(categoryColor), 255 * cubeOpacity);
    strokeWeight(1.5);
    // bordo esterno per il top interno
    quad(sp0x, sp0y, sp1x, sp1y, sp2x, sp2y, sp3x, sp3y);


    pop();
  }


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
  if (scrollY > 3850 && scrollY < 4100) {
    counterFadeOut = map(scrollY, 3850, 4100, 255, 0);
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
    textSize(width * 0.02);
    text("SOLO OGGI, NEL 2024, A QUEST’ORA:", width / 2, height * 0.3);

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
    
    // Testo informativo sotto il counter
    textFont(transportFont);
    textSize(width * 0.012);
    fill(255, 255, 255, counterFadeOut);
    text("[si aggiorna in tempo reale]", width / 2, height * 0.35);
    
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
  
  // Transizione "MA DI CHI È LA COLPA?" - rimpicciolisce e si sposta sopra quando appare la griglia
  let colpaOpacity = colpaFadeIn;
  let colpaTextSize = width * 0.03;
  let colpaPosY = height / 2;
  
  if (scrollY > 4300 && scrollY < 4600) {
    // Durante la transizione: rimpicciolisce e si sposta in alto (anticipata)
    let transitionProgress = map(scrollY, 4300, 4600, 0, 1);
    transitionProgress = constrain(transitionProgress, 0, 1);
    
    colpaTextSize = lerp(width * 0.03, width * 0.025, transitionProgress);
    colpaPosY = lerp(height / 2, height * 0.2, transitionProgress);
  } else if (scrollY >= 4600) {
    // Dopo la transizione: piccolo e in alto
    colpaTextSize = width * 0.025;
    colpaPosY = height * 0.2;
  }
  
  if (colpaOpacity > 0 && scrollY < 6500) {
    push();
    textAlign(CENTER, CENTER);
    textFont(lcdFont);
    textSize(colpaTextSize);
    fill(255, 122, 0, colpaOpacity);
    text("MA DI CHI È LA COLPA?", width / 2, colpaPosY);
    pop();
  }
}

function drawSezioneSettima() {
  // Non disegnare se siamo nella sezione 8 o in transizione attiva oltre 5200
  if (scrollY >= 6500) return;
  if (transizioneAttiva && scrollY > 5200) return;
  
  // Fade in griglia più veloce (100px invece di 150px)
  let grigliaFadeIn = 0;
  if (scrollY > 4500 && scrollY < 4600) {
    grigliaFadeIn = map(scrollY, 4500, 4600, 0, 255);
    grigliaFadeIn = constrain(grigliaFadeIn, 0, 255);
    animRegroupActive = true;
  } else if (scrollY >= 4600) {
    grigliaFadeIn = 255;
    animRegroupActive = true;
  } else {
    grigliaFadeIn = 0;
    animRegroupActive = false;
  }
  
  // Transizione colore da bianco a colori originali (200px di scroll dopo fade in, totale 300px)
  let colorTransition = 0;
  if (scrollY > 4700 && scrollY < 4900) {
    colorTransition = map(scrollY, 4700, 4900, 0, 1);
    colorTransition = constrain(colorTransition, 0, 1);
  } else if (scrollY >= 4900) {
    colorTransition = 1;
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
  let y0 = (height - numeroRighe * (quadSize + quadSpacing)) / 2 + 30;
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
  let topY = height / 2 - max(blueDims.rows, greenDims.rows, pinkDims.rows) * (quadSize + quadSpacing) / 2 + 60;
  
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
    
    // Applica effetto hover: abbassa opacità delle griglie non in hover
    let quadOpacity = grigliaFadeIn;
    let gridIndex = -1;
    let centerX = 0, centerY = 0;
    
    if (hoveredGridIndex !== -1) {
      let isHovered = false;
      if (red(fillCol) === 0 && green(fillCol) === 161) {
        gridIndex = 0;
        centerX = blueStartX + (blueDims.cols * (quadSize + quadSpacing)) / 2;
        centerY = topY + (blueDims.rows * (quadSize + quadSpacing)) / 2;
        isHovered = (hoveredGridIndex === 0);
      } else if (red(fillCol) === 51 && green(fillCol) === 187) {
        gridIndex = 1;
        centerX = greenStartX + (greenDims.cols * (quadSize + quadSpacing)) / 2;
        centerY = topY + (greenDims.rows * (quadSize + quadSpacing)) / 2;
        isHovered = (hoveredGridIndex === 1);
      } else {
        gridIndex = 2;
        centerX = pinkStartX + (pinkDims.cols * (quadSize + quadSpacing)) / 2;
        centerY = topY + (pinkDims.rows * (quadSize + quadSpacing)) / 2;
        isHovered = (hoveredGridIndex === 2);
      }
      
      if (!isHovered) {
        quadOpacity = grigliaFadeIn * 0.3; // Abbassa opacità al 30%
      }
    } else {
      // Determina a quale griglia appartiene per lo scale
      if (red(fillCol) === 0 && green(fillCol) === 161) {
        gridIndex = 0;
        centerX = blueStartX + (blueDims.cols * (quadSize + quadSpacing)) / 2;
        centerY = topY + (blueDims.rows * (quadSize + quadSpacing)) / 2;
      } else if (red(fillCol) === 51 && green(fillCol) === 187) {
        gridIndex = 1;
        centerX = greenStartX + (greenDims.cols * (quadSize + quadSpacing)) / 2;
        centerY = topY + (greenDims.rows * (quadSize + quadSpacing)) / 2;
      } else {
        gridIndex = 2;
        centerX = pinkStartX + (pinkDims.cols * (quadSize + quadSpacing)) / 2;
        centerY = topY + (pinkDims.rows * (quadSize + quadSpacing)) / 2;
      }
    }
    
    // Applica scale con centro nella griglia
    let scale = hoverScales[gridIndex];
    let scaledX = centerX + (x - centerX) * scale;
    let scaledY = centerY + (y - centerY) * scale;
    let scaledSize = quadSize * scale;
    
    // Interpola colore da bianco al colore originale
    let finalR = lerp(255, red(fillCol), colorTransition);
    let finalG = lerp(255, green(fillCol), colorTransition);
    let finalB = lerp(255, blue(fillCol), colorTransition);
    
    fill(finalR, finalG, finalB, quadOpacity);
    noStroke();
    rect(scaledX, scaledY, scaledSize, scaledSize);
  }
  
  // Disegna i numeri sopra ogni gruppo (appaiono gradualmente con l'animazione di riordino)
  let txtSize = width * 0.025;
  txtSize = constrain(txtSize, 18, 50);
  
  if (animRegroupProgress > 0.3) { // Inizia a mostrare i numeri quando il riordino è al 30%
    let numberOpacity = map(animRegroupProgress, 0.3, 1, 0, grigliaFadeIn);
    numberOpacity = constrain(numberOpacity, 0, grigliaFadeIn);
    
    push();
    textFont(lcdFont);
    textAlign(CENTER, BOTTOM);
    textSize(txtSize);
    
    // Calcola i numeri animati (salgono gradualmente)
    let animFactor = map(animRegroupProgress, 0.3, 1, 0, 1);
    animFactor = constrain(animFactor, 0, 1);
    
    let currentConducenti = floor(incidentiConducenti * animFactor);
    let currentCauseEsterne = floor(incidentiCauseEsterne * animFactor);
    let currentNonConducenti = floor(incidentiNonConducenti * animFactor);
    
    // Numero gruppo BLU (Conducenti)
    let blueCenterX = blueStartX + (blueDims.cols * (quadSize + quadSpacing)) / 2;
    let blueOpacity = hoveredGridIndex === -1 || hoveredGridIndex === 0 ? numberOpacity : numberOpacity * 0.3;
    fill(0, 161, 241, blueOpacity);
    text(currentConducenti.toLocaleString('it-IT'), blueCenterX, topY - 30);
    
    // Label sotto il numero
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, blueOpacity);
    text('Conducenti', blueCenterX, topY - 10);
    
    // Numero gruppo VERDE (Cause esterne)
    let greenCenterX = greenStartX + (greenDims.cols * (quadSize + quadSpacing)) / 2;
    let greenOpacity = hoveredGridIndex === -1 || hoveredGridIndex === 1 ? numberOpacity : numberOpacity * 0.3;
    textFont(lcdFont);
    textSize(txtSize);
    fill(51, 187, 68, greenOpacity);
    text(currentCauseEsterne.toLocaleString('it-IT'), greenCenterX, topY - 30);
    
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, greenOpacity);
    text('Cause esterne', greenCenterX, topY - 10);
    
    // Numero gruppo ROSA (Non conducenti)
    let pinkCenterX = pinkStartX + (pinkDims.cols * (quadSize + quadSpacing)) / 2;
    let pinkOpacity = hoveredGridIndex === -1 || hoveredGridIndex === 2 ? numberOpacity : numberOpacity * 0.3;
    textFont(lcdFont);
    textSize(txtSize);
    fill(253, 115, 237, pinkOpacity);
    text(currentNonConducenti.toLocaleString('it-IT'), pinkCenterX, topY - 30);
    
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, pinkOpacity);
    text('Non conducenti', pinkCenterX, topY - 10);
    
    pop();
  }
  
  // Testo informativo sotto le griglie (appare con l'animazione)
  if (animRegroupProgress > 0.5) {
    let ctaOpacity = map(animRegroupProgress, 0.5, 1, 0, grigliaFadeIn);
    ctaOpacity = constrain(ctaOpacity, 0, grigliaFadeIn);
    
    push();
    textAlign(CENTER, TOP);
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, ctaOpacity);
    
    // Calcola posizione sotto la griglia più bassa
    let maxRows = max(blueDims.rows, greenDims.rows, pinkDims.rows);
    let bottomY = topY + maxRows * (quadSize + quadSpacing) + 15;
    
    text("Clicca e scopri le cause degli incidenti più nello specifico", width / 2, bottomY);
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

  // Mostra dati dal CSV corrispondente
  let categoryData = getCategoriaData(categoriaSelezionata);
  if (categoryData) {
    const margin = SEZIONE_MARGIN; // spazio interno su tutti i lati
    fill(255, 255, 255, 255);
    textFont(lcdFont);
    textSize(40);
    textAlign(LEFT, TOP);
    let yPos = margin;
    text(categoriaSelezionata.toUpperCase(), margin, yPos);
    yPos += 80;
    
    // Disegna quadrati per ogni riga del dataset (escluso il totale)
    let categoryColor = getOverlayColor(categoriaSelezionata);
    let numRows = categoryData.getRowCount();
    let baseQuadSize = dimensioneQuadratino; // Usa la variabile calcolata nella sezione 7

    // Desired spacing between squares; we'll reduce it if total width overflows the available area
    const DESIRED_SPACING = 80;

    // Pre-calcola le dimensioni dei quadratini e la somma delle larghezze
    let sizes = [];
    let sumSizes = 0;
    for (let i = 0; i < numRows - 1; i++) {
      let i300 = int(categoryData.getString(i, 'I/300'));
      let area = baseQuadSize * baseQuadSize * i300;
      let size = (i300 >= 1) ? sqrt(area) : baseQuadSize;
      sizes.push(size);
      sumSizes += size;
    }

    let count = sizes.length;
    let availableWidth = width - 2 * SEZIONE_MARGIN;

    // Compute spacing: try DESIRED_SPACING, but if it overflows reduce spacing so all items fit
    let quadSpacing = 0;
    if (count <= 1) {
      quadSpacing = 0;
    } else {
      let totalWithDesired = sumSizes + DESIRED_SPACING * (count - 1);
      if (totalWithDesired <= availableWidth) {
        quadSpacing = DESIRED_SPACING;
      } else {
        // space remaining distributed between gaps; avoid negative spacing
        quadSpacing = (availableWidth - sumSizes) / (count - 1);
        if (quadSpacing < 4) quadSpacing = 4; // minimum small spacing to avoid overlap
      }
    }

    // Calcola larghezza totale effettiva e posizione iniziale x
    let totalWidth = sumSizes + quadSpacing * Math.max(0, count - 1);
    let xPos = SEZIONE_MARGIN + (availableWidth - totalWidth) / 2;
    let baselineY = height - margin; // Linea di base in basso con margine
    
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
    
    // Reset xPos per la seconda passata (centro, come sopra)
    xPos = SEZIONE_MARGIN + (availableWidth - totalWidth) / 2;
    
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
      drawCuboIstogramma(half, H, sezioneOttavaTrans, categoryColor, i300 >= 1, lesionati, incidenti, nome, morti, cubeOpacity, minMortPercent, maxMortPercent);
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
    
    // If nothing is hovered this frame, show a helpful default message
    const catContainer = placeCatCausaContainer();
    if (catContainer) {
      if (hoveredSezioneOttavaItem === null) {
        // Cambia il testo in base allo stato
        let testoIstruzione = '';
        if (categoriaSelezionata === null) {
          testoIstruzione = "Seleziona un'area per visualizzare i dettagli";
        } else if (sezioneOttavaTrans > 0) {
          testoIstruzione = "Passa sopra una colonna per visualizzare i dettagli";
        } else {
          testoIstruzione = "Seleziona un'area per visualizzare i dettagli";
        }
        
        catContainer.innerHTML = `
          <h3 style="color: white; margin: 0;">${testoIstruzione}</h3>
        `;
      }
    }

    // Reset hover per il prossimo frame
    hoveredSezioneOttavaItem = null;
  }
  
  // Linea orizzontale bianca a 100px dal basso (rispetta i margin laterali)
  push();
  stroke(255);
  strokeWeight(1);

  line(SEZIONE_MARGIN, height - 80, width - SEZIONE_MARGIN, height - 80);
  pop();

  // Linea verticale sul lato destro: appare con easing legato a `sezioneOttavaTrans`
  {
    // Abbassata di 20px rispetto alla linea orizzontale
    let bottomY = height - 80; // prima era -80
    let topY = bottomY - (bottomY - SEZIONE_MARGIN) * sezioneOttavaTrans; // si estende verso l'alto
    let alpha = 255 * sezioneOttavaTrans;
    if (alpha > 2) {
      // Etichetta sopra la linea
      push();
      fill(255, alpha);
      noStroke();
      if (typeof transportFont !== 'undefined' && transportFont) textFont(transportFont); else textFont(lcdFont);
      textSize(14);
      textAlign(CENTER, BOTTOM);
      text('Soggetti lesi', width - SEZIONE_MARGIN, topY + 40);
      pop();

      // Linea verticale
      push();
      stroke(255, alpha);
      strokeWeight(1);
      line(width - SEZIONE_MARGIN, SEZIONE_MARGIN + 70, width - SEZIONE_MARGIN, height - 80);
      pop();
    }
  }

  // Label 'Incidenti' riferita alla linea (70px sotto la linea)
  push();
  fill(255);
  if (typeof transportFont !== 'undefined' && transportFont) textFont(transportFont); else textFont(lcdFont);
  textSize(16);
  textAlign(CENTER, CENTER);
  text('Incidenti', width / 2, height - 50);
  pop();

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
  if (scrollY >= 5100 && scrollY < 6500 && sezioneOttavaHitboxes.length) {
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
        hasClickedCategory = true; // Sblocca lo scroll
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
