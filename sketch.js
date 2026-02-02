// ========================================
// VARIABILI GLOBALI
// ========================================

let csvData; // Datatest "totale"
let csvConducenti;
let csvCauseEsterne;
let csvNonConducenti;

// Scroll
let scrollY = 0;
let scrollTarget = -1;
let scrollVelocita = 8;

// Scroll - Checkpoint per sezioni
let scrollCheckpoints = [
  0,      // Sezione 1: Intro
  800,    // Sezione 2: Quadrato
  1400,   // Sezione 3: "Ma sai quanti sono ogni anno?"
  2900,   // Sezione 4: Griglia incidenti
  3100,   // Sezione 5a: Quadrato 2D fermo
  3300,   // Sezione 5b: Animazione cubo 3D
  3850,   // Sezione 6: Counter giornaliero (500px dopo sez 5)
  4300,   // Sezione: "Ma di chi è la colpa?"
  5200,   // Sezione 7: divisione per responsabilità
  6500,   // Sezione 8: Dettaglio categoria selezionata (dopo animazione completa)
];
let currentCheckpointIndex = 0;
let isScrolling = false;
let scrollAccumulator = 0; // Calcola l'accumulo di scroll per capire se si raggiunge lo scrollThreshold
let scrollThreshold = 100; // Quantità di scroll necessaria per cambiare checkpoint

// Sezione 1: Intro
let introCaratteriVisibili = 0;
let introTestoCompleto = 'LA REALTÀ DEGLI INCIDENTI STRADALI\nIN ITALIA È PIÚ GRAVE DI QUANTO IMMAGINI';
let sottotitoloOpacita = 0; // il sottotitolo parte invisibile poi appare in fade in
let introOpacita = 255; // il titolo parte già visibile

// Sezione 2: Quadrato
let quadratoDimensione = 0; // parte da 0 e cresce fino a dimensione finale
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
let grigliaIncidentiLeggendaOpacita = 0; // Opacità leggenda "300 incidenti"
let numeroTotaleIncidenti = 0;
let counterAttuale = 0;

// Sezione 5a (3100): Testo introduttivo al cubo
let sezione5aCaratteriVisibili = 0;
let sezione5aTestoCompleto = 'MA VEDIAMO IL FENOMENO A 360 GRADI';
let sezione5aOpacita = 0;
// Sezione 5b (3300): Animazione cubo
let sezione5bCaratteriVisibili = 0;
let sezione5bTestoCompleto = 'OGNI INCIDENTE \n HA PROVOCATO MORTI E FERITI';
let sezione5bOpacita = 0;
let cuboRotazione = 0;
let cuboAnimazioneAutomatica = false;
let cuboAnimazioneInizio = 0;
let cuboAnimazioneReverse = false;

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
let animRegroupProgress = 0; //queste tre animRegroup servono per l'animazione di divisione in 3 griglie colorate
let animRegroupTarget = 0;
let dimensioneQuadratino = 0; // Dimensione dei quadratini, calcolata in sezione 7
let ctaFadeStartTime = -1; // Timestamp inizio fade in del testo CTA
let ctaFadeOpacity = 0; // Opacità corrente del testo CTA
let legendFadeOpacity = 0; // Opacità corrente della leggenda "300 incidenti"

// Sezione 8: visualizzazione di dettaglio
let sezioneOttavaHitboxes = [];
let hoveredGridIndex = -1; // Traccia quale griglia è in hover (-1 = nessuna, 0 = blu, 1 = verde, 2 = rosa)
let hoverScales = [1, 1, 1]; // Scale per ogni griglia (animato con lerp)
let hoverScaleTarget = [1, 1, 1]; // Target scale per smooth animation

// Vista corrente dettaglio: navbar → selezionaDaNavbar → qui → drawSezioneOttava
// --- NOTE: stato e interazioni della Sezione 8 (vista dettaglio) ---
// Qui vengono memorizzati i flag e le hitbox usati da `drawSezioneOttava()`
// e dai gestori di hover/click. In pratica questo gruppo tiene traccia di:
// - quale categoria è selezionata dall'utente
// - quali elementi sono in hover e le loro scale/opacità per l'animazione
// - se mostrare i quadrati (vista a griglia) o le barre (istogramma)
// Non rimuovere queste variabili: sono letture/scritture condivise
// tra il renderer della sezione e gli handler di input (mouse/DOM).
let categoriaSelezionata = null; // 'conducenti' | 'cause-esterne-concomitanti' | 'non-conducenti'
let hasClickedCategory = false; // Traccia se l'utente ha cliccato su una categoria
const categorie = ['conducenti', 'cause-esterne-concomitanti', 'non-conducenti'];
let sezioneOttavaSquareHitboxes = []; // hitbox per i quadrati
let sezioneOttavaLesionatiHitboxes = []; // hitbox specifiche per le colonne dei lesionati
let showBars = false; // false = quadrati, true = istogramma con barre
let sezioneOttavaTrans = 0; // 0 = quadrati, 1 = parallelepipedi (animazione)
let sezioneOttavaTransTarget = 0; // target per l'animazione
let hoveredSezioneOttavaItem = null; // traccia quale elemento è in hover
let sezioneOttavaFadeIn = 0; // fade in della sezione 8
let sezioneOttavaItemOpacities = {}; // Traccia l'opacità animata per ogni elemento (nome -> opacità corrente)
let sezioneOttavaItemOpacityTargets = {}; // Target opacità per l'animazione
// Margine usato per il layout interno della sezione 8 e per le legende
let SEZIONE_MARGIN = 100;
const SEZIONE_OTTAVA_OPACITY_EASING = 0.06; // Velocità dell'easing per l'opacità (più basso = più lento)

let categorieArray = ['conducenti', 'cause-esterne-concomitanti', 'non-conducenti'];

// Animazione transizione sezione 7 -> 8 (tra scroll 5200 e 6500)
let transizioneAttiva = false; // true quando è in corso la transizione
let transizioneProgress = 0; // 0 = inizio (5200), 1 = fine (6500)
let quadratiniTransizione = []; // array con posizioni iniziali e finali di ogni quadratino
let transizioneFadeInUI = 0; // Opacità fade in UI durante la transizione (sincronizzato con titolo)

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
      // Blocca checkpoint 0 (intro) finché testo non è completo
      if (currentCheckpointIndex === 0 && introCaratteriVisibili < introTestoCompleto.length) {
        return;
      }
      // Blocca checkpoint 1 (quadrato) finché testo non è completo
      if (currentCheckpointIndex === 1 && quadratoCaratteriVisibili < quadratoTestoCompleto.length) {
        return;
      }
      // Blocca checkpoint 2 (terza sezione) finché testo non è completo
      if (currentCheckpointIndex === 2 && terzaSezioneCaratteriVisibili < terzaSezioneTestoCompleto.length) {
        return;
      }
      // Blocca checkpoint 4 (5a) finché testo non è completo
      if (currentCheckpointIndex === 4 && sezione5aCaratteriVisibili < sezione5aTestoCompleto.length) {
        return;
      }
      // Blocca checkpoint 5 (5b) finché testo non è completo
      if (currentCheckpointIndex === 5 && sezione5bCaratteriVisibili < sezione5bTestoCompleto.length) {
        return;
      }
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
  
  // Aggiungi un listener per le frecce su e giù della tastiera
document.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowUp') {
    // Blocca freccia su quando si è nel dettaglio (checkpoint >= 9, ossia 6500)
    if (currentCheckpointIndex >= 9) {
      return; // Impedisci scroll indietro dal dettaglio
    }
    // Simula il click su scrollArrowUp
    if (currentCheckpointIndex > 0) {
      currentCheckpointIndex--;
      scrollTarget = scrollCheckpoints[currentCheckpointIndex];
      isScrolling = true;
      scrollAccumulator = 0;
    }
  } else if (event.key === 'ArrowDown') {
    // Blocca checkpoint 0 (intro) finché testo non è completo
    if (currentCheckpointIndex === 0 && introCaratteriVisibili < introTestoCompleto.length) {
      return;
    }
    // Blocca checkpoint 1 (quadrato) finché testo non è completo
    if (currentCheckpointIndex === 1 && quadratoCaratteriVisibili < quadratoTestoCompleto.length) {
      return;
    }
    // Blocca checkpoint 2 (terza sezione) finché testo non è completo
    if (currentCheckpointIndex === 2 && terzaSezioneCaratteriVisibili < terzaSezioneTestoCompleto.length) {
      return;
    }
    // Blocca checkpoint 4 (5a) finché testo non è completo
    if (currentCheckpointIndex === 4 && sezione5aCaratteriVisibili < sezione5aTestoCompleto.length) {
      return;
    }
    // Blocca checkpoint 5 (5b) finché testo non è completo
    if (currentCheckpointIndex === 5 && sezione5bCaratteriVisibili < sezione5bTestoCompleto.length) {
      return;
    }
    // Blocca freccia giù a 5200 se non ha cliccato una categoria
    if (currentCheckpointIndex === 8 && !hasClickedCategory) {
      return; // Impedisci scroll in avanti oltre 5200
    }
    // Simula il click su scrollArrowDown
    if (currentCheckpointIndex < scrollCheckpoints.length - 1) {
      currentCheckpointIndex++;
      scrollTarget = scrollCheckpoints[currentCheckpointIndex];
      isScrolling = true;
      scrollAccumulator = 0;
    }
  } else if (event.key === 'ArrowLeft') {
    // Navigazione sinistra nella sezione 8 (cambio categoria precedente)
    if (categoriaSelezionata !== null) {
      let currentIndex = categorieArray.indexOf(categoriaSelezionata);
      let prevIndex = (currentIndex - 1 + categorieArray.length) % categorieArray.length;
      categoriaSelezionata = categorieArray[prevIndex];
    }
  } else if (event.key === 'ArrowRight') {
    // Navigazione destra nella sezione 8 (cambio categoria successiva)
    if (categoriaSelezionata !== null) {
      let currentIndex = categorieArray.indexOf(categoriaSelezionata);
      let nextIndex = (currentIndex + 1) % categorieArray.length;
      categoriaSelezionata = categorieArray[nextIndex];
    }
  }
});

  // Setup navbar navigation click handlers
  let navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      if (e.target.closest && e.target.closest('.dropdown-item')) return;
      // Se il link appartiene al container della categoria dettaglio e siamo già nella vista dettaglio, ignora il click sul link
      if ((item.id === 'nav-categoria-container' || item.id === 'nav-categoria') && categoriaSelezionata !== null && scrollY >= 6500) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      let section = parseInt(item.getAttribute('data-section'));
      
      let targetScrollY = 0;
      let targetCheckpoint = 0;
      
      if (section === 0) {
        targetScrollY = 0;
        targetCheckpoint = 0;
        introCaratteriVisibili = introTestoCompleto.length;
        sottotitoloOpacita = 255;
        introOpacita = 255;
        quadratoDimensione = 0;
        quadratoCaratteriVisibili = 0;
      } else if (section === 1) {
        targetScrollY = 2900;
        targetCheckpoint = 3;
      } else if (section === 2) {
        targetScrollY = 5200;
        targetCheckpoint = 8;
      }
      
      currentCheckpointIndex = targetCheckpoint;
      scrollY = targetScrollY;
      scrollTarget = -1;
      isScrolling = false;
      scrollAccumulator = 0;
    });
  });

  // Tendina Responsabilità: click su Conducenti / Non conducenti / Cause esterne e concomitanti → selezionaDaNavbar
  let dropMenu = document.getElementById('dropdown-responsabilita-menu');
  if (dropMenu) {
    dropMenu.querySelectorAll('.dropdown-item').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        let cat = link.getAttribute('data-categoria');
        if (cat && typeof window.selezionaDaNavbar === 'function') window.selezionaDaNavbar(cat);
      });
    });
  }

  // Tendina Categoria dettaglio: click su altre categorie nella tendina sotto nav-categoria
  let dropCategoriaMenu = document.getElementById('dropdown-categoria-menu');
  if (dropCategoriaMenu) {
    dropCategoriaMenu.querySelectorAll('.dropdown-item').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        let cat = link.getAttribute('data-categoria');
        if (cat && typeof window.selezionaDaNavbar === 'function') window.selezionaDaNavbar(cat);
      });
    });
  }

  // Hover su Responsabilità o categoria nella sezione dettaglio: mostra dropdown categorie
  let navItemResponsabilita = document.querySelector('.nav-item.dropdown[data-section="2"]');
  let navCategoriaContainer = document.getElementById('nav-categoria-container');
  let dropdownCategoriaMenu = document.getElementById('dropdown-categoria-menu');
  
  if (navItemResponsabilita && navCategoriaContainer && dropdownCategoriaMenu) {
    // Funzione per mostrare il dropdown
    function showCategoriaDropdown() {
      if (scrollY >= 6500 && categoriaSelezionata !== null) {
        dropdownCategoriaMenu.style.display = 'block';
      }
    }
    
    // Funzione per nascondere il dropdown
    function hideCategoriaDropdown() {
      if (!navItemResponsabilita.matches(':hover') && !navCategoriaContainer.matches(':hover')) {
        dropdownCategoriaMenu.style.display = 'none';
      }
    }
    
    // Hover su Responsabilità
    navItemResponsabilita.addEventListener('mouseenter', showCategoriaDropdown);
    navItemResponsabilita.addEventListener('mouseleave', hideCategoriaDropdown);
    
    // Hover su categoria container
    navCategoriaContainer.addEventListener('mouseenter', showCategoriaDropdown);
    navCategoriaContainer.addEventListener('mouseleave', hideCategoriaDropdown);
  }
}

// Gestisce hash URL: navigazione da altre pagine + permalink categorie
// Pattern: 1 pagina, navbar → selezionaDaNavbar → categoriaSelezionata → drawSezioneOttava
const HASH_CATEGORIE = ['#conducenti', '#non-conducenti', '#cause-esterne-concomitanti'];

function handleURLHash() {
  const hash = window.location.hash;
  // Se la pagina è stata ricaricata (refresh), non seguire i permalink categorie
  // Questo evita che un refresh apra automaticamente una categoria di dettaglio
  let navType = null;
  try {
    const entries = performance.getEntriesByType('navigation');
    if (entries && entries.length > 0) navType = entries[0].type;
    else if (performance.navigation) navType = (performance.navigation.type === 1) ? 'reload' : 'navigate';
  } catch (e) {
    navType = null;
  }
  if (navType === 'reload') {
    // Rimuovi l'hash senza ricaricare la pagina e resta all'indice
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return;
  }
  
  if (hash === '#incidenti') {
    currentCheckpointIndex = 3;
    scrollY = 2900;
    scrollTarget = -1;
    isScrolling = false;
    scrollAccumulator = 0;
  } else if (hash === '#responsabilita') {
    currentCheckpointIndex = 8;
    scrollY = 5200;
    scrollTarget = -1;
    isScrolling = false;
    scrollAccumulator = 0;
  } else if (HASH_CATEGORIE.indexOf(hash) !== -1) {
    // Permalink: #conducenti, #non-conducenti, #cause-esterne-concomitanti → dettaglio
    let cat = hash.slice(1);
    if (typeof window.selezionaDaNavbar === 'function') window.selezionaDaNavbar(cat);
  }
}

function mouseWheel(event) {
  if (scrollTarget !== -1) {
    // Se c'è già un'animazione in corso, ignora lo scroll
    return false;
  }
  
  // Blocca checkpoint 0 (intro) finché testo non è completo
  if (currentCheckpointIndex === 0 && introCaratteriVisibili < introTestoCompleto.length && event.delta > 0) {
    scrollAccumulator = 0;
    return false;
  }
  
  // Blocca checkpoint 1 (quadrato) finché testo non è completo
  if (currentCheckpointIndex === 1 && quadratoCaratteriVisibili < quadratoTestoCompleto.length && event.delta > 0) {
    scrollAccumulator = 0;
    return false;
  }
  
  // Blocca checkpoint 2 (terza sezione) finché testo non è completo
  if (currentCheckpointIndex === 2 && terzaSezioneCaratteriVisibili < terzaSezioneTestoCompleto.length && event.delta > 0) {
    scrollAccumulator = 0;
    return false;
  }
  
  // Blocca checkpoint 4 (5a) finché testo non è completo
  if (currentCheckpointIndex === 4 && sezione5aCaratteriVisibili < sezione5aTestoCompleto.length && event.delta > 0) {
    // Impedisci scroll in avanti da 5a a 5b
    scrollAccumulator = 0;
    return false;
  }
  
  // Blocca checkpoint 5 (5b) finché testo non è completo
  if (currentCheckpointIndex === 5 && sezione5bCaratteriVisibili < sezione5bTestoCompleto.length && event.delta > 0) {
    scrollAccumulator = 0;
    return false;
  }
  
  // Blocca scroll a 5200 (checkpoint index 8) se non ha cliccato una categoria
  if (currentCheckpointIndex === 8 && !hasClickedCategory && event.delta > 0) {
    // Impedisci scroll in avanti oltre 5200 e resetta accumulatore
    scrollAccumulator = 0;
    return false;
  }
  
  // Blocca scroll verso l'alto quando si è nel dettaglio (checkpoint >= 9, scrollY >= 6500)
  if (currentCheckpointIndex >= 9 && event.delta < 0) {
    // Impedisci scroll indietro dal dettaglio
    scrollAccumulator = 0;
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
  drawSezioneOttava(); // usa categoriaSelezionata (navbar → selezionaDaNavbar) per Conducenti / Non conducenti / Cause esterne e concomitanti
  
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
    
    // Aumenta velocità quando si torna indietro nell'intervallo tra 5200 e 6500
    let currentVelocita = scrollVelocita;
    if (scrollY > 5200 && scrollTarget <= 5200 && scrollY <= 6500) {
      currentVelocita = 100; // Molto più veloce quando si torna indietro da 6500 a 5200
    }
    
    // Rallenta lo scroll tra 2900 e 3850 per passare attraverso 3100 e 3300
    if ((scrollY >= 2900 && scrollY <= 3850) || (scrollTarget >= 3100 && scrollTarget <= 3300)) {
      currentVelocita = 4; // Scroll più lento per non saltare i checkpoint intermedi
    }
    
    if (abs(scrollY - scrollTarget) > currentVelocita) {
      if (scrollY < scrollTarget) {
        scrollY += currentVelocita;
      } else {
        scrollY -= currentVelocita;
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
  
  // Quinta sezione testo - RIMOSSO (sostituito da sezione5a e sezione5b)
  
  // Sezione 5a (3100): Testo "MA VEDIAMO IL FENOMENO A 360 GRADI"
  if (scrollY > 3000 && scrollY < 3300) {
    if (frameCount % 2 === 0 && sezione5aCaratteriVisibili < sezione5aTestoCompleto.length) {
      sezione5aCaratteriVisibili++;
    }
  } else if (scrollY >= 3300) {
    sezione5aCaratteriVisibili = sezione5aTestoCompleto.length;
  } else {
    sezione5aCaratteriVisibili = 0;
  }
  
  // Sezione 5b (3300): Testo "E OGNUNO DI QUESTI HA PROVOCATO MORTI E FERITI"
  if (scrollY > 3200 && scrollY < 3600) {
    if (frameCount % 2 === 0 && sezione5bCaratteriVisibili < sezione5bTestoCompleto.length) {
      sezione5bCaratteriVisibili++;
    }
  } else if (scrollY >= 3600) {
    sezione5bCaratteriVisibili = sezione5bTestoCompleto.length;
  } else if (scrollY > 3100 && sezione5bCaratteriVisibili > 0) {
    // Mantieni il testo già scritto tra 3100-3200 per il fade out
  } else {
    sezione5bCaratteriVisibili = 0;
  }
}

function updateCatCausaInfo(nome, incidenti, lesionati, morti) { //visualizza i dati specidici per categoria
  const container = placeCatCausaContainer();
  
  // Determina il colore hex della categoria
  let categoryHex = '#ffffff';
  if (categoriaSelezionata === 'conducenti') {
    categoryHex = getComputedStyle(document.documentElement).getPropertyValue('--blue').trim();
  } else if (categoriaSelezionata === 'cause-esterne-concomitanti') {
    categoryHex = getComputedStyle(document.documentElement).getPropertyValue('--green').trim();
  } else if (categoriaSelezionata === 'non-conducenti') {
    categoryHex = getComputedStyle(document.documentElement).getPropertyValue('--pink').trim();
  }
  
  // Mostra feriti e morti solo se aperta la modalità istogramma
  let feritiMortiHTML = '';
  if (showBars) {
    feritiMortiHTML = `
      <p style="margin: 0.5em 0 0 0;"><span style="color: var(--orange);">Feriti:</span> <span style="color: white;">${lesionati.toLocaleString('it-IT')}</span></p>
      <p style="margin: 0.5em 0 0 0;"><span style="color: var(--orange);">Morti:</span> <span style="color: white;">${morti.toLocaleString('it-IT')}</span></p>
    `;
  }
  
  // Crea l'HTML dinamicamente - ogni dato va a capo con spaziatura uniforme
  container.innerHTML = `
    <h3 style="color: white; margin: 0 0 0.5em 0; font-size: 1.4em;">${nome}</h3>
    <p style="margin: 0.5em 0 0 0;"><span style="color: ${categoryHex};">Incidenti:</span> <span style="color: white;">${incidenti.toLocaleString('it-IT')}</span></p>
    ${feritiMortiHTML}
  `;
}

function createLegends() {
  // Crea un singolo contenitore legenda che verrà aggiornato dinamicamente
  if (!document.getElementById('legend')) {
    let legend = document.createElement('div');
    legend.id = 'legend';
    // Stili con solo bordo, senza background
    legend.style.display = 'none';
    legend.style.position = 'fixed';
    legend.style.backgroundColor = 'transparent';
    legend.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    legend.style.width = (width * 0.22) + 'px'; // Allargata per contenere meglio gli elementi
    legend.style.padding = '1.5em';
    legend.style.borderRadius = (width * 0.0104) + 'px'; // 20px @ 1920px
    legend.style.display = 'flex';
    legend.style.flexDirection = 'column';
    legend.style.justifyContent = 'left';
    legend.style.gap = '1em';
    legend.style.left = SEZIONE_MARGIN + 'px';
    legend.style.top = (SEZIONE_MARGIN + width * 0.07) + 'px'; // Spostata più in basso
    legend.style.boxSizing = 'border-box';
    legend.style.zIndex = '999';
    document.body.appendChild(legend);
  }

  // Crea anche il contenitore per le informazioni di categoria (catCausa) interamente via JS
  if (!document.getElementById('catCausaContainer')) {
    let cat = document.createElement('div');
    cat.id = 'catCausaContainer';
    // Stili con solo bordo, senza background (come legenda)
    cat.style.display = 'none';
    cat.style.position = 'fixed';
    cat.style.backgroundColor = 'transparent';
    cat.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    cat.style.borderRadius = (width * 0.0104) + 'px'; // 20px @ 1920px
    cat.style.width = (width * 0.22) + 'px'; // Ridotta per stringere la box
    cat.style.padding = '1.5em';
    cat.style.display = 'flex';
    cat.style.flexDirection = 'column';
    cat.style.justifyContent = 'left';
    cat.style.gap = '1em';
    cat.style.left = (SEZIONE_MARGIN + width * 0.24) + 'px'; // Allineato dopo legenda allargata
    cat.style.top = (SEZIONE_MARGIN + width * 0.07) + 'px'; // Spostata più in basso, allineata con legenda
    cat.style.color = 'white';
    cat.style.fontFamily = 'Transport, Arial, Helvetica, sans-serif';
    cat.style.fontSize = (width * 0.0094) + 'px'; // 18px @ 1920px
    cat.style.lineHeight = '1.2';
    cat.style.maxWidth = (width * 0.25) + 'px'; // 480px @ 1920px
    cat.style.pointerEvents = 'none';
    cat.style.boxSizing = 'border-box';
    cat.style.zIndex = '999';
    cat.style.transition = 'background-color 0.3s ease';
    document.body.appendChild(cat);
  }
}

// Ensure the category detail container exists and return it.
function placeCatCausaContainer() {
  let container = document.getElementById('catCausaContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'catCausaContainer';
    // Stili con solo bordo, senza background (come legenda)
    container.style.display = 'none';
    container.style.position = 'fixed';
    container.style.backgroundColor = 'transparent';
    container.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    container.style.borderRadius = (width * 0.0104) + 'px'; // 20px @ 1920px
    container.style.width = (width * 0.22) + 'px'; // Ridotta per stringere la box
    container.style.padding = '1.5em';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'left';
    container.style.gap = '1em';
    container.style.left = (SEZIONE_MARGIN + width * 0.24) + 'px'; // Allineato dopo legenda allargata
    container.style.top = (SEZIONE_MARGIN + width * 0.07) + 'px'; // Spostata più in basso
    container.style.color = 'white';
    container.style.fontFamily = 'Transport, Arial, Helvetica, sans-serif';
    container.style.fontSize = (width * 0.0094) + 'px'; // 18px @ 1920px
    container.style.lineHeight = '1.2';
    container.style.maxWidth = (width * 0.25) + 'px'; // 480px @ 1920px
    container.style.pointerEvents = 'none';
    container.style.boxSizing = 'border-box';
    container.style.zIndex = '999';
    container.style.transition = 'background-color 0.3s ease';
    document.body.appendChild(container);
  }
  return container;
}

function updateLegendVisibility() {
  let legend = document.getElementById('legend');
  let catCausa = document.getElementById('catCausaContainer');

  // Mostra la legenda solo quando l'opacity è significativa (> 0.01) per evitare flash
  let legendOpacity = 0;
  let shouldShow = false;
  
  if (categoriaSelezionata !== null) {
    if (scrollY >= 6500) {
      // Nella sezione 8, mostra sempre
      legendOpacity = 1;
      shouldShow = true;
    } else if (transizioneAttiva && transizioneFadeInUI > 5) {
      // Durante la transizione, mostra solo se fadeInUI è sopra una soglia minima
      legendOpacity = transizioneFadeInUI / 255;
      legendOpacity = constrain(legendOpacity, 0, 1);
      shouldShow = legendOpacity > 0.02; // Mostra solo se opacity > 2%
    }
  }
  
  if (shouldShow) {
    if (legend) {
      legend.style.display = 'flex';
      legend.style.opacity = legendOpacity;
      legend.style.left = SEZIONE_MARGIN + 'px';
      legend.style.top = (SEZIONE_MARGIN + width * 0.07) + 'px'; // Allineata con categoria selezionata

      // Imposta il contenuto in base al tipo di visualizzazione
      if (!showBars) {
        // Contenuto per 'incidenti' creato interamente via JS con inline styles
        legend.innerHTML = '';
        let h = document.createElement('h3');
        h.style.color = 'white';
        h.style.margin = '0';
        h.style.fontFamily = 'Transport, Arial, Helvetica, sans-serif';
        h.style.fontSize = '1.1em';
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
        rect.style.backgroundColor = '#B0B0B0';
        rectWrapper.appendChild(rect);
        r1.appendChild(rectWrapper);
        let t1 = document.createElement('div');
        t1.style.color = 'white';
        t1.textContent = 'Area proporzionale al numero di incidenti';
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
        empty.style.border = (width * 0.001) + 'px solid #B0B0B0'; // 2px @ 1920px
        empty.style.boxSizing = 'border-box';
        emptyWrapper.appendChild(empty);
        r2.appendChild(emptyWrapper);
        let t2 = document.createElement('div');
        t2.style.color = 'white';
        t2.textContent = 'Numero di incidenti inferiore a 300';
        r2.appendChild(t2);
        legend.appendChild(r2);
      } else {
        // Contenuto per 'lesionati'
        legend.innerHTML = '';
        let h = document.createElement('h3');
        h.style.color = 'white';
        h.style.margin = '0';
        h.style.fontFamily = 'Transport, Arial, Helvetica, sans-serif';
        h.style.fontSize = '1.1em';
        h.textContent = 'Legenda';
        legend.appendChild(h);

        let r1 = document.createElement('div');
        r1.style.display = 'flex';
        r1.style.flexDirection = 'row';
        r1.style.alignItems = 'center';
        r1.style.gap = '1em';
        // Container per il cubo con larghezza fissa per allineamento
        let cubeWrapper = document.createElement('div');
        cubeWrapper.style.width = '88px';
        cubeWrapper.style.flexShrink = '0';
        cubeWrapper.style.display = 'flex';
        cubeWrapper.style.alignItems = 'center';
        cubeWrapper.style.justifyContent = 'center';
        let cubeCanvas = createLegendCubeCanvasStyled(88);
        cubeWrapper.appendChild(cubeCanvas);
        r1.appendChild(cubeWrapper);
        let t1 = document.createElement('div');
        t1.style.color = 'white';
        t1.style.flex = '1';
        t1.textContent = 'Altezza proporzionale al numero di soggetti lesi';
        r1.appendChild(t1);
        legend.appendChild(r1);

        let r2 = document.createElement('div');
        r2.style.display = 'flex';
        r2.style.flexDirection = 'row';
        r2.style.alignItems = 'center';
        r2.style.gap = '1em';
        // Container per il gradiente con stessa larghezza del cubo
        let gradWrapper = document.createElement('div');
        gradWrapper.style.width = '88px';
        gradWrapper.style.flexShrink = '0';
        gradWrapper.style.display = 'flex';
        gradWrapper.style.alignItems = 'center';
        gradWrapper.style.justifyContent = 'center';
        let grad = document.createElement('div');
        grad.style.width = '100%';
        grad.style.height = '0.5em';
        grad.style.borderRadius = (width * 0.0104) + 'px'; // 20px @ 1920px
        grad.style.background = 'linear-gradient(to right, #ffffff, #ff8b43)';
        gradWrapper.appendChild(grad);
        r2.appendChild(gradWrapper);
        let t2 = document.createElement('div');
        t2.style.color = 'white';
        t2.style.flex = '1';
        t2.textContent = 'Gradiente proporzionale alla percentuale di incidenti mortali';
        r2.appendChild(t2);
        legend.appendChild(r2);
      }
    }

    if (catCausa) {
      catCausa.style.display = 'block';
      catCausa.style.opacity = legendOpacity;
    }
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
  if (scrollY >= 3300) {
    if (!cuboAnimazioneAutomatica || cuboAnimazioneReverse) {
      cuboAnimazioneAutomatica = true;
      cuboAnimazioneReverse = false;
      cuboAnimazioneInizio = frameCount;
    }
  } else if (scrollY >= 3100 && scrollY < 3300) {
    // Tra 3100 e 3300: animazione in reverse
    if (cuboAnimazioneAutomatica && !cuboAnimazioneReverse) {
      cuboAnimazioneReverse = true;
      cuboAnimazioneInizio = frameCount;
    }
  } else if (scrollY < 3100) {
    // Reset completo sotto 3100
    cuboAnimazioneAutomatica = false;
    cuboAnimazioneReverse = false;
    cuboRotazione = 0;
  }
  
  if (cuboAnimazioneAutomatica && !cuboAnimazioneReverse) {
    // Animazione forward (da 2D a 3D)
    let framePassati = frameCount - cuboAnimazioneInizio;
    cuboRotazione = map(framePassati, 0, 240, 0.02, 1);
    cuboRotazione = constrain(cuboRotazione, 0.02, 1);
  } else if (cuboAnimazioneReverse) {
    // Animazione reverse (da 3D a 2D)
    let framePassati = frameCount - cuboAnimazioneInizio;
    cuboRotazione = map(framePassati, 0, 240, cuboRotazione, 0.02);
    cuboRotazione = constrain(cuboRotazione, 0.02, 1);
    
    // Ferma il reverse quando torna a 0.02
    if (cuboRotazione <= 0.02) {
      cuboRotazione = 0.02;
      cuboAnimazioneReverse = false;
      cuboAnimazioneAutomatica = false;
    }
  } else if (scrollY >= 3100 && scrollY < 3300) {
    // Tra 3100 e 3300: quadrato 2D fermo
    cuboRotazione = 0.02;
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

    // Controlla se si proviene da chi_siamo o dati
    let skipAnimation = sessionStorage.getItem('skipCounterAnimation') === 'true';
    if (skipAnimation) {
      // Rimuovi il flag dopo averlo letto
      sessionStorage.removeItem('skipCounterAnimation');
      // Salta direttamente all'animazione completata
      counterAnimazioneCompletata = true;
    }
    
    if (counterAnimazioneAutomatica && !counterAnimazioneCompletata && frameCount - counterAnimazioneInizio < 240 && !skipAnimation) {
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
  if (cat === 'conducenti') return getCSSColor('--blue');
  if (cat === 'cause-esterne-concomitanti') return getCSSColor('--green');
  if (cat === 'non-conducenti') return getCSSColor('--pink');
  return color(255);
}

// Helper per ottenere i colori dalle variabili CSS
function getCSSColor(variableName) {
  const cssValue = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return color(cssValue);
}

function getCategoriaData(cat) {
  if (cat === 'conducenti') return csvConducenti;
  if (cat === 'cause-esterne-concomitanti') return csvCauseEsterne;
  if (cat === 'non-conducenti') return csvNonConducenti;
  return null;
}

function getCubeSpacingForCategoria(cat) {
  // Spacing responsive basato sulla larghezza della viewport
  let spacingConducenti = constrain(width * 0.012, 12, 20);
  let spacingAltre = constrain(width * 0.045, 50, 90);
  return cat === 'conducenti' ? spacingConducenti : spacingAltre;
}

function updateHoverScales() {
  // Smooth interpolation per scale animation (chiamato ogni frame)
  for (let i = 0; i < 3; i++) {
    hoverScales[i] = lerp(hoverScales[i], hoverScaleTarget[i], 0.15);
  }
}

// Chiamata dalla navbar (dropdown Responsabilità). Imposta stato + salto a dettaglio.
// draw() → drawSezioneOttava usa categoriaSelezionata (getCategoriaData) per disegnare.
window.selezionaDaNavbar = function(nomeCategoria) {
  categoriaSelezionata = nomeCategoria;
  hasClickedCategory = true;
  
  showBars = false; // Inizia sempre con i quadrati
  sezioneOttavaTrans = 0; // Inizia sempre in modalità quadrato
  sezioneOttavaTransTarget = 0;
  transizioneAttiva = false;
  transizioneProgress = 1;

  currentCheckpointIndex = 9;
  scrollY = 6500;
  scrollTarget = -1;
  isScrolling = false;
  scrollAccumulator = 0;
  
  if (typeof updateLegendVisibility === 'function') updateLegendVisibility();
  
  // Permalink: aggiorna URL (es. #conducenti) per link diretti e refresh
  try { window.history.replaceState(null, '', '#' + nomeCategoria); } catch (e) {}
};


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
    
    // Check hover sulle hitbox lesionati
    if (sezioneOttavaLesionatiHitboxes.length > 0) {
      for (let hitbox of sezioneOttavaLesionatiHitboxes) {
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
  let orangeColor = getCSSColor('--orange');
  fill(red(orangeColor), green(orangeColor), blue(orangeColor), introOpacita);
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
  let inDettaglio = scrollY >= 6500 && categoriaSelezionata !== null;
  if (inDettaglio) {
    navItems.forEach((item) => {
      if (item.dataset.section === '2' || item.id === 'nav-categoria' || item.id === 'nav-categoria-container') {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    // Nascondi la tendina (Conducenti / Non conducenti / Cause esterne e concomitanti) quando sei già nel dettaglio
    let drop = document.querySelector('.nav-item.dropdown');
    if (drop) drop.classList.add('dropdown-no-tendina');
  } else {
    let drop = document.querySelector('.nav-item.dropdown');
    if (drop) drop.classList.remove('dropdown-no-tendina');
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
    }, 50);
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
  
  // BACK ARROW: Mostra nella sezione dettaglio con fade in durante transizione
  if (backArrow) {
    if (categoriaSelezionata !== null && (scrollY >= 6500 || (transizioneAttiva && scrollY > 5200))) {
      // Durante transizione: fade in progressivo, dopo: completamente visibile
      if (scrollY >= 6500) {
        backArrow.style.opacity = '1';
        backArrow.style.pointerEvents = 'all';
      } else if (transizioneAttiva && transizioneFadeInUI > 5) {
        // Sincronizza con fade in delle legende e del titolo
        backArrow.style.opacity = (transizioneFadeInUI / 255).toString();
        backArrow.style.pointerEvents = transizioneFadeInUI > 128 ? 'all' : 'none';
      }
    } else {
      backArrow.style.opacity = '0';
      backArrow.style.pointerEvents = 'none';
    }
  }
  
  // DETAIL ARROWS: Gestisci visibilità e colori dinamici con fade in
  let detailArrowLeft = document.getElementById('detail-arrow-left');
  let detailArrowRight = document.getElementById('detail-arrow-right');
  
  if (detailArrowLeft && detailArrowRight && categoriaSelezionata !== null) {
    // Mostra le frecce nella sezione dettaglio
    if (scrollY >= 6500 || (transizioneAttiva && scrollY > 5200)) {
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
      
      // Gestisci opacità con fade in progressivo
      if (scrollY >= 6500) {
        detailArrowLeft.style.opacity = '1';
        detailArrowLeft.style.pointerEvents = 'all';
        detailArrowRight.style.opacity = '1';
        detailArrowRight.style.pointerEvents = 'all';
      } else if (transizioneAttiva && transizioneFadeInUI > 5) {
        // Sincronizza con fade in delle legende e del titolo
        let arrowOpacity = (transizioneFadeInUI / 255).toString();
        detailArrowLeft.style.opacity = arrowOpacity;
        detailArrowLeft.style.pointerEvents = transizioneFadeInUI > 128 ? 'all' : 'none';
        detailArrowRight.style.opacity = arrowOpacity;
        detailArrowRight.style.pointerEvents = transizioneFadeInUI > 128 ? 'all' : 'none';
      }
    } else {
      detailArrowLeft.style.opacity = '0';
      detailArrowLeft.style.pointerEvents = 'none';
      detailArrowRight.style.opacity = '0';
      detailArrowRight.style.pointerEvents = 'none';
    }
  } else if (detailArrowLeft && detailArrowRight) {
    detailArrowLeft.style.opacity = '0';
    detailArrowLeft.style.pointerEvents = 'none';
    detailArrowRight.style.opacity = '0';
    detailArrowRight.style.pointerEvents = 'none';
  }
  
  // Freccia giù: nascondi quando sei a 5200 (scrollY >= 5200) o oltre
  if (scrollArrowDown) {
    if (scrollY >= 5200) {
      scrollArrowDown.style.opacity = '0';
      scrollArrowDown.style.pointerEvents = 'none';
    } else {
      scrollArrowDown.style.opacity = '1';
      scrollArrowDown.style.pointerEvents = 'all';
      downVisible = true;
    }
    
    // Freccia giù: bordo sempre bianco, freccia interna sempre arancione
    scrollArrowDown.style.borderColor = 'rgb(239, 239, 239)';
    let downSvgPath = scrollArrowDown.querySelector('svg path');
    if (downSvgPath) {
      downSvgPath.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--orange').trim());
    }
    
    // Attiva/disattiva animazione bounce: solo al primo checkpoint e quando NON si sta scrollando
    if (currentCheckpointIndex === 0 && !isScrolling) {
      scrollArrowDown.classList.add('bounce-active');
      scrollArrowDown.classList.remove('allow-hover-movement');
    } else {
      scrollArrowDown.classList.remove('bounce-active');
      scrollArrowDown.classList.add('allow-hover-movement');
    }
  }
  
  // Freccia su: nascondi quando sei al primo checkpoint o quando scrollY supera 5200
  if (scrollArrowUp) {
    if (currentCheckpointIndex <= 0 || scrollY > 5200) {
      scrollArrowUp.style.opacity = '0';
      scrollArrowUp.style.pointerEvents = 'none';
    } else {
      scrollArrowUp.style.opacity = '1';
      scrollArrowUp.style.pointerEvents = 'all';
      upVisible = true;
    }
    
    // Freccia su: bordo sempre bianco, freccia interna bianca (arancione solo a 5200 quando è da sola)
    scrollArrowUp.style.borderColor = 'rgb(239, 239, 239)';
    let upSvgPath = scrollArrowUp.querySelector('svg path');
    if (upSvgPath) {
      // Se è a scroll 5200 e la freccia giù non è visibile, diventa arancione
      if (currentCheckpointIndex === 8 && !downVisible) {
        upSvgPath.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--orange').trim());
      } else {
        upSvgPath.setAttribute('stroke', 'rgb(239, 239, 239)');
      }
    }
  }
  
  // Centra il container in base alle frecce visibili
  if (arrowsContainer) {
    if (upVisible && downVisible) {
      // Entrambe visibili: centra la coppia
      arrowsContainer.style.transform = 'translateX(-50%)';
    } else if (upVisible) {
      // Solo freccia su: offset per centrare la singola (22px @ 1920px)
      arrowsContainer.style.transform = `translateX(calc(-50% + ${width * 0.0115}px))`;
    } else if (downVisible) {
      // Solo freccia giù: offset per centrare la singola (22px @ 1920px)
      arrowsContainer.style.transform = `translateX(calc(-50% - ${width * 0.0115}px))`;
    }
  }
}

// NAVBAR CATEGORIA: Aggiorna il link dinamico della categoria di dettaglio e evidencia voce dropdown attiva
function updateNavbarCategoria() {
  let navCategoriaContainer = document.getElementById('nav-categoria-container');
  let navCategoria = document.getElementById('nav-categoria');
  let navSeparator = document.getElementById('nav-separator');
  if (!navCategoria || !navCategoriaContainer) return;
  
  // Mostra/nascondi in base a se siamo nella sezione dettaglio
  if (categoriaSelezionata !== null && scrollY >= 6500) {
    navCategoriaContainer.style.display = 'block';
    if (navSeparator) navSeparator.style.display = 'inline';
    
    // Aggiorna il testo in base alla categoria
    if (categoriaSelezionata === 'conducenti') {
      navCategoria.textContent = 'Conducenti';
    } else if (categoriaSelezionata === 'cause-esterne-concomitanti') {
      navCategoria.textContent = 'Cause esterne e concomitanti';
    } else if (categoriaSelezionata === 'non-conducenti') {
      navCategoria.textContent = 'Non conducenti';
    }
    
    // Nascondi la categoria corrente dal menu a tendina
    let dropCategoriaMenu = document.getElementById('dropdown-categoria-menu');
    if (dropCategoriaMenu) {
      dropCategoriaMenu.querySelectorAll('.dropdown-item').forEach(function(item) {
        let itemCat = item.getAttribute('data-categoria');
        if (itemCat === categoriaSelezionata) {
          item.classList.add('current-category');
        } else {
          item.classList.remove('current-category');
        }
      });
    }
  } else {
    navCategoriaContainer.style.display = 'none';
    if (navSeparator) navSeparator.style.display = 'none';
  }
  
  // Aggiorna icona info
  updateCategoriaInfoIcon();
  updateGradienteInfoIcon();
}

// Aggiorna posizione e contenuto dell'icona info del gradiente
function updateGradienteInfoIcon() {
  let infoIcon = document.getElementById('gradiente-info-icon');
  let tooltip = document.getElementById('gradiente-info-tooltip');
  let legend = document.getElementById('legend');
  if (!infoIcon || !tooltip) return;
  
  // Mostra icona solo in sezione 8 (dettaglio) o durante transizione quando showBars è true
  if (categoriaSelezionata !== null && showBars && (scrollY >= 6500 || (transizioneAttiva && transizioneFadeInUI > 5))) {
    // Calcola posizione sotto il gradiente nella legenda
    let margin = constrain(width * 0.052, 60, 100);
    let legendTop = SEZIONE_MARGIN + width * 0.07;
    
    // Posizione sotto il gradiente (seconda riga della legenda) - allineato a sinistra sotto il gradiente
    let iconX = margin + 275; // Centrato sotto il gradiente (88px width / 2)
    let iconY = legendTop + 190; // Offset per seconda riga + spazio sotto il gradiente
    
    infoIcon.style.left = iconX + 'px';
    infoIcon.style.top = iconY + 'px';
    infoIcon.style.display = 'flex';
    
    // Posiziona la tooltip sotto la legenda con stessa larghezza e allineamento
    let legendWidth = width * 0.22; // Stessa larghezza della legenda
    let tooltipX = SEZIONE_MARGIN; // Stesso margine sinistro della legenda (usa SEZIONE_MARGIN)
    let tooltipY = legendTop + 250; // Sotto la legenda con gap (altezza legenda completa + spazio)
    
    tooltip.style.left = tooltipX + 'px';
    tooltip.style.top = tooltipY + 'px';
    tooltip.style.width = legendWidth + 'px';
    
    // Applica fade in durante la transizione
    if (transizioneAttiva && transizioneFadeInUI > 5) {
      infoIcon.style.opacity = (transizioneFadeInUI / 255).toString();
    } else {
      infoIcon.style.opacity = '1';
    }
  } else {
    infoIcon.style.display = 'none';
  }
}

// Aggiorna posizione e contenuto dell'icona info categoria
function updateCategoriaInfoIcon() {
  let infoIcon = document.getElementById('categoria-info-icon');
  let infoText = document.getElementById('info-tooltip-text');
  if (!infoIcon || !infoText) return;
  
  // Mostra icona solo in sezione 8 (dettaglio) o durante transizione
  if (categoriaSelezionata !== null && (scrollY >= 6500 || (transizioneAttiva && transizioneFadeInUI > 5))) {
    // Calcola posizione a destra del titolo
    let margin = constrain(width * 0.052, 60, 100);
    let titleSize = constrain(width * 0.021, 20, 48);
    let arrowHeight = constrain(width * 0.035, 40, 50);
    let titleYPos = 115 + arrowHeight / 2;
    
    // Ottieni larghezza del titolo
    let titolo = categoriaSelezionata.replace(/-/g, ' ');
    if (categoriaSelezionata === 'cause-esterne-concomitanti') {
      titolo = 'cause esterne e concomitanti';
    }
    
    // Calcola larghezza reale del testo usando p5.js
    push();
    textFont(lcdFont);
    textSize(titleSize);
    let titleWidth = textWidth(titolo.toUpperCase());
    pop();
    
    // Posiziona icona a destra del titolo con spazio responsive
    // Aggiungi un offset extra per compensare eventuali imprecisioni
    let iconSpacing = constrain(width * 0.02, 30, 45); // Aumentato lo spazio
    let iconX = margin + titleWidth + iconSpacing;
    let iconY = titleYPos;
    
    console.log('Title:', titolo, 'Width:', titleWidth, 'IconX:', iconX); // Debug
    
    infoIcon.style.left = iconX + 'px';
    infoIcon.style.top = iconY + 'px';
    infoIcon.style.display = 'flex';
    
    // Applica fade in durante la transizione
    if (transizioneAttiva && transizioneFadeInUI > 5) {
      infoIcon.style.opacity = (transizioneFadeInUI / 255).toString();
    } else {
      infoIcon.style.opacity = '1';
    }
    
    // Aggiorna testo tooltip
    if (categoriaSelezionata === 'conducenti') {
      infoText.textContent = 'Rientrano le cause legate ai comportamenti, agli errori o alle distrazioni dei guidatori.';
    } else if (categoriaSelezionata === 'non-conducenti') {
      infoText.textContent = 'Rientrano le cause attribuibili al comportamento di pedoni, passeggeri o altri utenti della strada non alla guida.';
    } else if (categoriaSelezionata === 'cause-esterne-concomitanti') {
      infoText.textContent = 'Rientrano le cause dovute a fattori esterni come ostacoli urtati o evitati, eventi concomitanti e circostanze imprecisate.';
    }
  } else {
    infoIcon.style.display = 'none';
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

// NAVBAR COUNTER: Aggiorna countdown e data/ora
function updateCounterTooltip() {
  // Aggiorna il countdown e la data/ora
  updateCounterCountdown();
}

// NAVBAR COUNTER COUNTDOWN: Calcola secondi al prossimo cambiamento
let previousSecondsDisplay = -1; // Per tracciare quando ricomincia il countdown
let maxSecondsForColor = 60; // Valore massimo dinamico per interpolazione colore

// Variabili globali per data e ora correnti (aggiornate in updateCounterCountdown)
let currentDay = 1;
let currentMonth = 1;
let currentHours = '00';
let currentMinutes = '00';

function updateCounterCountdown() {
  let countdownNumber = document.getElementById('counter-countdown-number');
  let counterDatetime = document.getElementById('counter-datetime');
  
  if (!countdownNumber || !counterDatetime) return;
  
  let now = new Date();
  let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let secondiTotali = 24 * 3600;
  let progress = secondiOggi / secondiTotali;
  
  // Calcola i valori target attuali
  let targetIncidenti = incidentiOggi * progress;
  let targetMorti = mortiOggi * progress;
  let targetFeriti = feritiOggi * progress;
  
  // Calcola i valori correnti (floor)
  let currentIncidenti = Math.floor(targetIncidenti);
  let currentMorti = Math.floor(targetMorti);
  let currentFeriti = Math.floor(targetFeriti);
  
  // Calcola quanto manca al prossimo incremento per ciascuno
  let progressForNextIncidente = (currentIncidenti + 1) / incidentiOggi;
  let progressForNextMorto = (currentMorti + 1) / mortiOggi;
  let progressForNextFerito = (currentFeriti + 1) / feritiOggi;
  
  // Converti in secondi dall'inizio del giorno
  let secondsForNextIncidente = progressForNextIncidente * secondiTotali;
  let secondsForNextMorto = progressForNextMorto * secondiTotali;
  let secondsForNextFerito = progressForNextFerito * secondiTotali;
  
  // Calcola quanto manca in secondi
  let secondsUntilIncidente = secondsForNextIncidente - secondiOggi;
  let secondsUntilMorto = secondsForNextMorto - secondiOggi;
  let secondsUntilFerito = secondsForNextFerito - secondiOggi;
  
  // Trova il minimo (il prossimo che cambierà)
  let secondsToNextChange = Math.min(
    secondsUntilIncidente > 0 ? secondsUntilIncidente : Infinity,
    secondsUntilMorto > 0 ? secondsUntilMorto : Infinity,
    secondsUntilFerito > 0 ? secondsUntilFerito : Infinity
  );
  
  // Arrotonda per eccesso (mostra secondi interi)
  let secondsDisplay = Math.ceil(secondsToNextChange);
  
  // Rileva quando il countdown ricomincia (secondi aumentano)
  if (secondsDisplay > previousSecondsDisplay) {
    maxSecondsForColor = secondsDisplay; // Salva il nuovo valore di partenza
  }
  
  // Flash quando manca 1 secondo
  if (secondsDisplay === 1 && previousSecondsDisplay !== 1) {
    let navbarCounter = document.querySelector('.navbar-counter');
    if (navbarCounter) {
      navbarCounter.classList.add('flash-outline');
      setTimeout(() => {
        navbarCounter.classList.remove('flash-outline');
      }, 3000);
    }
  }
  
  previousSecondsDisplay = secondsDisplay;
  
  // Calcola il colore progressivo da bianco ad arancione per il NUMERO
  // Interpola dal valore di partenza (maxSecondsForColor) a 0
  let colorProgress = maxSecondsForColor > 0 ? secondsDisplay / maxSecondsForColor : 0;
  
  // Colori: bianco (255,255,255) → arancione var(--orange) #ec6613 (236,102,19)
  let r = Math.round(255 * colorProgress + 236 * (1 - colorProgress));
  let g = Math.round(255 * colorProgress + 102 * (1 - colorProgress));
  let b = Math.round(255 * colorProgress + 19 * (1 - colorProgress));
  
  // Aggiorna il countdown number con colore dinamico
  if (secondsDisplay > 0 && secondsDisplay < Infinity) {
    countdownNumber.textContent = secondsDisplay;
    countdownNumber.style.color = `rgb(${r}, ${g}, ${b})`;
  } else {
    countdownNumber.textContent = '0';
    countdownNumber.style.color = `rgb(236, 102, 19)`;
  }
  
  // Aggiorna variabili globali data e ora correnti
  currentDay = now.getDate();
  currentMonth = now.getMonth() + 1; // I mesi partono da 0
  currentHours = String(now.getHours()).padStart(2, '0');
  currentMinutes = String(now.getMinutes()).padStart(2, '0');
  
  counterDatetime.textContent = `${currentDay}/${currentMonth}/2024 ${currentHours}:${currentMinutes}`;
}

// Navbar click: gestito solo in setup() (vedi handler su .nav-item).
// Il blocco DOMContentLoaded qui sotto è stato rimosso: duplicava i listener e,
// sui dropdown-item (Conducenti / Non conducenti / Cause esterne e concomitanti), impostava
// scrollTarget=4300 sovrascrivendo il salto a 6500 da selezionaDaNavbar.

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
    let orangeColor = getCSSColor('--orange');
    fill(red(orangeColor), green(orangeColor), blue(orangeColor), min(quadratoTestoOpacita, quadratoFadeOut));
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
    let orangeColor = getCSSColor('--orange');
    fill(red(orangeColor), green(orangeColor), blue(orangeColor), min(terzaSezioneTitoloOpacita, terzaSezioneFadeOut));
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
    // Attiva fade in leggenda dopo il sottotitolo
    if (grigliaIncidentiSottotitoloOpacita >= 255 && grigliaIncidentiLeggendaOpacita < 255) {
      grigliaIncidentiLeggendaOpacita += 5; // fade-in veloce
      grigliaIncidentiLeggendaOpacita = constrain(grigliaIncidentiLeggendaOpacita, 0, 255);
    }
  } else {
    numeroQuadratiniVisibili = 0;
    counterAttuale = 0;
    grigliaIncidentiSottotitoloOpacita = 0;
    grigliaIncidentiLeggendaOpacita = 0;
  }
  
  // Layout griglia: usa la variabile globale per coerenza (evita valori non inizializzati)
  dimensioneQuadratino = width * 0.008;
  dimensioneQuadratino = constrain(dimensioneQuadratino, 8, 18);
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
    let orangeColor = getCSSColor('--orange');
    fill(red(orangeColor), green(orangeColor), blue(orangeColor), grigliaFadeOut);
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
    
    // Leggenda: piccolo quadrato con "300 incidenti" (con fade in)
    if (grigliaIncidentiLeggendaOpacita > 0) {
      push();
      let legendX = width - 150; // Posizione a destra
      let legendY = height - 100; // In basso a destra
      let legendSquareSize = dimensioneQuadratino; // Stessa dimensione dei quadrati della griglia
      
      // Opacità combinata con fade out della griglia
      let legendOpacity = min(grigliaIncidentiLeggendaOpacita, grigliaFadeOut);
      
      // Disegna il quadrato della leggenda
      fill(255, 255, 255, legendOpacity);
      noStroke();
      rect(legendX, legendY, legendSquareSize, legendSquareSize);
      
      // Testo "300 incidenti"
      textFont(transportFont);
      textAlign(LEFT, CENTER);
      textSize(14);
      fill(255, 255, 255, legendOpacity);
      text('300 incidenti', legendX + legendSquareSize + 10, legendY + legendSquareSize / 2);
      pop();
    }
  }
}

function drawSezioneQuinta() {
  // Fade in del cubo (graduale da 3000 a 3100)
  let cuboOpacita = 0;
  if (scrollY > 3000 && scrollY < 3100) {
    cuboOpacita = map(scrollY, 3000, 3100, 0, 255);
    cuboOpacita = constrain(cuboOpacita, 0, 255);
  } else if (scrollY >= 3100) {
    cuboOpacita = 255;
  }
  
  // Fade out del cubo (veloce da 3301 a 3450)
  let quintaSezioneFadeOut = 255;
  if (scrollY > 3301 && scrollY < 3450) {
    quintaSezioneFadeOut = map(scrollY, 3301, 3450, 255, 0);
    quintaSezioneFadeOut = constrain(quintaSezioneFadeOut, 0, 255);
  } else if (scrollY >= 3450) {
    quintaSezioneFadeOut = 0;
  }
  
  // Cubo (mostra da scrollY 3000 in poi con fade in e fade out)
  if (scrollY >= 3000 && quintaSezioneFadeOut > 0) {
    drawCubo(min(cuboOpacita, quintaSezioneFadeOut));
  }
  
  // Sezione 5a (3100): Testo "MA VEDIAMO IL FENOMENO A 360 GRADI"
  if (scrollY >= 3000 && scrollY < 3300) {
    let sezione5aOpacita = 0;
    if (scrollY > 3000 && scrollY < 3100) {
      sezione5aOpacita = map(scrollY, 3000, 3100, 0, 255);
    } else if (scrollY >= 3100 && scrollY < 3200) {
      sezione5aOpacita = 255;
    } else if (scrollY >= 3200 && scrollY < 3300) {
      sezione5aOpacita = map(scrollY, 3200, 3300, 255, 0);
    }
    sezione5aOpacita = constrain(sezione5aOpacita, 0, 255);
    
    if (sezione5aCaratteriVisibili > 0 && sezione5aOpacita > 0) {
      push();
      textFont(lcdFont);
      textAlign(CENTER, CENTER);
      let txtSize = width * 0.025;
      txtSize = constrain(txtSize, 14, 60);
      textSize(txtSize);
      let orangeColor = getCSSColor('--orange');
      fill(red(orangeColor), green(orangeColor), blue(orangeColor), min(sezione5aOpacita, quintaSezioneFadeOut));
      let testoMostrato = sezione5aTestoCompleto.substring(0, sezione5aCaratteriVisibili);
      text(testoMostrato, width / 2, height / 2 + 180);
      pop();
    }
  }
  
  // Sezione 5b (3300): Testo "E OGNUNO DI QUESTI HA PROVOCATO MORTI E FERITI"
  if (scrollY >= 3200) {
    let sezione5bOpacita = 0;
    if (scrollY > 3200 && scrollY < 3300) {
      sezione5bOpacita = map(scrollY, 3200, 3300, 0, 255);
    } else if (scrollY >= 3300 && scrollY < 3301) {
      sezione5bOpacita = 255;
    } else if (scrollY >= 3301 && scrollY < 3450) {
      // Fade out veloce del testo 5b
      sezione5bOpacita = map(scrollY, 3301, 3450, 255, 0);
    }
    sezione5bOpacita = constrain(sezione5bOpacita, 0, 255);
    
    if (sezione5bCaratteriVisibili > 0 && sezione5bOpacita > 0) {
      push();
      textFont(lcdFont);
      textAlign(CENTER, CENTER);
      let txtSize = width * 0.025;
      txtSize = constrain(txtSize, 14, 60);
      textSize(txtSize);
      textLeading(txtSize * 1.4);
      let orangeColor = getCSSColor('--orange');
      fill(red(orangeColor), green(orangeColor), blue(orangeColor), min(sezione5bOpacita, quintaSezioneFadeOut));
      let testoMostrato = sezione5bTestoCompleto.substring(0, sezione5bCaratteriVisibili);
      text(testoMostrato, width / 2, height / 2 + 180);
      pop();
    }
  }
}

function drawCubo(fadeOut) {
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
    let orangeColor = getCSSColor('--orange');
    fill(red(orangeColor), green(orangeColor), blue(orangeColor), fadeOut);
    
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
  fill(255, 255, 255, fadeOut);
  // Aggiungi un bordo sottile al top per coerenza con la giunzione
  stroke(0, fadeOut);
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
  // Crea il canvas con risoluzione alta per display Retina
  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  const scaledSize = size * dpr;
  
  canvas.width = scaledSize;
  canvas.height = scaledSize;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  
  const ctx = canvas.getContext('2d', { alpha: true });
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);
  
  // Abilita antialiasing migliore
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Parametri del cubo (stesso stile della sezione 5)
  const centerX = size / 2;
  const centerY = size * 0.35; // Spostato più in alto per evitare taglio
  const semilatoQuadrato = size * 0.25; // Dimensione proporzionale
  const altezzaLatiVerticali = semilatoQuadrato * 1.7;
  
  // Rotazione isometrica (45 gradi)
  const angoloRotazione = Math.PI / 4;
  const fattoreSchiacciamento = 0.38;
  
  // Punti base del quadrato
  const puntiBaseQuadrato = [
    {x: -semilatoQuadrato, y: -semilatoQuadrato},
    {x: semilatoQuadrato, y: -semilatoQuadrato},
    {x: semilatoQuadrato, y: semilatoQuadrato},
    {x: -semilatoQuadrato, y: semilatoQuadrato}
  ];
  
  // Applica rotazione e schiacciamento
  const applicaRotazioneESchiacciamento = (punto) => {
    const coseno = Math.cos(angoloRotazione);
    const seno = Math.sin(angoloRotazione);
    const xRuotato = punto.x * coseno - punto.y * seno;
    const yRuotato = (punto.x * seno + punto.y * coseno) * fattoreSchiacciamento;
    return {
      x: centerX + xRuotato,
      y: centerY + yRuotato
    };
  };
  
  const puntoAltoSinistra = applicaRotazioneESchiacciamento(puntiBaseQuadrato[0]);
  const puntoAltoDestra = applicaRotazioneESchiacciamento(puntiBaseQuadrato[1]);
  const puntoBassoDestro = applicaRotazioneESchiacciamento(puntiBaseQuadrato[2]);
  const puntoBassoSinistra = applicaRotazioneESchiacciamento(puntiBaseQuadrato[3]);
  
  // Colore grigio chiaro
  const grayColor = '#B0B0B0';
  
  // Disegna facce laterali TRASPARENTI con solo outline
  ctx.strokeStyle = grayColor;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  
  // Faccia sinistra (solo bordo, no fill)
  ctx.beginPath();
  ctx.moveTo(puntoBassoSinistra.x, puntoBassoSinistra.y);
  ctx.lineTo(puntoBassoDestro.x, puntoBassoDestro.y);
  ctx.lineTo(puntoBassoDestro.x, puntoBassoDestro.y + altezzaLatiVerticali);
  ctx.lineTo(puntoBassoSinistra.x, puntoBassoSinistra.y + altezzaLatiVerticali);
  ctx.closePath();
  ctx.stroke();
  
  // Faccia destra (solo bordo, no fill)
  ctx.beginPath();
  ctx.moveTo(puntoBassoDestro.x, puntoBassoDestro.y);
  ctx.lineTo(puntoAltoDestra.x, puntoAltoDestra.y);
  ctx.lineTo(puntoAltoDestra.x, puntoAltoDestra.y + altezzaLatiVerticali);
  ctx.lineTo(puntoBassoDestro.x, puntoBassoDestro.y + altezzaLatiVerticali);
  ctx.closePath();
  ctx.stroke();
  
  // Linea verticale centrale (edge tra le due facce)
  ctx.beginPath();
  ctx.moveTo(puntoBassoDestro.x, puntoBassoDestro.y);
  ctx.lineTo(puntoBassoDestro.x, puntoBassoDestro.y + altezzaLatiVerticali);
  ctx.stroke();
  
  // Disegna la faccia superiore GRIGIA con fill
  ctx.fillStyle = grayColor;
  ctx.strokeStyle = grayColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(puntoAltoSinistra.x, puntoAltoSinistra.y);
  ctx.lineTo(puntoAltoDestra.x, puntoAltoDestra.y);
  ctx.lineTo(puntoBassoDestro.x, puntoBassoDestro.y);
  ctx.lineTo(puntoBassoSinistra.x, puntoBassoSinistra.y);
  ctx.closePath();
  ctx.fill();
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
  let orangeRGB = getComputedStyle(document.documentElement).getPropertyValue('--orange').trim();
  let sideColor = lerpColor(color(255, 255, 255), color(orangeRGB), normalizedPercent);
  
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
  // Crea un punto centrale unico che scende più in basso per formare una punta
  let centerOffset = half * 0.5; // Offset per far scendere il punto centrale
  let centerPoint = {x: 0, y: centerOffset}; // Punto centrale unico
  let L0 = {x: bL0.x, y: 0}; // Punto esterno sinistro sulla linea
  let L1 = centerPoint; // Punto centrale che scende
  let L2 = rot(base[0], sideH);
  let L3 = rot(base[3], sideH);
  let L = [L0, L1, L2, L3];
  
  let mirror = (pt) => ({x: -pt.x, y: pt.y});
  let R0 = {x: -bL0.x, y: 0}; // Punto esterno destro sulla linea
  let R1 = centerPoint; // Stesso punto centrale
  let R = [R0, R1, mirror(L2), mirror(L3)];
  
  // Lati con gradiente bianco-arancione
  if (sideH > 0) {
    fill(red(sideColor), green(sideColor), blue(sideColor), 255 * cubeOpacity);
    noStroke();
    quad(L[0].x, L[0].y, L[1].x, L[1].y, L[2].x, L[2].y, L[3].x, L[3].y);
    quad(R[0].x, R[0].y, R[1].x, R[1].y, R[2].x, R[2].y, R[3].x, R[3].y);
    // Outline nero per effetto giuntura - solo in modalità colonna
    if (trans > 0.5) {
      push();
      stroke(0, 140 * cubeOpacity);
      strokeWeight(1.2);
      strokeJoin(ROUND);
      noFill();
      quad(L[0].x, L[0].y, L[1].x, L[1].y, L[2].x, L[2].y, L[3].x, L[3].y);
      quad(R[0].x, R[0].y, R[1].x, R[1].y, R[2].x, R[2].y, R[3].x, R[3].y);
      pop();
    }
  }
  
  // Top del cubo
  push();
  if (isFilled) {
    fill(red(categoryColor), green(categoryColor), blue(categoryColor), 255 * cubeOpacity);
  } else {
    fill(0, 0, 0, 255 * cubeOpacity);
  }
  // Bordo nero solo in modalità colonna
  if (trans > 0.5) {
    stroke(0, 255 * cubeOpacity);
    strokeWeight(1.2);
  } else {
    noStroke();
  }
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
    // Aggiorna variabili globali data e ora per questa sezione
    let now = new Date();
    currentDay = now.getDate();
    currentMonth = now.getMonth() + 1;
    currentHours = String(now.getHours()).padStart(2, '0');
    currentMinutes = String(now.getMinutes()).padStart(2, '0');
    
    push();
    textAlign(CENTER, CENTER);
    textFont(lcdFont);

    fill(255, 255, 255, counterFadeOut);
    textSize(width * 0.02);
    text(`PENSA CHE SOLO IL ${currentDay}/${currentMonth}/2024, ALLE ${currentHours}:${currentMinutes},\nSI ERANO GIÀ VERIFICATI:`, width / 2, height * 0.3);

    let orangeColor = getCSSColor('--orange');
    fill(red(orangeColor), green(orangeColor), blue(orangeColor), counterFadeOut);
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
    text("(si aggiorna in tempo reale)", width / 2, height * 0.80);
    
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
    let orangeColor = getCSSColor('--orange');
    fill(red(orangeColor), green(orangeColor), blue(orangeColor), colpaOpacity);
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
  const coloreBlu = getCSSColor('--blue');
  const coloreVerde = getCSSColor('--green');
  const coloreRosa = getCSSColor('--pink');
  
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
  let topY = height / 2 - max(blueDims.rows, greenDims.rows, pinkDims.rows) * (quadSize + quadSpacing) / 2 + 120;
  
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
    text(currentConducenti.toLocaleString('it-IT'), blueCenterX, topY - 40);
    
    // Label sotto il numero
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, blueOpacity);
    text('Conducenti', blueCenterX, topY - 15);
    
    // Numero gruppo VERDE (Cause esterne e concomitanti)
    let greenCenterX = greenStartX + (greenDims.cols * (quadSize + quadSpacing)) / 2;
    let greenOpacity = hoveredGridIndex === -1 || hoveredGridIndex === 1 ? numberOpacity : numberOpacity * 0.3;
    textFont(lcdFont);
    textSize(txtSize);
    fill(51, 187, 68, greenOpacity);
    text(currentCauseEsterne.toLocaleString('it-IT'), greenCenterX, topY - 40);
    
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, greenOpacity);
    text('Cause esterne e concomitanti', greenCenterX, topY - 15);
    
    // Numero gruppo ROSA (Non conducenti)
    let pinkCenterX = pinkStartX + (pinkDims.cols * (quadSize + quadSpacing)) / 2;
    let pinkOpacity = hoveredGridIndex === -1 || hoveredGridIndex === 2 ? numberOpacity : numberOpacity * 0.3;
    textFont(lcdFont);
    textSize(txtSize);
    fill(253, 115, 237, pinkOpacity);
    text(currentNonConducenti.toLocaleString('it-IT'), pinkCenterX, topY - 40);
    
    textFont(transportFont);
    textSize(txtSize * 0.4);
    fill(255, 255, 255, pinkOpacity);
    text('Non conducenti', pinkCenterX, topY - 15);
    
    pop();
  }
  
  // Testo informativo sotto "MA DI CHI È LA COLPA?" (appare con l'animazione)
  if (animRegroupProgress > 0.5 && scrollY < 6500) {
    // Inizializza timer se non è ancora partito
    if (ctaFadeStartTime === -1) {
      ctaFadeStartTime = millis();
    }
    
    // Calcola tempo trascorso dal primo trigger
    let elapsed = millis() - ctaFadeStartTime;
    let delayMs = 1000; // 1 secondo di delay
    let fadeDuration = 500; // 500ms per fade in
    
    // Fade in dopo 1 secondo
    if (elapsed < delayMs) {
      ctaFadeOpacity = 0;
    } else if (elapsed < delayMs + fadeDuration) {
      ctaFadeOpacity = map(elapsed, delayMs, delayMs + fadeDuration, 0, grigliaFadeIn);
    } else {
      ctaFadeOpacity = grigliaFadeIn;
    }
    
    if (ctaFadeOpacity > 0) {
      push();
      textAlign(CENTER, TOP);
      textFont(transportFont);
      textSize(txtSize * 0.42); // 2 punti più grande (era 0.4)
      fill(255, 255, 255, ctaFadeOpacity);
      
      // Posiziona sotto "MA DI CHI È LA COLPA?" - responsive
      // colpaPosY è in height * 0.2 quando la griglia è visibile
      let bottomY = height * 0.2 + txtSize * 0.9; // Spazio proporzionale alla dimensione del testo (ridotto da 1.2 a 0.9)
      
      // Aggiungi bounce effect leggero e smooth
      let bounceTime = (elapsed - delayMs - fadeDuration) / 1000; // tempo in secondi dopo fade in
      let bounceOffset = 0;
      if (bounceTime > 0) {
        // Ciclo bounce di 2 secondi con easing smooth
        let cycle = (bounceTime % 2) / 2; // 0 a 1 ogni 2 secondi
        if (cycle < 0.4) {
          // 0% a 40%: sale a -3px con ease out
          let t = cycle / 0.4;
          t = 1 - pow(1 - t, 2); // ease out quadratic
          bounceOffset = -3 * t;
        } else if (cycle < 0.5) {
          // 40% a 50%: scende a 0 con ease in
          let t = (cycle - 0.4) / 0.1;
          t = pow(t, 2); // ease in quadratic
          bounceOffset = -3 * (1 - t);
        } else if (cycle < 0.6) {
          // 50% a 60%: sale a -1.5px con ease out
          let t = (cycle - 0.5) / 0.1;
          t = 1 - pow(1 - t, 2);
          bounceOffset = -1.5 * t;
        } else if (cycle < 0.8) {
          // 60% a 80%: scende a 0 con ease in
          let t = (cycle - 0.6) / 0.2;
          t = pow(t, 2);
          bounceOffset = -1.5 * (1 - t);
        }
        // 80% a 100%: resta a 0
      }
      
      text("Clicca su una categoria per scoprire le cause degli incidenti più nello specifico", width / 2, bottomY + bounceOffset);
      pop();
    }
    
    // Fade in leggenda dopo che il testo CTA è completamente visibile
    if (ctaFadeOpacity >= grigliaFadeIn && legendFadeOpacity < grigliaFadeIn) {
      legendFadeOpacity += 5; // fade-in veloce
      legendFadeOpacity = constrain(legendFadeOpacity, 0, grigliaFadeIn);
    }
  } else {
    // Reset quando non è visibile
    ctaFadeStartTime = -1;
    ctaFadeOpacity = 0;
    legendFadeOpacity = 0;
  }
  
  // Leggenda: piccolo quadrato con "300 incidenti" (appare con fade in dopo il testo CTA)
  if (legendFadeOpacity > 0 && scrollY < 6500) {
    push();
    let legendX = width - 150; // Posizione a destra
    let legendY = height - 100; // In basso a destra
    let legendSquareSize = quadSize; // Stessa dimensione dei quadrati della griglia
    
    // Disegna il quadrato della leggenda
    fill(255, 255, 255, legendFadeOpacity);
    noStroke();
    rect(legendX, legendY, legendSquareSize, legendSquareSize);
    
    // Testo "300 incidenti"
    textFont(transportFont);
    textAlign(LEFT, CENTER);
    textSize(14);
    fill(255, 255, 255, legendFadeOpacity);
    text('300 incidenti', legendX + legendSquareSize + 10, legendY + legendSquareSize / 2);
    pop();
  }
  
  pop(); // Fine isolamento stile sezione 7
}

function drawTransizioneSezioneOttava() {
  // Mostra la transizione solo tra scroll 5200 e 6500 quando transizioneAttiva è true
  if (!transizioneAttiva) {
    transizioneFadeInUI = 0; // Reset fade in UI
    return;
  }
  if (scrollY < 5200 || scrollY >= 6500) {
    transizioneAttiva = false;
    transizioneFadeInUI = 0; // Reset fade in UI
    return;
  }
  
  // Calcola progress dell'animazione basato su scrollY (5200-6500)
  transizioneProgress = map(scrollY, 5200, 6500, 0, 1);
  transizioneProgress = constrain(transizioneProgress, 0, 1);
  
  // Applica easing per movimento più fluido (ease-in-out cubico)
  let easedProgress = transizioneProgress * transizioneProgress * (3 - 2 * transizioneProgress);
  
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
  let quadSize = dimensioneQuadratino || 30;
  let quadSpacing = quadSize * 0.5;
  let quadPerRiga = floor(width * 0.4 / (quadSize + quadSpacing));
  quadPerRiga = constrain(quadPerRiga, 30, 60);
  
  // Colore categoria
  let categoryColor = getOverlayColor(categoriaSelezionata);
  
  // Fade out degli altri elementi all'inizio dell'animazione
  let fadeOutOthers = map(easedProgress, 0, 0.15, 255, 0);
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
  
  // Usa la stessa formula della sezione 7 per allineare perfettamente le posizioni iniziali
  let topY = height / 2 - max(blueDims.rows, greenDims.rows, pinkDims.rows) * (quadSize + quadSpacing) / 2 + 120;
  
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
  
  // Pre-calcola dimensioni dei quadrati e larghezze dei cubi (COME SEZIONE 8)
  let quadSizes = [];
  let cubeWidths = [];
  let sumCubeWidths = 0;
  for (let i = 0; i < numRows - 1; i++) {
    let i300 = int(categoryData.getString(i, 'I/300'));
    let area = baseQuadSize * baseQuadSize * i300;
    let size = (i300 >= 1) ? sqrt(area) : baseQuadSize;
    let cubeWidth = size * sqrt(2);
    quadSizes.push(size);
    cubeWidths.push(cubeWidth);
    sumCubeWidths += cubeWidth;
  }
  
  let count = quadSizes.length;
  let availableWidth = width - 2 * SEZIONE_MARGIN;
  
  // Spacing cubi per categoria (come sezione 8)
  let finalQuadSpacing = getCubeSpacingForCategoria(categoriaSelezionata);
  
  // Calcola larghezza totale e posizione iniziale centrata (COME SEZIONE 8)
  let totalWidth = sumCubeWidths + finalQuadSpacing * Math.max(0, count - 1);
  let finalXStart = SEZIONE_MARGIN + (availableWidth - totalWidth) / 2;
  let baselineY = height - SEZIONE_MARGIN;

  // Fade in elementi UI (titolo) progressivamente durante l'animazione
  let fadeInUI = map(easedProgress, 0.5, 1, 0, 255);
  fadeInUI = constrain(fadeInUI, 0, 255);
  transizioneFadeInUI = fadeInUI; // Salva in variabile globale per sincronizzare con legende
  
  // Disegna titolo con fade in (allineato a sezione 8)
  if (fadeInUI > 0) {
    push();
    fill(255, 255, 255, fadeInUI);
    textFont(lcdFont);
    // Titolo responsivo (approx 40px @ 1920)
    let titleSize = constrain(width * 0.021, 20, 48);
    textSize(titleSize);
    textAlign(LEFT, CENTER);
    let margin = SEZIONE_MARGIN;
    
    // Allinea il centro del titolo al centro della freccia back-arrow (come in sezione 8)
    let arrowHeight = constrain(width * 0.035, 40, 50); // clamp(40px, 3.5vw, 50px)
    let titleYPos = 115 + arrowHeight / 2;
    
    let titolo = categoriaSelezionata.replace(/-/g, ' ');
    if (categoriaSelezionata === 'cause-esterne-concomitanti') {
      titolo = 'cause esterne e concomitanti';
    }
    text(titolo.toUpperCase(), margin, titleYPos);
    pop();
  }
  
  // Calcola xPos corrente per disegnare i quadrati finali
  let xPos = finalXStart;
  
  // Disegna l'animazione dei quadratini che si fondono nei quadrati finali
  let quadIndex = 0;
  for (let causeIdx = 0; causeIdx < numRows - 1; causeIdx++) {
    let i300 = int(categoryData.getString(causeIdx, 'I/300'));
    let finalSize = quadSizes[causeIdx]; // Dimensione del quadrato
    let cubeWidth = cubeWidths[causeIdx];
    
    // Posizione finale ESATTA del quadrato (angolo in basso a sinistra)
    let finalX = xPos + (cubeWidth - finalSize) / 2;
    let finalY = baselineY - finalSize;
    
    // Disegna i singoli quadratini che si amalgamano gradualmente nel quadrato finale
    let numQuadsForCause = floor(i300);
    
    // I quadratini si posizionano in una griglia che compone il quadrato finale
    let gridCols = ceil(sqrt(numQuadsForCause));
    let gridRows = ceil(numQuadsForCause / gridCols);
    let cellSize = finalSize / max(gridCols, gridRows);
    
    // Disegna i quadratini con movimento fluido diretto dalla posizione iniziale a quella finale
    for (let q = 0; q < numQuadsForCause && quadIndex < numQuadratiniCategoria; q++) {
      // Posizione iniziale nella griglia della categoria (sezione 7)
      let startRow = floor(quadIndex / startDims.cols);
      let startCol = quadIndex % startDims.cols;
      let startXPos = startX + startCol * (quadSize + quadSpacing);
      let startYPos = topY + startRow * (quadSize + quadSpacing);
      
      // Posizione finale nell'istogramma (sezione 8)
      let finalRow = floor(q / gridCols);
      let finalCol = q % gridCols;
      let finalXPos = finalX + finalCol * cellSize;
      let finalYPos = finalY + finalRow * cellSize;
      
      // Crea un offset temporale unico per ogni quadratino (effetto dissoluto)
      // Usa una combinazione di posizione iniziale e indice per varietà
      let timeOffset = (sin(quadIndex * 0.5) * 0.5 + 0.5) * 0.15; // offset tra -0.15 e +0.15
      let individualProgress = constrain((easedProgress - timeOffset) / (1 - timeOffset), 0, 1);
      
      // Applica un easing personalizzato per ogni quadratino (movimento più organico)
      let smoothProgress = individualProgress * individualProgress * (3 - 2 * individualProgress);
      
      // Calcola traiettoria curva invece che lineare (effetto più naturale)
      // I quadratini si alzano leggermente durante il movimento
      let curveHeight = sin(smoothProgress * PI) * height * 0.1; // alzamento massimo 10% altezza
      
      // Movimento fluido con curva
      let currentX = lerp(startXPos, finalXPos, smoothProgress);
      let currentY = lerp(startYPos, finalYPos, smoothProgress) - curveHeight;
      let currentSize = lerp(quadSize, cellSize, smoothProgress);
      
      // Opacità variabile per effetto dissoluzione
      let alpha = map(smoothProgress, 0, 0.1, 200, 255); // fade in veloce all'inizio
      alpha = constrain(alpha, 0, 255);
      
      fill(red(categoryColor), green(categoryColor), blue(categoryColor), alpha);
      noStroke();
      rectMode(CORNER);
      rect(currentX, currentY, currentSize, currentSize);
      
      quadIndex++;
    }
    
    xPos += cubeWidth + finalQuadSpacing;
  }
  
  // Disegna la linea di base e la scritta "Incidenti" con fade in
  if (fadeInUI > 0) {
    // Linea orizzontale bianca di base
    push();
    stroke(255, fadeInUI);
    strokeWeight(1);
    line(SEZIONE_MARGIN, baselineY, width - SEZIONE_MARGIN, baselineY);
    pop();
    
    // Label "Incidenti" sotto la linea
    push();
    fill(255, fadeInUI);
    if (typeof transportFont !== 'undefined' && transportFont) textFont(transportFont); else textFont(lcdFont);
    textSize(16);
    textAlign(CENTER, CENTER);
    text('Incidenti', width / 2, height - 50);
    pop();
  }
  
  // Popola il contenuto del catCausa durante la transizione
  const catContainer = placeCatCausaContainer();
  if (catContainer && fadeInUI > 0) {
    catContainer.style.backgroundColor = 'transparent';
    catContainer.innerHTML = `
      <h3 style="color: var(--grass); margin: 0; font-weight: var(--grass);">Muoviti o clicca su un quadrato per visualizzare i dettagli</h3>
    `;
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

  // Dati dalla categoria scelta: navbar dropdown → selezionaDaNavbar(id) → categoriaSelezionata → qui
  let categoryData = getCategoriaData(categoriaSelezionata);
  if (categoryData) {
    // Reset opacità animate quando il dataset cambia
    let currentRowCount = categoryData.getRowCount();
    let newItemNames = new Set();
    for (let i = 0; i < currentRowCount - 1; i++) {
      newItemNames.add(categoryData.getString(i, 0));
    }
    
    // Rimuovi elementi non più presenti nel dataset corrente
    for (let nome in sezioneOttavaItemOpacities) {
      if (!newItemNames.has(nome)) {
        delete sezioneOttavaItemOpacities[nome];
        delete sezioneOttavaItemOpacityTargets[nome];
      }
    }
    
    const margin = SEZIONE_MARGIN; // spazio interno su tutti i lati
    fill(255, 255, 255, 255);
    textFont(lcdFont);
    // Titolo responsive (coerente con transizione)
    let titleSize = constrain(width * 0.021, 20, 48);
    textSize(titleSize);
    textAlign(LEFT, CENTER);
    // Allinea il centro del titolo al centro della freccia back-arrow
    // La freccia è a top: calc(100px + 15px) = 115px
    // L'altezza della freccia è clamp(40px, 3.5vw, 50px)
    let arrowHeight = constrain(width * 0.035, 40, 50); // clamp(40px, 3.5vw, 50px)
    let titleYPos = 115 + arrowHeight / 2;
    let titolo = categoriaSelezionata.replace(/-/g, ' ');
    if (categoriaSelezionata === 'cause-esterne-concomitanti') {
      titolo = 'cause esterne e concomitanti';
    }
    text(titolo.toUpperCase(), margin, titleYPos);
    
    let yPos = titleYPos + titleSize;
    
    // Disegna quadrati per ogni riga del dataset (escluso il totale)
    let categoryColor = getOverlayColor(categoriaSelezionata);
    let numRows = categoryData.getRowCount();
    let baseQuadSize = dimensioneQuadratino || 30; // Usa la variabile calcolata nella sezione 7, fallback a 30 se non definita

    // Desired spacing between squares; responsive based on viewport and base quad size
    const DESIRED_SPACING = max(baseQuadSize * 2.2, constrain(width * 0.0417, 40, 160));

    // Pre-calcola le dimensioni dei cubi (diagonale del quadrato) e la somma delle larghezze
    let sizes = [];
    let sumSizes = 0;
    for (let i = 0; i < numRows - 1; i++) {
      let i300 = int(categoryData.getString(i, 'I/300'));
      let area = baseQuadSize * baseQuadSize * i300;
      let size = (i300 >= 1) ? sqrt(area) : baseQuadSize;
      let cubeWidth = size * sqrt(2); // base sui cubi (diagonale)
      sizes.push(cubeWidth);
      sumSizes += cubeWidth;
    }

    let count = sizes.length;
    let availableWidth = width - 2 * SEZIONE_MARGIN;

    // Spacing cubi per categoria
    let quadSpacing = getCubeSpacingForCategoria(categoriaSelezionata);

    // Calcola larghezza totale effettiva e posizione iniziale x
    let totalWidth = sumSizes + quadSpacing * Math.max(0, count - 1);
    let xPos = SEZIONE_MARGIN + (availableWidth - totalWidth) / 2;
    let baselineY = height - margin; // Linea di base in basso con margine
    
    sezioneOttavaSquareHitboxes = []; // Reset hitbox
    sezioneOttavaLesionatiHitboxes = []; // Reset hitbox lesionati
    
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
      
      let cubeWidth = quadSize * sqrt(2);
      let half = quadSize / 2;
      let cx = xPos + cubeWidth / 2;
      
      // Hitbox esteso: larghezza del cubo, altezza totale della colonna
      let hitboxLeft = cx - half;
      let hitboxRight = cx + half;
      let hitboxTop = baselineY - quadSize - H * sezioneOttavaTrans;
      let hitboxBottom = baselineY;
      
      if (mouseX >= hitboxLeft && mouseX <= hitboxRight && 
          mouseY >= hitboxTop && mouseY <= hitboxBottom) {
        hoveredSezioneOttavaItem = nome;
      }
      
      // Precalcola hitbox lesionati per il controllo hover
      let diagonaleQuadrato = quadSize * sqrt(2);
      let hitboxLesionatiX = xPos + (quadSize - diagonaleQuadrato) / 2;
      if (mouseX >= hitboxLesionatiX && mouseX <= hitboxLesionatiX + diagonaleQuadrato && 
          mouseY >= baselineY - H * sezioneOttavaTrans && mouseY <= baselineY) {
        hoveredSezioneOttavaItem = nome;
      }
      
      xPos += cubeWidth + quadSpacing;
    }
    
    // Reset xPos per la seconda passata (centro, come sopra)
    xPos = SEZIONE_MARGIN + (availableWidth - totalWidth) / 2;
    
    // Calcola opacità per fade in durante transizione
    let baselineOpacity = 255;
    if (transizioneAttiva && scrollY >= 5200 && scrollY < 6500) {
      // Durante transizione: usa transizioneFadeInUI per sincronizzare con gli altri elementi
      baselineOpacity = transizioneFadeInUI;
    }
    
    // Disegna la linea orizzontale bianca PRIMA dei parallelepipedi (così stanno sopra)
    push();
    stroke(255, baselineOpacity);
    strokeWeight(1);
    line(SEZIONE_MARGIN, height - 100, width - SEZIONE_MARGIN, height - 100);
    pop();
    
    // Seconda passata: disegna tutti i cubi/barre (una per sottocausa). categoryData = getCategoriaData(categoriaSelezionata);
    // categoriaSelezionata impostata da navbar (sezione Responsabilità) via selezionaDaNavbar(id) o da click in sez. 7.
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
      
      let cubeWidth = quadSize * sqrt(2);
      let half = quadSize / 2;
      let cx = xPos + cubeWidth / 2; // Centro del cubo
      
      // Determina target opacità: 100% se hovato, 30% se altri sono hovati, 100% se nessuno è hovato
      let targetOpacity = 1.0; // Opacità piena
      if (hoveredSezioneOttavaItem !== null && hoveredSezioneOttavaItem !== nome) {
        targetOpacity = 0.3;
      }
      
      // Inizializza l'opacità se non esiste ancora
      if (sezioneOttavaItemOpacities[nome] === undefined) {
        sezioneOttavaItemOpacities[nome] = targetOpacity;
        sezioneOttavaItemOpacityTargets[nome] = targetOpacity;
      }
      
      // Aggiorna il target
      sezioneOttavaItemOpacityTargets[nome] = targetOpacity;
      
      // Applica easing con lerp
      sezioneOttavaItemOpacities[nome] = lerp(sezioneOttavaItemOpacities[nome], sezioneOttavaItemOpacityTargets[nome], SEZIONE_OTTAVA_OPACITY_EASING);
      
      let cubeOpacity = sezioneOttavaItemOpacities[nome];
      
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
        index: i,
        nome: nome
      });
      
      // Salva hitbox lesionati
      let diagonaleQuadrato = quadSize * sqrt(2);
      let hitboxLesionatiX = xPos + (quadSize - diagonaleQuadrato) / 2;
      sezioneOttavaLesionatiHitboxes.push({
        x: hitboxLesionatiX,
        y: baselineY - H * sezioneOttavaTrans,
        w: diagonaleQuadrato,
        h: H * sezioneOttavaTrans,
        index: i,
        nome: nome,
        lesionati: lesionati
      });
      
      // Avanza xPos al bordo destro del cubo più lo spacing
      xPos += cubeWidth + quadSpacing;
    }
    
    // If nothing is hovered this frame, show a helpful default message
    const catContainer = placeCatCausaContainer();
    if (catContainer) {
      if (hoveredSezioneOttavaItem === null) {
        // Rimuovi background arancione quando non c'è hover
        catContainer.style.backgroundColor = 'transparent';
        
        // Cambia il testo in base allo stato
        let testoIstruzione = '';
        if (categoriaSelezionata === null) {
          // Nessuna categoria selezionata
          testoIstruzione = "Seleziona un'area per visualizzare i dettagli";
        } else if (sezioneOttavaTrans > 0.5) {
          // Categoria selezionata e colonne completamente visibili
          testoIstruzione = "Muoviti o clicca su una colonna per visualizzare i dettagli";
        } else {
          // Categoria selezionata ma colonne ancora in animazione
          testoIstruzione = "Muoviti o clicca su un quadrato per visualizzare i dettagli";
        }
        
        catContainer.innerHTML = `
          <h3 style="color: var(--grass); margin: 0; font-weight: var(--grass);">${testoIstruzione}</h3>
        `;
      } else {
        // Aggiungi background arancione opaco quando c'è hover
        catContainer.style.backgroundColor = 'rgba(255, 139, 67, 0.15)';
      }
    }

    // Reset hover per il prossimo frame
    hoveredSezioneOttavaItem = null;
  }

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
      line(width - SEZIONE_MARGIN, SEZIONE_MARGIN + 70, width - SEZIONE_MARGIN, height - 100);
      pop();
    }
  }

  // Label 'Incidenti' riferita alla linea (70px sotto la linea)
  // Calcola opacità per fade in durante transizione (sincronizzata con baseline)
  let incidentiTextOpacity = 255;
  if (transizioneAttiva && scrollY >= 5200 && scrollY < 6500) {
    incidentiTextOpacity = transizioneFadeInUI;
  }
  
  push();
  fill(255, incidentiTextOpacity);
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
  let orangeColor = getCSSColor('--orange');
  fill(red(orangeColor), green(orangeColor), blue(orangeColor), 150);
  text('scrollY: ' + floor(scrollY), width - 10, height - 10);
  pop();
}

// ========================================
// EVENT HANDLERS
// ========================================

function mouseClicked() {
  // Gestione click nella sezione 8
  if (scrollY >= 6500 && scrollY < 6700) {
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
        let nuovaCategoria = null;
        // Imposta la categoria in base all'indice: 0=conducenti, 1=cause-esterne, 2=non-conducenti
        if (i === 0) {
          nuovaCategoria = 'conducenti';
        } else if (i === 1) {
          nuovaCategoria = 'cause-esterne-concomitanti';
        } else if (i === 2) {
          nuovaCategoria = 'non-conducenti';
        }
        
        // Se riclicco sulla stessa categoria, la deseleziono
        if (categoriaSelezionata === nuovaCategoria) {
          categoriaSelezionata = null;
          sezioneOttavaTransTarget = 0;
          hasClickedCategory = false;
        } else {
          categoriaSelezionata = nuovaCategoria;
          // Attiva la transizione animata
          transizioneAttiva = true;
          transizioneProgress = 0;
          hasClickedCategory = true; // Sblocca lo scroll
        }
        
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
  // Ricalcola margine e dimensione quadratini in modo responsive, così
  // anche se si salta la sezione 7 i calcoli della sezione 8 saranno corretti.
  SEZIONE_MARGIN = constrain(floor(windowWidth * 0.052), 40, 160); // ~100px @1920
  dimensioneQuadratino = constrain(windowWidth * 0.008, 8, 18);
}
