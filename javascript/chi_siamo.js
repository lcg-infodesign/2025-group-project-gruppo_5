//========= Fade effect per la pagina Chi Siamo ==========

let currentScroll = 0;
let targetScroll = 0;
let isTransitioning = false;

// Valori counter - calcolati dai dati ISTAT
let incidentiOggi = 0;
let mortiOggi = 0;
let feritiOggi = 0;
let animIncidenti = 0;
let animMorti = 0;
let animFeriti = 0;

// Setup
document.addEventListener('DOMContentLoaded', function() {
  const section1 = document.getElementById('chi-siamo');
  const section2 = document.getElementById('team');
  const section3 = document.getElementById('crediti');
  const scrollArrow1 = document.getElementById('scroll-arrow-1');
  const scrollArrow2 = document.getElementById('scroll-arrow-2');
  const arrowContainer1 = document.getElementById('arrow-container-1');
  const arrowContainer2 = document.getElementById('arrow-container-2');
  
  // Crea debug scroll nello stesso stile del sito
  const debugDiv = document.createElement('div');
  debugDiv.id = 'scroll-debug';
  debugDiv.style.cssText = 'position: fixed; bottom: 10px; right: 10px; font-family: Courier, monospace; font-size: 14px; color: rgba(255, 122, 0, 0.6); z-index: 9999; text-align: right;';
  document.body.appendChild(debugDiv);
  
  // Carica i dati dal CSV per calcolare i valori giornalieri
  loadCSVData();
  
  // Imposta altezza body
  document.body.style.height = '300vh';
  document.body.style.overflow = 'auto';
  
  // Forza scroll a 0 all'inizio
  window.scrollTo(0, 0);
  currentScroll = 0;
  targetScroll = 0;
  
  // Inizialmente mostra solo la prima sezione
  section1.style.opacity = '1';
  section1.style.display = 'flex';
  section2.style.opacity = '0';
  section2.style.display = 'none';
  section3.style.opacity = '0';
  section3.style.display = 'none';
  
  // Gestisci visibilità frecce
  if (arrowContainer1) {
    arrowContainer1.style.display = 'flex';
    arrowContainer1.style.opacity = '1';
    arrowContainer1.style.pointerEvents = 'all';
  }
  if (arrowContainer2) {
    arrowContainer2.style.display = 'none';
    arrowContainer2.style.opacity = '0';
    arrowContainer2.style.pointerEvents = 'none';
  }
  
  // Listener per wheel/trackpad
  let scrollAccumulator = 0;
  window.addEventListener('wheel', function(e) {
    if (isTransitioning) return;
    
    scrollAccumulator += e.deltaY;
    
    // Sezione 1 -> 2
    if (scrollAccumulator > 100 && targetScroll === 0) {
      goToSection2();
      scrollAccumulator = 0;
    }
    // Sezione 2 -> 1
    else if (scrollAccumulator < -100 && targetScroll === window.innerHeight) {
      goToSection1();
      scrollAccumulator = 0;
    }
    // Sezione 2 -> 3
    else if (scrollAccumulator > 100 && targetScroll === window.innerHeight) {
      goToSection3();
      scrollAccumulator = 0;
    }
    // Sezione 3 -> 2
    else if (scrollAccumulator < -100 && targetScroll === window.innerHeight * 2) {
      goToSection2FromSection3();
      scrollAccumulator = 0;
    }
  }, { passive: true });
  
  // Click sulle frecce
  if (scrollArrow1) {
    scrollArrow1.addEventListener('click', function() {
      if (!isTransitioning) {
        goToSection2();
      }
    });
  }
  
  if (scrollArrow2) {
    scrollArrow2.addEventListener('click', function() {
      if (!isTransitioning) {
        goToSection3();
      }
    });
  }
  
  function loadCSVData() {
    // Carica il CSV e calcola i valori giornalieri
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
  
  function goToSection2() {
    isTransitioning = true;
    targetScroll = window.innerHeight;
    
    // Nascondi freccia 1 immediatamente
    if (arrowContainer1) {
      arrowContainer1.style.opacity = '0';
      arrowContainer1.style.pointerEvents = 'none';
    }
    
    // Fade out section 1
    section1.style.transition = 'opacity 0.6s ease';
    section1.style.opacity = '0';
    
    // Dopo fade out, nascondi section 1 e mostra section 2
    setTimeout(() => {
      section1.style.display = 'none';
      section2.style.display = 'flex';
      section2.style.opacity = '0';
      
      // Mostra freccia 2 subito
      if (arrowContainer2) {
        arrowContainer2.style.display = 'flex';
        arrowContainer2.style.opacity = '1';
        arrowContainer2.style.pointerEvents = 'all';
      }
      
      // Fade in section 2
      setTimeout(() => {
        section2.style.transition = 'opacity 0.6s ease';
        section2.style.opacity = '1';
        
        setTimeout(() => {
          isTransitioning = false;
        }, 600);
      }, 50);
    }, 600);
    
    window.scrollTo(0, window.innerHeight);
    currentScroll = window.innerHeight;
  }
  
  function goToSection1() {
    isTransitioning = true;
    targetScroll = 0;
    
    // Nascondi freccia 2 immediatamente
    if (arrowContainer2) {
      arrowContainer2.style.opacity = '0';
      arrowContainer2.style.pointerEvents = 'none';
    }
    
    // Fade out section 2
    section2.style.transition = 'opacity 0.6s ease';
    section2.style.opacity = '0';
    
    // Dopo fade out, nascondi section 2 e mostra section 1
    setTimeout(() => {
      section2.style.display = 'none';
      section1.style.display = 'flex';
      section1.style.opacity = '0';
      
      // Mostra freccia 1 subito
      if (arrowContainer1) {
        arrowContainer1.style.display = 'flex';
        arrowContainer1.style.opacity = '1';
        arrowContainer1.style.pointerEvents = 'all';
      }
      
      // Fade in section 1
      setTimeout(() => {
        section1.style.transition = 'opacity 0.6s ease';
        section1.style.opacity = '1';
        
        setTimeout(() => {
          isTransitioning = false;
        }, 600);
      }, 50);
    }, 600);
    
    window.scrollTo(0, 0);
    currentScroll = 0;
  }
  
  function goToSection3() {
    isTransitioning = true;
    targetScroll = window.innerHeight * 2;
    
    // Nascondi freccia 2 immediatamente
    if (arrowContainer2) {
      arrowContainer2.style.opacity = '0';
      arrowContainer2.style.pointerEvents = 'none';
    }
    
    // Fade out section 2
    section2.style.transition = 'opacity 0.6s ease';
    section2.style.opacity = '0';
    
    // Dopo fade out, nascondi section 2 e mostra section 3
    setTimeout(() => {
      section2.style.display = 'none';
      section3.style.display = 'flex';
      section3.style.opacity = '0';
      
      // Fade in section 3
      setTimeout(() => {
        section3.style.transition = 'opacity 0.6s ease';
        section3.style.opacity = '1';
        
        setTimeout(() => {
          isTransitioning = false;
        }, 600);
      }, 50);
    }, 600);
    
    window.scrollTo(0, window.innerHeight * 2);
    currentScroll = window.innerHeight * 2;
  }
  
  function goToSection2FromSection3() {
    isTransitioning = true;
    targetScroll = window.innerHeight;
    
    // Fade out section 3
    section3.style.transition = 'opacity 0.6s ease';
    section3.style.opacity = '0';
    
    // Dopo fade out, nascondi section 3 e mostra section 2
    setTimeout(() => {
      section3.style.display = 'none';
      section2.style.display = 'flex';
      section2.style.opacity = '0';
      
      // Mostra freccia 2 subito
      if (arrowContainer2) {
        arrowContainer2.style.display = 'flex';
        arrowContainer2.style.opacity = '1';
        arrowContainer2.style.pointerEvents = 'all';
      }
      
      // Fade in section 2
      setTimeout(() => {
        section2.style.transition = 'opacity 0.6s ease';
        section2.style.opacity = '1';
        
        setTimeout(() => {
          isTransitioning = false;
        }, 600);
      }, 50);
    }, 600);
    
    window.scrollTo(0, window.innerHeight);
    currentScroll = window.innerHeight;
  }
  
  function startCounterAnimation() {
    // Aggiornamento in tempo reale come in sketch.js
    function updateCounter() {
      let now = new Date();
      let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      let secondiTotali = 24 * 3600;
      let progress = secondiOggi / secondiTotali;
      
      let targetIncidenti = incidentiOggi * progress;
      let targetMorti = mortiOggi * progress;
      let targetFeriti = feritiOggi * progress;
      
      // Animazione smooth verso i valori target
      animIncidenti += (targetIncidenti - animIncidenti) * 0.03;
      animMorti += (targetMorti - animMorti) * 0.03;
      animFeriti += (targetFeriti - animFeriti) * 0.03;
      
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
    
    tooltip.innerHTML = `Statistiche medie del<br>${giorno}/${mese}/2024 alle ore ${ore}:${minuti}`;
  }
  
  function updateDebug() {
    debugDiv.textContent = `scrollY: ${Math.floor(currentScroll)}`;
  }
  
  // Animation loop
  function animate() {
    updateDebug();
    requestAnimationFrame(animate);
  }
  
  animate();
});
