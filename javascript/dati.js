//========= creare una tendina che si apre al click con p5.js ==========

// Variabili per scroll con checkpoint
let scrollY = 0;
let scrollTarget = -1;
let scrollVelocita = 8;
let scrollSnapEnabled = true;
let scrollCheckpoints = [
  0,      // Sezione 1: Testo descrittivo
  600     // Sezione 2: Liste categorie
];
let currentCheckpointIndex = 0;
let isScrolling = false;
let scrollAccumulator = 0;
let scrollThreshold = 100;

// Valori counter - calcolati dai dati ISTAT
let incidentiOggi = 0;
let mortiOggi = 0;
let feritiOggi = 0;

// Variabili per tracciare il countdown
let previousSecondsDisplay = -1;
let maxSecondsForColor = 60;

function setup() {
  // Crea un canvas per il sistema di scroll
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '5');
  canvas.style('pointer-events', 'none');
  background(0, 0);
  
  // (removed explicit body height/overflow to match chi_siamo behavior)
  
  // Carica i dati e aggiorna il counter
  loadCSVData();
  
  // Setup frecce di navigazione
  setupScrollArrows();
  
  // Setup navigazione da tastiera
  setupKeyboardNavigation();
  
  // Aggiorna visibilità sezioni in base allo scroll
  updateSectionVisibility();
  
  // Centra orizzontalmente e verticalmente le sezioni
  centerDatiSection();
  centerCategorieSection();
  
  // Seleziona tutti i bottoni delle categorie usando p5
  let buttons = selectAll('.newCategory');
  
  // Per ogni bottone, aggiungi l'event listener con p5
  buttons.forEach(button => {
    button.mousePressed(() => {
      // Accedi all'elemento HTML nativo
      let buttonElement = button.elt;

      // Cerca il prossimo sibling con classe 'oldCategory' (salta nodi intermedi)
      function findOldCategory(el) {
        let sib = el.nextElementSibling;
        while (sib) {
          if (sib.classList && sib.classList.contains('oldCategory')) return sib;
          sib = sib.nextElementSibling;
        }
        return null;
      }

      let oldCategory = findOldCategory(buttonElement);
      if (!oldCategory) return;

      // Accordion behaviour: chiudi tutte le altre tendine per evitare spostamenti multipli
      const allOld = document.querySelectorAll('.oldCategory');
      allOld.forEach(oc => {
        if (oc !== oldCategory) {
          oc.style.display = 'none';
          // rimuovi eventuali stili inline impostati in precedenza
          oc.style.marginLeft = '';
          oc.style.width = '';
          oc.style.maxWidth = '';
          oc.style.paddingLeft = '';
        }
      });
      // Rimuovi active da tutti i bottoni prima di impostare lo stato sul clickato
      document.querySelectorAll('.newCategory').forEach(b => b.classList.remove('active'));

      // Toggle della tendina associata
      if (oldCategory.style.display === 'block') {
        oldCategory.style.display = 'none';
        // reset inline styles
        oldCategory.style.marginLeft = '';
        oldCategory.style.width = '';
        oldCategory.style.maxWidth = '';
        oldCategory.style.paddingLeft = '';
        buttonElement.classList.remove('active');
      } else {
        // copia i valori di padding/margin/width dal bottone per allineare layout
        try {
          const cs = window.getComputedStyle(buttonElement);
          // applica margin-left e larghezza calcolata per mantenere l'allineamento
          oldCategory.style.marginLeft = cs.marginLeft;
          oldCategory.style.width = cs.width;
          oldCategory.style.maxWidth = cs.maxWidth;
          oldCategory.style.paddingLeft = cs.paddingLeft;
          oldCategory.style.boxSizing = 'border-box';
        } catch (e) {
          // se qualcosa va storto, non interrompere l'apertura
        }
        oldCategory.style.display = 'block';
        buttonElement.classList.add('active');
      }
    });
  });
}

// ========================================
// CENTER I DATI SECTION
// ========================================

function centerDatiSection() {
  let datiLayout = document.querySelector('#i-dati .two-column-layout');
  if (datiLayout) {
    let layoutHeight = datiLayout.offsetHeight;
    let windowHeight = window.innerHeight;
    let layoutWidth = datiLayout.offsetWidth;
    let windowWidth = window.innerWidth;
    
    let topOffset = (windowHeight - layoutHeight) / 2;
    let leftOffset = (windowWidth - layoutWidth) / 2;
    
    datiLayout.style.marginTop = topOffset + 'px';
    datiLayout.style.marginLeft = leftOffset + 'px';
  }
}

// ========================================
// CENTER CATEGORIE SECTION
// ========================================

function centerCategorieSection() {
  let categorieLayout = document.querySelector('#categorie .categorie-layout');
  if (categorieLayout) {
    let layoutHeight = categorieLayout.offsetHeight;
    let windowHeight = window.innerHeight;
    let layoutWidth = categorieLayout.offsetWidth;
    let windowWidth = window.innerWidth;
    
    let topOffset = (windowHeight - layoutHeight) / 2;
    let leftOffset = (windowWidth - layoutWidth) / 2;
    
    categorieLayout.style.marginTop = topOffset + 'px';
    categorieLayout.style.marginLeft = leftOffset + 'px';
  }
}

// ========================================
// CARICAMENTO DATI CSV
// ========================================

function loadCSVData() {
  // Carica il CSV e calcola i valori giornalieri
  loadTable('../Assets/Datasets/Incidenti-totale.csv', 'csv', 'header', (table) => {
    for (let i = 0; i < table.getRowCount(); i++) {
      let classe = table.getString(i, 'Classe').trim();
      if (classe === 'Totale') {
        let incidentiTotali = parseInt(table.getString(i, 'Incidenti').replace(/[\s.]/g, ''));
        let mortiTotali = parseInt(table.getString(i, 'Morti').replace(/[\s.]/g, ''));
        let feritiTotali = parseInt(table.getString(i, 'Feriti').replace(/[\s.]/g, ''));
        
        incidentiOggi = Math.floor(incidentiTotali / 366);
        mortiOggi = Math.floor(mortiTotali / 366);
        feritiOggi = Math.floor(feritiTotali / 366);
        
        // Avvia l'aggiornamento in tempo reale
        startRealtimeCounter();
        break;
      }
    }
  });
}

function startRealtimeCounter() {
  // Aggiungi fade in del counter dopo un breve delay
  setTimeout(() => {
    const navbarCounter = document.getElementById('navbar-counter');
    if (navbarCounter) {
      navbarCounter.classList.add('visible');
    }
  }, 50);
  
  // Aggiornamento in tempo reale del counter
  function updateCounter() {
    let now = new Date();
    let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let secondiTotali = 24 * 3600;
    let progress = secondiOggi / secondiTotali;
    
    let currentIncidenti = Math.floor(incidentiOggi * progress);
    let currentMorti = Math.floor(mortiOggi * progress);
    let currentFeriti = Math.floor(feritiOggi * progress);
    
    // Aggiorna il counter nella navbar
    updateNavbarCounterValues(currentIncidenti, currentMorti, currentFeriti);
    updateCounterTooltip();
    
    requestAnimationFrame(updateCounter);
  }
  
  updateCounter();
}

function updateNavbarCounterValues(incidenti, morti, feriti) {
  document.getElementById('nav-incidenti').textContent = incidenti;
  document.getElementById('nav-morti').textContent = morti;
  document.getElementById('nav-feriti').textContent = feriti;
}

function updateCounterTooltip() {
  let tooltip = document.getElementById('counter-tooltip');
  if (!tooltip) return;
  
  let now = new Date();
  let giorno = String(now.getDate()).padStart(2, '0');
  let mese = String(now.getMonth() + 1).padStart(2, '0');
  let ore = String(now.getHours()).padStart(2, '0');
  let minuti = String(now.getMinutes()).padStart(2, '0');
  
  tooltip.innerHTML = `Statistiche medie<br>del ${giorno}/${mese}/2024<br>alle ore ${ore}:${minuti}`;
  
  // Aggiorna anche il countdown
  updateCounterCountdown();
}

function updateCounterCountdown() {
  let countdown = document.getElementById('counter-countdown');
  if (!countdown) return;
  
  let now = new Date();
  let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let secondiTotali = 24 * 3600;
  let progress = secondiOggi / secondiTotali;
  
  let targetIncidenti = incidentiOggi * progress;
  let targetMorti = mortiOggi * progress;
  let targetFeriti = feritiOggi * progress;
  
  let currentIncidenti = Math.floor(targetIncidenti);
  let currentMorti = Math.floor(targetMorti);
  let currentFeriti = Math.floor(targetFeriti);
  
  let progressForNextIncidente = (currentIncidenti + 1) / incidentiOggi;
  let progressForNextMorto = (currentMorti + 1) / mortiOggi;
  let progressForNextFerito = (currentFeriti + 1) / feritiOggi;
  
  let secondsForNextIncidente = progressForNextIncidente * secondiTotali;
  let secondsForNextMorto = progressForNextMorto * secondiTotali;
  let secondsForNextFerito = progressForNextFerito * secondiTotali;
  
  let secondsUntilIncidente = secondsForNextIncidente - secondiOggi;
  let secondsUntilMorto = secondsForNextMorto - secondiOggi;
  let secondsUntilFerito = secondsForNextFerito - secondiOggi;
  
  let secondsToNextChange = Math.min(
    secondsUntilIncidente > 0 ? secondsUntilIncidente : Infinity,
    secondsUntilMorto > 0 ? secondsUntilMorto : Infinity,
    secondsUntilFerito > 0 ? secondsUntilFerito : Infinity
  );
  
  let secondsDisplay = Math.ceil(secondsToNextChange);
  
  // Rileva quando il countdown ricomincia (secondi aumentano)
  if (secondsDisplay > previousSecondsDisplay) {
    maxSecondsForColor = secondsDisplay;
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
  let colorProgress = maxSecondsForColor > 0 ? secondsDisplay / maxSecondsForColor : 0;
  
  // Colori: bianco (255,255,255) → arancione var(--orange) #ec6613 (236,102,19)
  let r = Math.round(255 * colorProgress + 236 * (1 - colorProgress));
  let g = Math.round(255 * colorProgress + 102 * (1 - colorProgress));
  let b = Math.round(255 * colorProgress + 19 * (1 - colorProgress));
  
  if (secondsDisplay > 0 && secondsDisplay < Infinity) {
    countdown.innerHTML = `Prossimo<br>aggiornamento<br>tra <span style="color: rgb(${r}, ${g}, ${b})">${secondsDisplay}</span> secondi`;
  } else {
    countdown.innerHTML = `Aggiornamento<br>in corso...`;
  }
}

// ========================================
// FUNZIONI SCROLL CON CHECKPOINT
// ========================================

function draw() {
  clear();
  handleAutoScroll();
  updateSectionVisibility();
  updateSectionOpacity();
  updateArrowsVisibility();
  drawDebugInfo();
}

function handleAutoScroll() {
  if (scrollTarget > -1) {
    isScrolling = true;
    
    let currentVelocita = scrollVelocita;
    
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

function updateSectionVisibility() {
  let sezioneTestoEl = document.getElementById('i-dati');
  let sezioneCategorieEl = document.getElementById('categorie');
  
  if (!sezioneTestoEl || !sezioneCategorieEl) return;
  
  // Entrambe le sezioni sono sempre display: block per permettere il fade
  sezioneTestoEl.style.display = 'block';
  sezioneCategorieEl.style.display = 'block';
}

function updateSectionOpacity() {
  let sezioneTestoEl = document.getElementById('i-dati');
  let sezioneCategorieEl = document.getElementById('categorie');
  
  if (!sezioneTestoEl || !sezioneCategorieEl) return;
  
  let opacitaSez1 = 1;
  let opacitaSez2 = 0;
  
  // Fade out sezione 1: da scroll 0 a 300
  if (scrollY >= 0 && scrollY <= 300) {
    opacitaSez1 = map(scrollY, 0, 300, 1, 0);
    opacitaSez2 = 0;
  }
  // Fade in sezione 2: da scroll 300 a 600
  else if (scrollY > 300 && scrollY <= 600) {
    opacitaSez1 = 0;
    opacitaSez2 = map(scrollY, 300, 600, 0, 1);
  }
  // Dopo 600: sezione 2 completamente visibile
  else if (scrollY > 600) {
    opacitaSez1 = 0;
    opacitaSez2 = 1;
  }
  
  // Applica le opacità
  sezioneTestoEl.style.opacity = opacitaSez1;
  sezioneCategorieEl.style.opacity = opacitaSez2;
  
  // Gestisci pointer-events per evitare interazioni con elementi invisibili
  sezioneTestoEl.style.pointerEvents = opacitaSez1 > 0.1 ? 'auto' : 'none';
  sezioneCategorieEl.style.pointerEvents = opacitaSez2 > 0.1 ? 'auto' : 'none';
}

function setupScrollArrows() {
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
  
  // Aggiorna visibilità frecce dopo il setup
  updateArrowsVisibility();
}

function setupKeyboardNavigation() {
  document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
      // Vai al checkpoint precedente
      if (currentCheckpointIndex > 0) {
        currentCheckpointIndex--;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
        scrollAccumulator = 0;
      }
    } else if (event.key === 'ArrowDown') {
      // Vai al prossimo checkpoint
      if (currentCheckpointIndex < scrollCheckpoints.length - 1) {
        currentCheckpointIndex++;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
        scrollAccumulator = 0;
      }
    }
  });
}

function updateArrowsVisibility() {
  let scrollArrowDown = document.getElementById('scroll-arrow-down');
  let scrollArrowUp = document.getElementById('scroll-arrow-up');
  let arrowsContainer = document.querySelector('.scroll-arrows-container');
  
  let upVisible = false;
  let downVisible = false;
  
  // Freccia giù: visibile solo se non sei all'ultimo checkpoint
  if (scrollArrowDown) {
    if (currentCheckpointIndex >= scrollCheckpoints.length - 1) {
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
  
  // Freccia su: visibile solo se non sei al primo checkpoint
  if (scrollArrowUp) {
    if (currentCheckpointIndex <= 0) {
      scrollArrowUp.style.opacity = '0';
      scrollArrowUp.style.pointerEvents = 'none';
    } else {
      scrollArrowUp.style.opacity = '1';
      scrollArrowUp.style.pointerEvents = 'all';
      upVisible = true;
    }
    
    // Freccia su: bordo sempre bianco, freccia interna arancione quando è da sola all'ultimo checkpoint
    scrollArrowUp.style.borderColor = 'rgb(239, 239, 239)';
    let upSvgPath = scrollArrowUp.querySelector('svg path');
    if (upSvgPath) {
      // Se è all'ultimo checkpoint e la freccia giù non è visibile, diventa arancione
      if (currentCheckpointIndex === scrollCheckpoints.length - 1 && !downVisible) {
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

function drawDebugInfo() {
  push();
  textFont('Courier');
  textAlign(RIGHT, BOTTOM);
  textSize(14);
  fill(255, 165, 0, 150); // Colore arancione con opacità
  text('scrollY: ' + floor(scrollY), width - 10, height - 10);
  pop();
}

// ========================================
// WINDOW RESIZE
// ========================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerDatiSection();
  centerCategorieSection();
}

