//========= Counter per la pagina Chi Siamo ==========

// Valori counter - calcolati dai dati ISTAT
let incidentiOggi = 0;
let mortiOggi = 0;
let feritiOggi = 0;
let animIncidenti = 0;
let animMorti = 0;
let animFeriti = 0;

// Setup
document.addEventListener('DOMContentLoaded', function() {
  // Nascondi le frecce di navigazione
  const arrowContainer1 = document.getElementById('arrow-container-1');
  const arrowContainer2 = document.getElementById('arrow-container-2');
  
  if (arrowContainer1) {
    arrowContainer1.style.display = 'none';
  }
  if (arrowContainer2) {
    arrowContainer2.style.display = 'none';
  }
  
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
