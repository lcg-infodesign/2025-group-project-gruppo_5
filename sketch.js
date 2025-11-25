// Prima pagina intro con p5
let lcdFont;
// Regroup animation variables
let animRegroupActive = false;
let animRegroupStartFrame = 0;
let animRegroupProgress = 0; // 0-1
let animRegroupTarget = 0; // 0 (griglia mischiata), 1 (gruppi ordinati)
let lastScrollY = 0;
let introCaratteriVisibili = 0; // quanti caratteri mostrare dell'intro
let introTestoCompleto = 'LA SITUAZIONE DEGLI INCIDENTI STRADALI\nIN ITALIA È PIÚ GRANDE DI CIÒ CHE PENSIAMO';
let sottotitoloOpacita = 0; // opacità del sottotitolo (0-255)
let scrollY = 0; // posizione dello scroll
let introOpacita = 255; // opacità della prima schermata (255 = visibile, 0 = invisibile)
let quadratoDimensione = 0; // dimensione del quadrato bianco che appare
let quadratoCaratteriVisibili = 0; // caratteri visibili del testo del quadrato
let quadratoTestoCompleto = 'QUESTO QUADRATO RAPPRESENTA\n300 INCIDENTI';
let quadratoFrecciaOpacita = 0; // opacità della freccia sotto al quadrato
let scrollTarget = -1; // target dello scroll automatico (-1 = nessuno scroll automatico)
let scrollVelocita = 15; // velocità dello scroll automatico
// Terza sezione: fade out quadrato + nuova scritta
let terzaSezioneTitoloOpacita = 0; // "MA SAI QUANTI SONO OGNI ANNO?"
let terzaSezioneSottotitoloOpacita = 0; // "Prova a scorrere..."
let terzaSezioneCaratteriVisibili = 0; // caratteri visibili del titolo terza sezione
let terzaSezioneTestoCompleto = 'MA SAI QUANTI SONO OGNI ANNO?';
// Quarta sezione: griglia di quadratini
let csvData;
let numeroTotaleQuadratini = 0;
let numeroTotaleIncidenti = 0;
let counterAttuale = 0; // il counter che sale da 0
// Quinta sezione: nuovo testo dopo griglia
let quintaSezioneCaratteriVisibili = 0;
let quintaSezioneTestoCompleto = 'E PER OGNI 300 INCIDENTI\n 790 LESIONATI';
let cuboRotazione = 0; // progressione animazione cubo (0-1)
let cuboAnimazioneAutomatica = false; // true quando l'animazione procede da sola
let cuboAnimazioneInizio = 0; // frame in cui inizia l'animazione automatica
// Variabili Sesta sezione: counter giornaliero
let incidentiOggi = 0; 
let mortiOggi = 0;     
let feritiOggi = 0;    
let animIncidenti = 0;
let animMorti = 0;
let animFeriti = 0;
let sestaSezioneOpacita = 0;
let counterScrollValue = 0;
let counterAnimazioneAutomatica = false;
let counterAnimazioneInizio = 0;

function preload() {
  // carica il font fornito
  lcdFont = loadFont('Assets/Fonts/LCD5x7VF.ttf');
  // carica il CSV
  csvData = loadTable('Assets/Datasets/Incidenti-totale.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(lcdFont);
  textAlign(CENTER, CENTER);
  
  // prendi i valori dalla riga Totale del CSV
  for (let i = 0; i < csvData.getRowCount(); i++) {
    let classe = csvData.getString(i, 'Classe').trim();
    if (classe === 'Totale') {
      numeroTotaleQuadratini = int(csvData.getString(i, 'I/300'));
      let incidentiStringa = csvData.getString(i, 'Incidenti').replace(/\s/g, '').replace(/\./g, '');
      numeroTotaleIncidenti = int(incidentiStringa);
      
      // prendi i valori giornalieri dalla riga 'Totale' del dataset
      let incidentiTotali = parseInt(csvData.getString(i, 'Incidenti').replace(/[\s.]/g, ''));
      let mortiTotali = parseInt(csvData.getString(i, 'Morti').replace(/[\s.]/g, ''));
      let feritiTotali = parseInt(csvData.getString(i, 'Feriti').replace(/[\s.]/g, ''));

      // Corretto: Assegna ai globali
      incidentiOggi = floor(incidentiTotali / 366);
      mortiOggi = floor(mortiTotali / 366);
      feritiOggi = floor(feritiTotali / 366);
      break;
    }
  }
  
  // rendi la pagina scrollabile
  document.body.style.height = '6000px';
  document.body.style.overflow = 'auto';
}

function mouseWheel(event) {
  // aggiorna scrollY quando l'utente scrolla
  scrollY += event.delta;
  scrollY = constrain(scrollY, 0, 6000); // limita lo scroll
  return false; // previene scroll di default
}

function draw() {
  background(0); // nero
  
  // gestisce lo scroll automatico
  if (scrollTarget > -1) {
    if (abs(scrollY - scrollTarget) > scrollVelocita) {
      // muovi verso il target
      if (scrollY < scrollTarget) {
        scrollY += scrollVelocita;
      } else {
        scrollY -= scrollVelocita;
      }
    } else {
      // raggiunto il target
      scrollY = scrollTarget;
      scrollTarget = -1; // ferma lo scroll automatico
    }
  }
  
  // calcola opacità intro e dimensione quadrato in base allo scroll
  if (scrollY > 50) {
    // fa scomparire l'intro
    introOpacita = map(scrollY, 50, 300, 255, 0);
    introOpacita = constrain(introOpacita, 0, 255);
    
    // fa crescere il quadrato
    quadratoDimensione = map(scrollY, 300, 600, 0, 200);
    quadratoDimensione = constrain(quadratoDimensione, 0, 200);
  }
  
  // calcola opacità navbar (appare insieme al quadrato)
  let navbarOpacita = map(scrollY, 300, 600, 0, 255);
  navbarOpacita = constrain(navbarOpacita, 0, 255);
  
  // disegna il testo intro con opacità variabile
  fill(255, 122, 0, introOpacita); // arancione con opacità
  
  // aumenta il numero di caratteri visibili ogni 2 frame (regola velocità)
  if (frameCount % 2 == 0 && introCaratteriVisibili < introTestoCompleto.length) {
    introCaratteriVisibili++;
  }
  
  // mostra solo i primi caratteri dell'intro
  let testoMostrato = introTestoCompleto.substring(0, introCaratteriVisibili);
  
  // calcola dimensione del testo
  let txtSize = width * 0.025;
  txtSize = constrain(txtSize, 12, 60);
  textSize(txtSize);
  textLeading(txtSize * 1.4); // aumenta interlinea (1.4 volte la dimensione del testo)
  
  // disegna il testo centrato
  text(testoMostrato, width / 2, height / 2);
  
  // quando l'animazione principale finisce, fai apparire il sottotitolo
  if (introCaratteriVisibili >= introTestoCompleto.length && sottotitoloOpacita < 255) {
    sottotitoloOpacita += 1; // aumenta opacità gradualmente
  }
  
  // disegna il sottotitolo in basso con Helvetica
  if (sottotitoloOpacita > 0) {
    push();
    textFont('Helvetica');
    textSize(16);
    // usa il minimo tra sottotitoloOpacita e introOpacita per fade out
    fill(255, 255, 255, min(sottotitoloOpacita, introOpacita)); // bianco con opacità variabile
    text('Scoprila analizzando i dati ISTAT del 2024', width / 2, height - 70);
    
    // disegna freccia triangolare sotto al sottotitolo con oscillazione
    let oscillazione = sin(frameCount * 0.05) * 5; // movimento su e giù
    let frecciaY = height - 45 + oscillazione;
    fill(255, 255, 255, min(sottotitoloOpacita, introOpacita));
    triangle(
      width / 2, frecciaY + 10,        // punta in basso (centro)
      width / 2 - 8, frecciaY,         // angolo sinistro
      width / 2 + 8, frecciaY          // angolo destro
    );
    pop();
  }
  
  // disegna la navbar in alto
  if (navbarOpacita > 0) {
    push();
    textFont('Helvetica');
    textSize(14);
    textAlign(CENTER, TOP);
    
    // calcola spaziatura tra i capitoli
    let spaziatura = width / 4;
    let startX = width / 4;

    // determina quale sezione è attiva in base allo scroll
    let sezioneAttiva = 0; // 0=Intro, 1=Incidenti, 2=Responsabilità
    if (scrollY < 1600) sezioneAttiva = 0;
    else if (scrollY < 4300) sezioneAttiva = 1;
    else sezioneAttiva = 2;

    // disegna i capitoli con colore diverso se attivi
    fill(sezioneAttiva == 0 ? color(255, 122, 0, navbarOpacita) : color(255, 255, 255, navbarOpacita));
    text('Intro', startX, 20);

    fill(sezioneAttiva == 1 ? color(255, 122, 0, navbarOpacita) : color(255, 255, 255, navbarOpacita));
    text('Incidenti', startX + spaziatura, 20);

    fill(sezioneAttiva == 2 ? color(255, 122, 0, navbarOpacita) : color(255, 255, 255, navbarOpacita));
    text('Responsabilità', startX + spaziatura * 2, 20);
    pop();
  }
  
  // calcola opacità per fade out del quadrato e testo quando scrolli oltre
  let quadratoFadeOut = 255;
  if (scrollY > 900) {
    quadratoFadeOut = map(scrollY, 900, 1000, 255, 0);
    quadratoFadeOut = constrain(quadratoFadeOut, 0, 255);
  }
  
  // disegna il quadrato bianco che cresce dal centro (con fade out)
  if (quadratoDimensione > 0) {
    push();
    rectMode(CENTER);
    fill(255, 255, 255, quadratoFadeOut); // bianco con opacità
    rect(width / 2, height / 2, quadratoDimensione, quadratoDimensione);
    pop();
  }
  
  // calcola opacità del testo del quadrato in base allo scroll
  let quadratoTestoOpacita = 0;
  if (quadratoDimensione >= 200) {
    // quando il quadrato è completo, il testo appare gradualmente
    quadratoTestoOpacita = map(scrollY, 600, 800, 0, 255);
    quadratoTestoOpacita = constrain(quadratoTestoOpacita, 0, 255);
    
    // aumenta caratteri visibili ogni 2 frame
    if (frameCount % 2 == 0 && quadratoCaratteriVisibili < quadratoTestoCompleto.length) {
      quadratoCaratteriVisibili++;
    }
  } else {
    // se scorri indietro e il quadrato si rimpicciolisce, riporta i caratteri a 0
    quadratoCaratteriVisibili = 0;
  }
  
  // disegna il testo sotto al quadrato con opacità (con fade out)
  if (quadratoCaratteriVisibili > 0 && quadratoTestoOpacita > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, TOP);
    let txtSize = width * 0.018;
    txtSize = constrain(txtSize, 12, 30);
    textSize(txtSize);
    textLeading(txtSize * 1.3);
    fill(255, 122, 0, min(quadratoTestoOpacita, quadratoFadeOut)); // arancione con fade out
    let testoMostrato = quadratoTestoCompleto.substring(0, quadratoCaratteriVisibili);
    text(testoMostrato, width / 2, height / 2 + quadratoDimensione / 2 + 20);
    pop();
  }
  
  // quando il testo del quadrato è completo, fai apparire la freccia
  if (quadratoCaratteriVisibili >= quadratoTestoCompleto.length && quadratoFrecciaOpacita < 255) {
    quadratoFrecciaOpacita += 3; // aumenta opacità gradualmente
  } else if (quadratoCaratteriVisibili < quadratoTestoCompleto.length) {
    quadratoFrecciaOpacita = 0; // reset se scorri indietro
  }
  
  // disegna la freccia in basso (stessa posizione della prima) con fade out
  if (quadratoFrecciaOpacita > 0) {
    push();
    let oscillazione = sin(frameCount * 0.05) * 5; // movimento su e giù
    let frecciaY = height - 45 + oscillazione;
    fill(255, 255, 255, min(quadratoFrecciaOpacita, quadratoTestoOpacita, quadratoFadeOut));
    triangle(
      width / 2, frecciaY + 10,        // punta in basso (centro)
      width / 2 - 8, frecciaY,         // angolo sinistro
      width / 2 + 8, frecciaY          // angolo destro
    );
    pop();
  }
  
  // TERZA SEZIONE: nuova scritta che appare quando quadrato scompare
  if (scrollY > 1100 && scrollY < 1300) {
    terzaSezioneTitoloOpacita = map(scrollY, 1100, 1300, 0, 255);
    terzaSezioneTitoloOpacita = constrain(terzaSezioneTitoloOpacita, 0, 255);
    
    // animazione scrittura carattere per carattere
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
  
  // calcola fade out per i testi della terza sezione
  let terzaSezioneFadeOut = 255;
  if (scrollY > 1500) {
    terzaSezioneFadeOut = map(scrollY, 1500, 1600, 255, 0);
    terzaSezioneFadeOut = constrain(terzaSezioneFadeOut, 0, 255);
  }
  
  // disegna il titolo della terza sezione con animazione carattere per carattere (con fade out)
  if (terzaSezioneCaratteriVisibili > 0 && terzaSezioneTitoloOpacita > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, CENTER);
    let txtSize = width * 0.03;
    txtSize = constrain(txtSize, 16, 70);
    textSize(txtSize);
    fill(255, 122, 0, min(terzaSezioneTitoloOpacita, terzaSezioneFadeOut)); // arancione con fade out
    let testoMostrato = terzaSezioneTestoCompleto.substring(0, terzaSezioneCaratteriVisibili);
    text(testoMostrato, width / 2, height / 2 - 30);
    pop();
  }
  if (scrollY > 1500) {
    terzaSezioneFadeOut = map(scrollY, 1500, 1600, 255, 0);
    terzaSezioneFadeOut = constrain(terzaSezioneFadeOut, 0, 255);
  }
  
  // usa il fade out anche per il sottotitolo
  // disegna il sottotitolo della terza sezione (con fade out)
  if (terzaSezioneSottotitoloOpacita > 0) {
    push();
    textFont('Helvetica');
    textAlign(CENTER, CENTER);
    textSize(16);
    fill(255, 255, 255, min(terzaSezioneSottotitoloOpacita, terzaSezioneFadeOut)); // bianco con fade out
    text('Prova a scorrere...', width / 2, height / 2 + 30);
    pop();
  }
  
  // QUARTA SEZIONE: counter e griglia di quadratini
  // calcola quanti quadratini mostrare in base allo scroll
  let numeroQuadratiniVisibili = 0;
  if (scrollY > 1600 && scrollY < 2800) {
    // il counter sale gradualmente verso il totale incidenti
    let progressione = map(scrollY, 1600, 2800, 0, numeroTotaleIncidenti);
    counterAttuale = floor(progressione);
    // i quadratini salgono verso il loro totale
    let progressioneQuadratini = map(scrollY, 1600, 2800, 0, numeroTotaleQuadratini);
    numeroQuadratiniVisibili = floor(progressioneQuadratini);
  } else if (scrollY >= 2800) {
    numeroQuadratiniVisibili = numeroTotaleQuadratini;
    counterAttuale = numeroTotaleIncidenti;
  } else {
    numeroQuadratiniVisibili = 0;
    counterAttuale = 0;
  }
  
  // calcola la griglia di quadratini prima per sapere dove posizionare il counter
  let dimensioneQuadratino = width * 0.008; // responsive in base alla larghezza
  dimensioneQuadratino = constrain(dimensioneQuadratino, 8, 15); // tra 8 e 15 px
  let spaziatura = dimensioneQuadratino * 0.5; // spaziatura proporzionale
  let quadratiniPerRiga = floor(width * 0.4 / (dimensioneQuadratino + spaziatura)); // 40% della larghezza
  quadratiniPerRiga = constrain(quadratiniPerRiga, 30, 60); // tra 30 e 60 quadratini per riga
  let numeroRighe = ceil(numeroTotaleQuadratini / quadratiniPerRiga);
  
  // calcola posizione centrata della griglia
  let larghezzaGriglia = quadratiniPerRiga * (dimensioneQuadratino + spaziatura);
  let altezzaGriglia = numeroRighe * (dimensioneQuadratino + spaziatura);
  let startX = (width - larghezzaGriglia) / 2;
  let startY = (height - altezzaGriglia) / 2; // centrata verticalmente
  
  // calcola fade out per griglia e counter
  let grigliaFadeOut = 255;
  if (scrollY > 2900) {
    grigliaFadeOut = map(scrollY, 2900, 3000, 255, 0);
    grigliaFadeOut = constrain(grigliaFadeOut, 0, 255);
  }
  
  // disegna il counter poco sopra la griglia (con fade out)
  if (counterAttuale > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, BOTTOM);
    let txtSize = width * 0.04;
    txtSize = constrain(txtSize, 20, 80);
    textSize(txtSize);
    fill(255, 122, 0, grigliaFadeOut); // arancione con fade out
    // formatta il numero con il punto delle migliaia
    let numeroFormattato = counterAttuale.toLocaleString('it-IT');
    text(numeroFormattato, width / 2, startY - 20); // 20px sopra la griglia
    pop();
  }
  
  // disegna la griglia di quadratini (con fade out)
  if (numeroQuadratiniVisibili > 0) {
    
    // disegna i quadratini
    push();
    fill(255, 255, 255, grigliaFadeOut); // bianco con fade out
    noStroke();
    
    for (let i = 0; i < numeroQuadratiniVisibili; i++) {
      let riga = floor(i / quadratiniPerRiga);
      let colonna = i % quadratiniPerRiga;
      
      // riempi in ordine da sinistra a destra, riga per riga
      let x = startX + colonna * (dimensioneQuadratino + spaziatura);
      let y = startY + riga * (dimensioneQuadratino + spaziatura);
      
      rect(x, y, dimensioneQuadratino, dimensioneQuadratino);
    }
    pop();
  }
  
  // QUINTA SEZIONE: nuovo testo dopo la griglia
  // opacità cubo appare subito dopo griglia (3000-3100)
  let quintaSezioneOpacita = 0;
  if (scrollY > 3000 && scrollY < 3100) {
    quintaSezioneOpacita = map(scrollY, 3000, 3100, 0, 255);
    quintaSezioneOpacita = constrain(quintaSezioneOpacita, 0, 255);
  } else if (scrollY >= 3100) {
    quintaSezioneOpacita = 255;
  }
  
  // animazione cubo - diventa automatica dopo scrollY 3150
  if (scrollY >= 3150 && !cuboAnimazioneAutomatica) {
    // attiva animazione automatica
    cuboAnimazioneAutomatica = true;
    cuboAnimazioneInizio = frameCount;
  } else if (scrollY < 3000) {
    // reset se torni indietro
    cuboAnimazioneAutomatica = false;
    cuboRotazione = 0;
  }
  
  if (cuboAnimazioneAutomatica) {
    // animazione automatica: 4 secondi = 240 frame a 60fps
    let framePassati = frameCount - cuboAnimazioneInizio;
    cuboRotazione = map(framePassati, 0, 240, 0, 1);
    cuboRotazione = constrain(cuboRotazione, 0, 1);
  } else if (scrollY > 3000 && scrollY < 3150) {
    // animazione manuale fino a scrollY 3150
    cuboRotazione = map(scrollY, 3000, 3150, 0, 0.02);
    cuboRotazione = constrain(cuboRotazione, 0, 0.02);
  }
  
  // testo parte da 3200 (200 pixel dopo cubo)
  if (scrollY > 3200 && scrollY < 3600) {
    // animazione scrittura carattere per carattere già con opacità piena
    if (frameCount % 2 === 0 && quintaSezioneCaratteriVisibili < quintaSezioneTestoCompleto.length) {
      quintaSezioneCaratteriVisibili++;
    }
  } else if (scrollY >= 3600) {
    quintaSezioneCaratteriVisibili = quintaSezioneTestoCompleto.length;
  } else {
    quintaSezioneCaratteriVisibili = 0;
  }
    

  
  // disegna il cubo (stile app.js: rotazione + schiacciamento + lati verticali)
  if (cuboRotazione > 0) {
    push();
    translate(width / 2, height / 2 + 80);
    
    let semilatoQuadrato = 100; // metà del lato del quadrato base
    
    // funzione per easing smooth (rallentamento finale)
    let easingRallentamento = (tempo) => 1 - pow(1 - tempo, 3);
    
    // FASI: 0-0.143 pausa (quadrato fermo 100px); 0.143-0.429 rotazione; 0.429-0.571 schiacciamento; 0.571-1.0 discesa lati
    let progressioneAnimazione = cuboRotazione;
    let angoloRotazione = lerp(0, PI/4, easingRallentamento(constrain((progressioneAnimazione - 0.143) / 0.286, 0, 1)));
    let fattoreSchiacciamento = lerp(1, 0.38, easingRallentamento(constrain((progressioneAnimazione - 0.429) / 0.142, 0, 1)));
    let altezzaLatiVerticali = lerp(0, semilatoQuadrato * 1.7, easingRallentamento(constrain((progressioneAnimazione - 0.571) / 0.429, 0, 1)));
    
    // punti base del quadrato
    let puntiBaseQuadrato = [
      {x: -semilatoQuadrato, y: -semilatoQuadrato}, {x: semilatoQuadrato, y: -semilatoQuadrato},
      {x: semilatoQuadrato, y: semilatoQuadrato}, {x: -semilatoQuadrato, y: semilatoQuadrato}
    ];
    
    // funzione per applicare rotazione + schiacciamento Y
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
    
    // Facce anteriori (le due che si toccano nello spigolo centrale)
    // Faccia anteriore sinistra: da puntoBassoSinistra a puntoBassoDestro (spigolo centrale)
    let facciaAnteriore1 = [
      {x: puntoBassoSinistra.x, y: puntoBassoSinistra.y},
      {x: puntoBassoDestro.x, y: puntoBassoDestro.y},
      {x: puntoBassoDestro.x, y: puntoBassoDestro.y + altezzaLatiVerticali},
      {x: puntoBassoSinistra.x, y: puntoBassoSinistra.y + altezzaLatiVerticali}
    ];
    
    // Faccia anteriore destra: da puntoBassoDestro a puntoAltoDestra
    let facciaAnteriore2 = [
      {x: puntoBassoDestro.x, y: puntoBassoDestro.y},
      {x: puntoAltoDestra.x, y: puntoAltoDestra.y},
      {x: puntoAltoDestra.x, y: puntoAltoDestra.y + altezzaLatiVerticali},
      {x: puntoBassoDestro.x, y: puntoBassoDestro.y + altezzaLatiVerticali}
    ];
    
    // calcola fade out quinta sezione per il cubo
    let quintaSezioneFadeOut = 255;
    if (scrollY > 3700) {
      quintaSezioneFadeOut = map(scrollY, 3700, 3800, 255, 0);
      quintaSezioneFadeOut = constrain(quintaSezioneFadeOut, 0, 255);
    }
    
    // Disegna le due facce anteriori arancioni con fade out - solo se ci sono lati verticali
    if (altezzaLatiVerticali > 0) {
      fill(255, 122, 0, quintaSezioneFadeOut); // arancione con fade out
      
      // Faccia anteriore sinistra
      quad(facciaAnteriore1[0].x, facciaAnteriore1[0].y, facciaAnteriore1[1].x, facciaAnteriore1[1].y, 
           facciaAnteriore1[2].x, facciaAnteriore1[2].y, facciaAnteriore1[3].x, facciaAnteriore1[3].y);
      
      // Faccia anteriore destra
      quad(facciaAnteriore2[0].x, facciaAnteriore2[0].y, facciaAnteriore2[1].x, facciaAnteriore2[1].y, 
           facciaAnteriore2[2].x, facciaAnteriore2[2].y, facciaAnteriore2[3].x, facciaAnteriore2[3].y);
    }
    
    // Top rombo bianco (sempre sopra) con fade out
    fill(255, 255, 255, min(quintaSezioneOpacita, quintaSezioneFadeOut));
    quad(puntoAltoSinistra.x, puntoAltoSinistra.y, puntoAltoDestra.x, puntoAltoDestra.y, puntoBassoDestro.x, puntoBassoDestro.y, puntoBassoSinistra.x, puntoBassoSinistra.y);
    
    pop();
  }
  
  // calcola fade out quinta sezione per il testo (stesso valore del cubo)
  let quintaSezioneFadeOutTesto = 255;
  if (scrollY > 3700) {
    quintaSezioneFadeOutTesto = map(scrollY, 3700, 3800, 255, 0);
    quintaSezioneFadeOutTesto = constrain(quintaSezioneFadeOutTesto, 0, 255);
  }
  
  // disegna il testo della quinta sezione (sopra al cubo) con fade out
  if (quintaSezioneCaratteriVisibili > 0 && quintaSezioneOpacita > 0) {
    push();
    textFont(lcdFont);
    textAlign(CENTER, CENTER);
    let txtSize = width * 0.03;
    txtSize = constrain(txtSize, 16, 70);
    textSize(txtSize);
    textLeading(txtSize * 1.4);
    fill(255, 122, 0, min(quintaSezioneOpacita, quintaSezioneFadeOutTesto)); // arancione con fade out
    let testoMostrato = quintaSezioneTestoCompleto.substring(0, quintaSezioneCaratteriVisibili);
    text(testoMostrato, width / 2, height / 2 - 120); // spostato più in alto
    pop();
  }
  

  // SESTA SEZIONE: counter giornaliero animato
  if (scrollY > 4100 && !counterAnimazioneAutomatica) {
    counterAnimazioneAutomatica = true;
    counterAnimazioneInizio = frameCount;
  } else if (scrollY < 4100) {
    counterAnimazioneAutomatica = false;
    animIncidenti = 0;
    animMorti = 0;
    animFeriti = 0;
  }

  // Fade-in sezione
  if (scrollY > 3900 && scrollY < 4100) {
    sestaSezioneOpacita = map(scrollY, 3900, 4100, 0, 255);
    sestaSezioneOpacita = constrain(sestaSezioneOpacita, 0, 255);
  } else if (scrollY >= 4100) {
    sestaSezioneOpacita = 255;
  } else {
    sestaSezioneOpacita = 0;
  }


// Counter legato all'orario attuale
if (counterAnimazioneAutomatica) {
  let now = new Date();
  let secondiOggi = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let secondiTotali = 24 * 3600;
  let progress = secondiOggi / secondiTotali;

  let targetIncidenti = incidentiOggi * progress;
  let targetMorti     = mortiOggi * progress;
  let targetFeriti    = feritiOggi * progress;

  // Smooth solo alla prima apparizione
  if (frameCount - counterAnimazioneInizio < 120) { // 2 secondi di animazione
    animIncidenti += (targetIncidenti - animIncidenti) * 0.1;
    animMorti     += (targetMorti - animMorti) * 0.1;
    animFeriti    += (targetFeriti - animFeriti) * 0.1;
  } else {
    animIncidenti = targetIncidenti;
    animMorti     = targetMorti;
    animFeriti    = targetFeriti;
  }
}
  


  // Fade out counter tra 4300 e 4600, fade in nuova sezione da 4600 a 4800
  let counterFadeOut = 255;
  let colpaFadeIn = 0;
  if (scrollY > 4300 && scrollY < 4600) {
    counterFadeOut = map(scrollY, 4300, 4600, 255, 0);
    counterFadeOut = constrain(counterFadeOut, 0, 255);
    colpaFadeIn = 0;
  } else if (scrollY >= 4600 && scrollY < 4800) {
    counterFadeOut = 0;
    colpaFadeIn = map(scrollY, 4600, 4800, 0, 255);
    colpaFadeIn = constrain(colpaFadeIn, 0, 255);
  } else if (scrollY >= 4800) {
    counterFadeOut = 0;
    colpaFadeIn = 255;
  } else {
    counterFadeOut = sestaSezioneOpacita;
    colpaFadeIn = 0;
  }

  // Disegno della sezione: counter fade out
  if (counterFadeOut > 0) {
    push();
    textAlign(CENTER, CENTER);
    textFont(lcdFont);

    // Testo introduttivo
    fill(255, 255, 255, counterFadeOut);
    textSize(width * 0.03);
    text("PENSA CHE SOLO OGGI:", width / 2, height * 0.3);

    // Numeri principali
    fill(255, 122, 0, counterFadeOut);
    textSize(width * 0.06);
    text(floor(animIncidenti), width * 0.25, height * 0.5);
    text(floor(animMorti),     width * 0.50, height * 0.5);
    text(floor(animFeriti),    width * 0.75, height * 0.5);

    // Etichette sotto i numeri
    textSize(width * 0.03);
    fill(255, 255, 255, counterFadeOut);
    text("INCIDENTI", width * 0.25, height * 0.7);
    text("MORTI",     width * 0.50, height * 0.7);
    text("FERITI",    width * 0.75, height * 0.7);
    pop();
  }


  // Fade out "MA DI CHI È LA COLPA?" tra 4900 e 5200
  let colpaFadeOut = 255;
  if (scrollY > 4900 && scrollY < 5200) {
    colpaFadeOut = map(scrollY, 4900, 5200, 255, 0);
    colpaFadeOut = constrain(colpaFadeOut, 0, 255);
  } else if (scrollY >= 5200) {
    colpaFadeOut = 0;
  } else {
    colpaFadeOut = colpaFadeIn;
  }
  // Mostra testo solo se fade out > 0
  if (colpaFadeOut > 0) {
    push();
    textAlign(CENTER, CENTER);
    textFont(lcdFont);
    textSize(width * 0.05);
    fill(255, 122, 0, colpaFadeOut);
    text("MA DI CHI È LA COLPA?", width / 2, height / 2);
    pop();
  }

  // Fade in griglia tra 5200 e 5400
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

  // Dati quadratini dal dataset (estrazione automatica)
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

  // Layout griglia
  // Usa le stesse dimensioni e spaziatura della prima griglia
  const quadPerRiga = quadratiniPerRiga;
  const quadSize = dimensioneQuadratino;
  const quadSpacing = spaziatura;
  let animProgress = 0;
  // Crea array colori quadratini mischiati una sola volta
  if (typeof window.coloriQuadratiniMischiati === 'undefined' || scrollY < 5200) {
    let arr = [];
    for (let i = 0; i < quadConducenti; i++) arr.push(coloreBlu);
    for (let i = 0; i < quadCauseEsterne; i++) arr.push(coloreVerde);
    for (let i = 0; i < quadNonConducenti; i++) arr.push(coloreRosa);
    // Shuffle array
    for (let i = arr.length - 1; i > 0; i--) {
      let j = floor(random() * (i + 1));
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    window.coloriQuadratiniMischiati = arr;
  }
  let coloriQuadratini = window.coloriQuadratiniMischiati;

  if (grigliaFadeIn > 0) {
    // Animazione: quadratini appaiono uno dopo l'altro
    animProgress = floor(map(grigliaFadeIn, 0, 255, 0, quadTotale));
    // Centra la griglia nello stesso spazio della prima
    let x0 = (width - quadPerRiga * (quadSize + quadSpacing)) / 2;
    let y0 = (height - numeroRighe * (quadSize + quadSpacing)) / 2 + 100; // abbassa di 100px
    rectMode(CORNER);

    // Calcola layout per 3 griglie compatte
    let groupSpacing = quadSize * 8;
    // Ogni gruppo: 15 colonne, griglia più orizzontale
    function getWideGridDims(count) {
      let cols = min(15, count);
      let rows = ceil(count / cols);
      return {cols, rows};
    }
    let blueDims = getWideGridDims(quadConducenti);
    let greenDims = getWideGridDims(quadCauseEsterne);
    let pinkDims = getWideGridDims(quadNonConducenti);

    // Calcola larghezza totale delle 3 griglie + spazi
    let totalWidth = blueDims.cols * (quadSize + quadSpacing) + groupSpacing + greenDims.cols * (quadSize + quadSpacing) + groupSpacing + pinkDims.cols * (quadSize + quadSpacing);
    let startX = (width - totalWidth) / 2;
    // Allinea la prima riga di tutte le griglie
    let topY = height / 2 - max(blueDims.rows, greenDims.rows, pinkDims.rows) * (quadSize + quadSpacing) / 2 + 100; // abbassa di 100px
    let blueStartY = topY;
    let greenStartY = topY;
    let pinkStartY = topY;

    // Calcola startX per ogni gruppo
    let blueStartX = startX;
    let greenStartX = blueStartX + blueDims.cols * (quadSize + quadSpacing) + groupSpacing;
    let pinkStartX = greenStartX + greenDims.cols * (quadSize + quadSpacing) + groupSpacing;

    // Indici per ciascun gruppo
    let blueIdx = 0, greenIdx = 0, pinkIdx = 0;
    for (let i = 0; i < quadTotale && i < animProgress; i++) {
      // Posizione iniziale (griglia mischiata)
      let r = floor(i / quadPerRiga);
      let c = i % quadPerRiga;
      let xStartGrid = x0 + c * (quadSize + quadSpacing);
      let yStartGrid = y0 + r * (quadSize + quadSpacing);

      // Destinazione: griglia ordinata per colore
      let fillCol = coloriQuadratini[i];
      let xDest, yDest;
      if (red(fillCol) === 0 && green(fillCol) === 161) {
        // Blu
        let row = floor(blueIdx / blueDims.cols);
        let col = blueIdx % blueDims.cols;
        xDest = blueStartX + col * (quadSize + quadSpacing);
        yDest = blueStartY + row * (quadSize + quadSpacing);
        blueIdx++;
      } else if (red(fillCol) === 51 && green(fillCol) === 187) {
        // Verde
        let row = floor(greenIdx / greenDims.cols);
        let col = greenIdx % greenDims.cols;
        xDest = greenStartX + col * (quadSize + quadSpacing);
        yDest = greenStartY + row * (quadSize + quadSpacing);
        greenIdx++;
      } else {
        // Rosa
        let row = floor(pinkIdx / pinkDims.cols);
        let col = pinkIdx % pinkDims.cols;
        xDest = pinkStartX + col * (quadSize + quadSpacing);
        yDest = pinkStartY + row * (quadSize + quadSpacing);
        pinkIdx++;
      }

      // Interpolazione animata
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
  
  // Smooth reverse animation for regroup
  // Detect scroll direction and set target
  if (scrollY > 5600) {
    animRegroupTarget = 1;
  } else {
    animRegroupTarget = 0;
  }
  // Animate progress towards target
  let speed = 0.07; // smoothness
  animRegroupProgress += (animRegroupTarget - animRegroupProgress) * speed;
  animRegroupProgress = constrain(animRegroupProgress, 0, 1);
  lastScrollY = scrollY;

  // DEBUG: mostra scrollY in basso a destra
  push();
  textFont('Courier');
  textAlign(RIGHT, BOTTOM);
  textSize(14);
  fill(255, 122, 0, 150); // arancione semi-trasparente
  text('scrollY: ' + floor(scrollY), width - 10, height - 10);
  pop();
}

function mouseClicked() {
  // posizione delle frecce
  let frecciaY = height - 45;
  let distanza = dist(mouseX, mouseY, width / 2, frecciaY);
  
  // se clicchi sulla freccia quando è visibile
  if (distanza < 20) {
    // prima freccia (intro) - visibile quando sottotitolo è visibile
    if (sottotitoloOpacita > 100 && quadratoFrecciaOpacita < 50) {
      scrollTarget = 800; // scroll verso la fine dell'animazione quadrato
    }
    // seconda freccia (quadrato) - visibile quando testo quadrato è completo
    else if (quadratoFrecciaOpacita > 100) {
      scrollTarget = 1400; // scroll verso la terza sezione (MA SAI QUANTI...)
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  document.body.style.height = (windowHeight * 3) + 'px';
}
