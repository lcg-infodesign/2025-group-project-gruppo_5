//========= creare una tendina che si apre al click con p5.js ==========

// Valori counter - calcolati dai dati ISTAT
let incidentiOggi = 0;
let mortiOggi = 0;
let feritiOggi = 0;

function setup() {
  noCanvas(); // Non serve canvas, usiamo solo p5 per le interazioni
  
  // Carica i dati e aggiorna il counter
  loadCSVData();
  
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
    updateNavbarCounter(currentIncidenti, currentMorti, currentFeriti);
    updateCounterTooltip();
    
    requestAnimationFrame(updateCounter);
  }
  
  updateCounter();
}

function updateNavbarCounter(incidenti, morti, feriti) {
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
  
  tooltip.innerHTML = `Statistiche medie del<br>${giorno}/${mese}/2024 alle ore ${ore}:${minuti}`;
}
