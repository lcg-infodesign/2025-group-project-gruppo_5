//========= Counter per la pagina Chi Siamo ==========

// Helper functions (come p5.js)
function abs(n) { return Math.abs(n); }
function floor(n) { return Math.floor(n); }

// Valori counter - calcolati dai dati ISTAT
let incidentiOggi = 0;
let mortiOggi = 0;
let feritiOggi = 0;
let animIncidenti = 0;
let animMorti = 0;
let animFeriti = 0;

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

// Setup
document.addEventListener('DOMContentLoaded', function() {
  
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
  
  // Avvia il loop di aggiornamento
  startAnimationLoop();
  
  // Carica i dati dal CSV per calcolare i valori giornalieri
  loadCSVData();
  
  // Variabili per tracciare il countdown
  let previousSecondsDisplay = -1;
  let maxSecondsForColor = 60;

    fetch('../Assets/Datasets/Incidenti-totale.csv')
      .then(response => response.text())
      .then(data => {
        const lines = data.split('\n');
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          if (row[0] && row[0].trim() === 'Totale') {
            const incidentiTotali = parseInt(row[1].replace(/[\s.]/g, '').trim());
            const mortiTotali = parseInt(row[3].replace(/[\s.]/g, '').trim());
            const feritiTotali = parseInt(row[4].replace(/[\s.]/g, '').trim());
            
            incidentiOggi = Math.floor(incidentiTotali / 366);
            mortiOggi = Math.floor(mortiTotali / 366);
            feritiOggi = Math.floor(feritiTotali / 366);
            
            console.log('Dati caricati:', {
              incidentiTotali,
              mortiTotali,
              feritiTotali,
              incidentiOggi,
              mortiOggi,
              feritiOggi
            });
            break;
          }
        }
        // Avvia l'animazione del counter
        startCounterAnimation();
      })
      .catch(error => {
        console.error('Errore caricamento CSV:', error);
        // Usa valori di fallback
        incidentiOggi = 460;
        mortiOggi = 8;
        feritiOggi = 627;
        startCounterAnimation();
      });
  }
  
  function startCounterAnimation() {
    // Aggiungi fade in del counter dopo un breve delay
    setTimeout(() => {
      const navbarCounter = document.getElementById('navbar-counter');
      if (navbarCounter) {
        navbarCounter.classList.add('visible');
      }
    }, 50);
    
    // Aggiornamento in tempo reale senza animazione
    function updateCounter() {
      let now = new Date();
      let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      let secondiTotali = 24 * 3600;
      let progress = secondiOggi / secondiTotali;
      
      let targetIncidenti = incidentiOggi * progress;
      let targetMorti = mortiOggi * progress;
      let targetFeriti = feritiOggi * progress;
      
      // Imposta direttamente i valori senza animazione
      animIncidenti = targetIncidenti;
      animMorti = targetMorti;
      animFeriti = targetFeriti;
      
      updateNavbarCounter();
      
      requestAnimationFrame(updateCounter);
    }
    
    updateCounter();
  }
  
  function updateNavbarCounter() {
    document.getElementById('nav-incidenti').textContent = Math.floor(animIncidenti);
    document.getElementById('nav-morti').textContent = Math.floor(animMorti);
    document.getElementById('nav-feriti').textContent = Math.floor(animFeriti);
    
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
});

// ========================================
// FUNZIONE DI GESTIONE SCROLL MOUSE
// ========================================

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

window.addEventListener('wheel', mouseWheel, { passive: false });

// ========================================
// LOOP DI ANIMAZIONE (simile a draw() in p5.js)
// ========================================

function startAnimationLoop() {
  function animate() {
    // Gestione scroll automatico
    handleAutoScroll();
    
    // Aggiorna visibilità frecce (come updateNavbarHTML in sketch.js)
    updateArrowsVisibility();
    
    // Debug info
    drawDebugInfo();
    
    // Continua il loop
    requestAnimationFrame(animate);
  }
  
  animate();
}

// ========================================
// GESTIONE SCROLL AUTOMATICO
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
      scrollVelocita = 8;
      
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
  
  // Applica le opacità alle sezioni basate su scrollY
  let sezioneChiSiamo = document.getElementById('chi-siamo');
  let sezioneFooter = document.querySelectorAll('.sezione-dati')[1];
  
  if (sezioneChiSiamo && sezioneFooter) {
    let opacitaSez1 = 1;
    let opacitaSez2 = 0;
    
    // Fade out sezione 1: da scroll 0 a 250 (più veloce di dati.js che usa 0-300)
    if (scrollY >= 0 && scrollY <= 250) {
      opacitaSez1 = map(scrollY, 0, 250, 1, 0);
      opacitaSez2 = 0;
    }
    // Fade in sezione 2: da scroll 250 a 550 (più veloce di dati.js che usa 300-600)
    else if (scrollY > 250 && scrollY <= 550) {
      opacitaSez1 = 0;
      opacitaSez2 = map(scrollY, 250, 550, 0, 1);
    }
    // Dopo 550: sezione 2 completamente visibile
    else if (scrollY > 550) {
      opacitaSez1 = 0;
      opacitaSez2 = 1;
    }
    
    // Applica le opacità
    sezioneChiSiamo.style.opacity = opacitaSez1;
    sezioneFooter.style.opacity = opacitaSez2;
    
    // Gestisci pointer-events per evitare interazioni con elementi invisibili
    sezioneChiSiamo.style.pointerEvents = opacitaSez1 > 0.1 ? 'auto' : 'none';
    sezioneFooter.style.pointerEvents = opacitaSez2 > 0.1 ? 'auto' : 'none';
  }
}

// Helper function map (come p5.js)
function map(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// ========================================
// DEBUG INFO
// ========================================

function drawDebugInfo() {
  let debugDiv = document.getElementById('debug-info');
  if (!debugDiv) {
    debugDiv = document.createElement('div');
    debugDiv.id = 'debug-info';
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '10px';
    debugDiv.style.right = '10px';
    debugDiv.style.color = 'rgba(236, 102, 19, 0.59)';
    debugDiv.style.fontFamily = 'Courier, monospace';
    debugDiv.style.fontSize = '14px';
    debugDiv.style.zIndex = '10000';
    debugDiv.style.textAlign = 'right';
    document.body.appendChild(debugDiv);
  }
  
  debugDiv.textContent = `scrollY: ${floor(scrollY)}`;
}

// ========================================
// AGGIORNA VISIBILITÀ FRECCE (come in updateNavbarHTML di sketch.js)
// ========================================

function updateArrowsVisibility() {
  let scrollArrowUp = document.getElementById('scroll-arrow-up');
  let scrollArrowDown = document.getElementById('scroll-arrow-down');
  let arrowsContainer = document.querySelector('.scroll-arrows-container');
  
  let upVisible = false;
  let downVisible = false;
  
  // Freccia giù: nascondi quando sei a 600 (scrollY >= 600) o oltre
  if (scrollArrowDown) {
    if (scrollY >= 600) {
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
      let orangeColor = getComputedStyle(document.documentElement).getPropertyValue('--orange').trim();
      downSvgPath.setAttribute('stroke', orangeColor);
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
  
  // Freccia su: nascondi quando sei al primo checkpoint o quando scrollY supera 600
  if (scrollArrowUp) {
    if (currentCheckpointIndex <= 0 || scrollY > 600) {
      scrollArrowUp.style.opacity = '0';
      scrollArrowUp.style.pointerEvents = 'none';
    } else {
      scrollArrowUp.style.opacity = '1';
      scrollArrowUp.style.pointerEvents = 'all';
      upVisible = true;
    }
    
    // Freccia su: bordo sempre bianco, freccia interna bianca (arancione solo a 600 quando è da sola)
    scrollArrowUp.style.borderColor = 'rgb(239, 239, 239)';
    let upSvgPath = scrollArrowUp.querySelector('svg path');
    if (upSvgPath) {
      // Se è a scroll 600 e la freccia giù non è visibile, diventa arancione
      if (currentCheckpointIndex === 1 && !downVisible) {
        let orangeColor = getComputedStyle(document.documentElement).getPropertyValue('--orange').trim();
        upSvgPath.setAttribute('stroke', orangeColor);
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
      arrowsContainer.style.transform = `translateX(calc(-50% + ${window.innerWidth * 0.0115}px))`;
    } else if (downVisible) {
      // Solo freccia giù: offset per centrare la singola (22px @ 1920px)
      arrowsContainer.style.transform = `translateX(calc(-50% - ${window.innerWidth * 0.0115}px))`;
    }
  }
}
