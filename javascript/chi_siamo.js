//========= Counter e Navigazione per la pagina Chi Siamo (p5.js) ==========

// Valori counter - calcolati dai dati ISTAT
let incidentiOggi = 0;
let mortiOggi = 0;
let feritiOggi = 0;
let navbarCounterAttivato = false;

// Scroll
let scrollY = 0;
let scrollTarget = -1;
let scrollVelocita = 8;

// Scroll Snap - Checkpoint per sezioni
let scrollSnapEnabled = true;
let scrollCheckpoints = [
  0,      // Sezione 0: Chi Siamo
  600     // Sezione 1: Footer
];
let currentCheckpointIndex = 0;
let isScrolling = false;
let scrollAccumulator = 0;
let scrollThreshold = 100;

// Variabili per countdown
let previousSecondsDisplay = -1;
let maxSecondsForColor = 60;

// ========================================
// SETUP (p5.js)
// ========================================

function setup() {
  // Crea un canvas trasparente per il sistema di scroll
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '5');
  canvas.style('pointer-events', 'none');
  background(0, 0);
  
  // Carica i dati CSV
  loadCSVData();
  
  // Setup scroll arrows click handlers
  let scrollArrowDown = document.getElementById('scroll-arrow-down');
  if (scrollArrowDown) {
    scrollArrowDown.addEventListener('click', function() {
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
      if (currentCheckpointIndex > 0) {
        currentCheckpointIndex--;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
        scrollAccumulator = 0;
      }
    });
  }
  
  // Aggiungi listener per le frecce della tastiera
  document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
      if (currentCheckpointIndex > 0) {
        currentCheckpointIndex--;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
        scrollAccumulator = 0;
      }
    } else if (event.key === 'ArrowDown') {
      if (currentCheckpointIndex < scrollCheckpoints.length - 1) {
        currentCheckpointIndex++;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
        scrollAccumulator = 0;
      }
    }
  });
}

// ========================================
// DRAW (p5.js) - Loop principale
// ========================================

function draw() {
  clear();
  
  // Gestione scroll automatico (copiato da sketch.js)
  handleAutoScroll();
  
  // Aggiorna opacità delle sezioni
  updateSectionOpacity();
  
  // Aggiorna visibilità frecce (copiato da sketch.js)
  updateArrowsVisibility();
  
  // Debug info
  drawDebugInfo();
}

// ========================================
// MOUSE WHEEL (copiato da sketch.js)
// ========================================

function mouseWheel(event) {
  if (scrollTarget !== -1) {
    return false;
  }
  
  scrollAccumulator += event.delta;
  
  if (abs(scrollAccumulator) >= scrollThreshold) {
    if (scrollAccumulator > 0) {
      // Scroll in basso
      if (currentCheckpointIndex < scrollCheckpoints.length - 1) {
        currentCheckpointIndex++;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
      }
    } else {
      // Scroll in alto
      if (currentCheckpointIndex > 0) {
        currentCheckpointIndex--;
        scrollTarget = scrollCheckpoints[currentCheckpointIndex];
        isScrolling = true;
      }
    }
    scrollAccumulator = 0;
  }
  
  return false;
}

// ========================================
// HANDLE AUTO SCROLL (copiato da sketch.js)
// ========================================

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
      
      // Aggiorna il checkpoint corrente
      for (let i = 0; i < scrollCheckpoints.length; i++) {
        if (abs(scrollY - scrollCheckpoints[i]) < 5) {
          currentCheckpointIndex = i;
          break;
        }
      }
    }
  }
}

// ========================================
// UPDATE SECTION OPACITY
// ========================================

function updateSectionOpacity() {
  let chiSiamoSection = document.getElementById('chi-siamo');
  let footerSection = document.querySelectorAll('.sezione-dati')[1];
  
  if (chiSiamoSection && footerSection) {
    let opacitaSez1 = 1;
    let opacitaSez2 = 0;
    
    // Transizione smooth come richiesto (più veloce di dati.js)
    if (scrollY >= 0 && scrollY <= 250) {
      opacitaSez1 = map(scrollY, 0, 250, 1, 0);
      opacitaSez2 = 0;
    } else if (scrollY > 250 && scrollY <= 550) {
      opacitaSez1 = 0;
      opacitaSez2 = map(scrollY, 250, 550, 0, 1);
    } else if (scrollY < 0) {
      opacitaSez1 = 1;
      opacitaSez2 = 0;
    } else {
      opacitaSez1 = 0;
      opacitaSez2 = 1;
    }
    
    chiSiamoSection.style.opacity = opacitaSez1;
    footerSection.style.opacity = opacitaSez2;
  }
}

// ========================================
// UPDATE ARROWS VISIBILITY (copiato da sketch.js)
// ========================================

function updateArrowsVisibility() {
  let scrollArrowDown = document.getElementById('scroll-arrow-down');
  let scrollArrowUp = document.getElementById('scroll-arrow-up');
  let arrowsContainer = document.querySelector('.scroll-arrows-container');
  
  if (!scrollArrowDown || !scrollArrowUp || !arrowsContainer) return;
  
  let upVisible = false;
  let downVisible = false;
  
  // Freccia giù: visibile solo se non sei all'ultimo checkpoint
  if (currentCheckpointIndex >= scrollCheckpoints.length - 1) {
    scrollArrowDown.style.opacity = '0';
    scrollArrowDown.style.pointerEvents = 'none';
  } else {
    scrollArrowDown.style.opacity = '1';
    scrollArrowDown.style.pointerEvents = 'all';
    downVisible = true;
  }
  
  // Styling freccia DOWN
  scrollArrowDown.style.borderColor = 'rgb(239, 239, 239)';
  let downSvgPath = scrollArrowDown.querySelector('svg path');
  if (downSvgPath) {
    downSvgPath.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--orange').trim());
  }
  
  // Bounce animation al primo checkpoint
  if (currentCheckpointIndex === 0 && !isScrolling) {
    scrollArrowDown.classList.add('bounce-active');
    scrollArrowDown.classList.remove('allow-hover-movement');
  } else {
    scrollArrowDown.classList.remove('bounce-active');
    scrollArrowDown.classList.add('allow-hover-movement');
  }
  
  // Freccia SU (copiato da sketch.js)
  if (currentCheckpointIndex === 0) {
    // Nascondi freccia up al primo checkpoint
    scrollArrowUp.style.opacity = '0';
    scrollArrowUp.style.pointerEvents = 'none';
  } else {
    scrollArrowUp.style.opacity = '1';
    scrollArrowUp.style.pointerEvents = 'all';
    upVisible = true;
  }
  
  // Styling freccia UP
  scrollArrowUp.style.borderColor = 'rgb(239, 239, 239)';
  let upSvgPath = scrollArrowUp.querySelector('svg path');
  if (upSvgPath) {
    // Se siamo all'ultimo checkpoint (1) e la freccia up è l'unica visibile, diventa arancione
    if (currentCheckpointIndex === 1 && !downVisible) {
      upSvgPath.setAttribute('stroke', getComputedStyle(document.documentElement).getPropertyValue('--orange').trim());
    } else {
      upSvgPath.setAttribute('stroke', 'rgb(239, 239, 239)');
    }
  }
  
  scrollArrowUp.classList.remove('bounce-active');
  scrollArrowUp.classList.add('allow-hover-movement');
  
  // Centering del container (copiato da sketch.js)
  if (upVisible && downVisible) {
    arrowsContainer.style.transform = 'translateX(-50%)';
  } else if (upVisible) {
    arrowsContainer.style.transform = `translateX(calc(-50% + ${width * 0.0115}px))`;
  } else if (downVisible) {
    arrowsContainer.style.transform = `translateX(calc(-50% - ${width * 0.0115}px))`;
  }
}

// ========================================
// DRAW DEBUG INFO (p5.js text rendering)
// ========================================

function drawDebugInfo() {
  push();
  fill(236, 102, 19, 150);
  textFont('Courier');
  textSize(12);
  textAlign(RIGHT, BOTTOM);
  text('scrollY: ' + nf(scrollY, 0, 2), width - 10, height - 10);
  pop();
}

// ========================================
// WINDOW RESIZE
// ========================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ========================================
// CARICAMENTO DATI CSV
// ========================================

function loadCSVData() {
  loadTable('../Assets/Datasets/Incidenti-totale.csv', 'csv', 'header', (table) => {
    for (let i = 0; i < table.getRowCount(); i++) {
      let classe = table.getString(i, 'Classe').trim();
      if (classe === 'Totale') {
        let incidentiTotali = parseInt(table.getString(i, 'Incidenti').replace(/[\s.]/g, ''));
        let mortiTotali = parseInt(table.getString(i, 'Morti').replace(/[\s.]/g, ''));
        let feritiTotali = parseInt(table.getString(i, 'Feriti').replace(/[\s.]/g, ''));
        
        incidentiOggi = floor(incidentiTotali / 366);
        mortiOggi = floor(mortiTotali / 366);
        feritiOggi = floor(feritiTotali / 366);
        
        console.log('Dati caricati:', {
          incidentiTotali,
          mortiTotali,
          feritiTotali,
          incidentiOggi,
          mortiOggi,
          feritiOggi
        });
        
        // Avvia il counter
        startCounterAnimation();
        break;
      }
    }
  }, (error) => {
    console.error('Errore caricamento CSV:', error);
    // Usa valori di fallback
    incidentiOggi = 460;
    mortiOggi = 8;
    feritiOggi = 627;
    startCounterAnimation();
  });
}

function startCounterAnimation() {
  // Mostra il counter con fade-in
  setTimeout(() => {
    let navbarCounter = document.getElementById('navbar-counter');
    if (navbarCounter) {
      navbarCounter.classList.add('visible');
      navbarCounterAttivato = true;
    }
  }, 50);
  
  // Aggiornamento in tempo reale
  function updateCounter() {
    let now = new Date();
    let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let secondiTotali = 24 * 3600;
    let progress = secondiOggi / secondiTotali;
    
    let currentIncidenti = floor(incidentiOggi * progress);
    let currentMorti = floor(mortiOggi * progress);
    let currentFeriti = floor(feritiOggi * progress);
    
    // Aggiorna il counter nella navbar
    updateNavbarCounter(currentIncidenti, currentMorti, currentFeriti);
    
    requestAnimationFrame(updateCounter);
  }
  
  updateCounter();
}

function updateNavbarCounter(incidenti, morti, feriti) {
  document.getElementById('nav-incidenti').textContent = incidenti;
  document.getElementById('nav-morti').textContent = morti;
  document.getElementById('nav-feriti').textContent = feriti;
  
  updateCounterTooltip();
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
  
  updateCounterCountdown();
}

function updateCounterCountdown() {
  let countdown = document.getElementById('counter-countdown');
  if (!countdown) return;
  
  let now = new Date();
  let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let secondiTotali = 24 * 3600;
  let progress = secondiOggi / secondiTotali;
  
  let currentIncidenti = floor(incidentiOggi * progress);
  let currentMorti = floor(mortiOggi * progress);
  let currentFeriti = floor(feritiOggi * progress);
  
  let progressForNextIncidente = (currentIncidenti + 1) / incidentiOggi;
  let progressForNextMorto = (currentMorti + 1) / mortiOggi;
  let progressForNextFerito = (currentFeriti + 1) / feritiOggi;
  
  let secondsForNextIncidente = progressForNextIncidente * secondiTotali;
  let secondsForNextMorto = progressForNextMorto * secondiTotali;
  let secondsForNextFerito = progressForNextFerito * secondiTotali;
  
  let secondsUntilIncidente = secondsForNextIncidente - secondiOggi;
  let secondsUntilMorto = secondsForNextMorto - secondiOggi;
  let secondsUntilFerito = secondsForNextFerito - secondiOggi;
  
  let secondsToNextChange = min(
    secondsUntilIncidente > 0 ? secondsUntilIncidente : Infinity,
    secondsUntilMorto > 0 ? secondsUntilMorto : Infinity,
    secondsUntilFerito > 0 ? secondsUntilFerito : Infinity
  );
  
  let secondsDisplay = ceil(secondsToNextChange);
  
  // Rileva quando il countdown ricomincia
  if (secondsDisplay > previousSecondsDisplay) {
    maxSecondsForColor = secondsDisplay;
  }
  
  // Flash quando manca 1 secondo
  if (secondsDisplay === 1 && previousSecondsDisplay !== 1) {
    countdown.classList.add('flash');
    setTimeout(() => countdown.classList.remove('flash'), 200);
  }
  
  previousSecondsDisplay = secondsDisplay;
  
  // Calcola il colore progressivo da bianco ad arancione
  let colorProgress = maxSecondsForColor > 0 ? secondsDisplay / maxSecondsForColor : 0;
  
  // Colori: bianco (255,255,255) → arancione #ec6613 (236,102,19)
  let r = round(255 * colorProgress + 236 * (1 - colorProgress));
  let g = round(255 * colorProgress + 102 * (1 - colorProgress));
  let b = round(255 * colorProgress + 19 * (1 - colorProgress));
  
  if (secondsDisplay > 0 && secondsDisplay < Infinity) {
    countdown.innerHTML = `Prossimo<br>aggiornamento<br>tra <span style="color: rgb(${r}, ${g}, ${b})">${secondsDisplay}</span> secondi`;
  } else {
    countdown.innerHTML = `Aggiornamento<br>in corso...`;
  }
}
