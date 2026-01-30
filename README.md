Repository del progetto:  
https://lcg-infodesign.github.io/2025-group-project-gruppo_5/index.html


INDICE

1. autori e licenza di utilizzo  
2. obiettivi di conoscenza  
3. dati utilizzati e rielaborazione  
4. componenti del gruppo e divisione del lavoro  
5. scelte progettuali a supporto degli obiettivi di conoscenza  
6. utilizzo di strumenti di intelligenza artificiale  


AUTORI E LICENZA DI UTILIZZO

Laboratorio di Computer Grafica per l'Information Design
A.A. 2025/2026
Laurea Triennale in Design della Comunicazione
[logo polimi]

Progetto a cura di
Barbetta Giorgia
Dell’Oro Letizia
Fontana Marta
Golinelli Luca
Rosa Giacom
Sabbatini Viola

© CC-BY 4.0 Gli autori / The authors
[ENG] Except where otherwise noted, all content on this website is licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0). You are free to share and adapt the material, including for commercial use, provided appropriate credit is given.
[ITA] Salvo diversa indicazione, tutti i contenuti di questo sito web sono concessi in licenza Creative Commons Attribution 4.0 International (CC BY 4.0). Sei libero di condividere e adattare il materiale, anche per scopi commerciali, a condizione di menzionare i creatori come autori originali dell'opera.


Docenti
Michele Mauri
Davide Conficconi

Cultori della Materia
Alessandra Facchin
Alessandro Nazzari

[logo DensityDesign]
[logo NECTS]


OBIETTIVI DI CONOSCENZA

Comprendere la rilevanza del problema degli incidenti stradali in Italia, evidenziata dall’alto numero di casi e di persone coinvolte ogni anno.
Prendere consapevolezza che rischio e sicurezza stradale derivano da una corresponsabilità complessiva che coinvolge tutte le categorie presenti sulla strada.
Identificare i diversi comportamenti e fattori pericolosi, da parte di conducenti, pedoni e condizioni esterne, che aumentano la probabilità di incidenti stradali.
Prendere consapevolezza che ogni comportamento pericoloso o fattore di rischio può generare un numero significativo di feriti e di vittime (soggetti lesi), producendo conseguenze irreversibili.


DATI UTILIZZATI E RIELABORAZIONE

DATI UTILIZZATI

I dati utilizzati provengono dal dataset istat/aci relativo agli incidenti stradali avvenuti in italia nell’anno solare 2024.

La rilevazione raccoglie l’insieme degli incidenti stradali verbalizzati da un’autorità di polizia, avvenuti su strade aperte alla pubblica circolazione e che hanno causato lesioni alle persone. 
Si tratta di una rilevazione statistica di interesse pubblico, finalizzata a supportare enti nazionali e locali nella definizione di politiche di prevenzione e sicurezza stradale.

Il progetto prende in esame esclusivamente l’anno 2024 e si concentra sulle circostanze dell’incidente e sulle conseguenze alle persone, distinguendo tra feriti e morti (al momento dell’incidente o entro 30 giorni dall’evento).

I dati originali sono organizzati in più cartelle tematiche e analizzati secondo diverse dimensioni (localizzazione, caratteristiche della strada, segnaletica, condizioni meteorologiche, natura dell’incidente, veicoli coinvolti, conseguenze e circostanze). Per il progetto è stato selezionato il sottoinsieme ritenuto coerente con gli obiettivi di conoscenza.

Per la realizzazione del sito è stata utilizzata la tavola 2.13 del dataset istat, escludendo la suddivisione per tipologia di strada.


RIELABORAZIONE DEI DATI

I dati sono stati rielaborati per renderli più leggibili e confrontabili in relazione alla struttura narrativa e visiva del progetto.

Il lavoro ha previsto la selezione delle variabili rilevanti, la pulizia e semplificazione delle categorie testuali e l’accorpamento di alcune circostanze in categorie più generiche, quando necessario per garantire chiarezza interpretativa e coerenza visiva.

Le circostanze degli incidenti sono state quindi riorganizzate in tre macro-categorie di responsabilità:
- Conducenti;
- Non conducenti;
- Cause esterne e concomitanti.

Questa riorganizzazione consente una lettura coerente del fenomeno a più livelli:
visione d’insieme, suddivisione per responsabilità e analisi di dettaglio delle singole circostanze.

La riclassificazione completa delle categorie è consultabile nella pagina “i dati” del sito:
https://lcg-infodesign.github.io/2025-group-project-gruppo_5/pages/dati.html





COMPONENTI DEL GRUPPO E DIVISIONE DEL LAVORO

Il progetto è stato sviluppato attraverso un lavoro collettivo e iterativo.  
tutti i membri del gruppo hanno contribuito in modo equilibrato alla progettazione concettuale, alla definizione delle soluzioni visive, all’analisi dei dati, allo sviluppo del codice e alla revisione continua del progetto.

le attività sono state distribuite per fasi, mantenendo responsabilità condivise e un confronto costante all’interno del gruppo.

- Barbetta Giorgia
  Progettazione visiva dell’interfaccia e delle visualizzazioni.  
  Sviluppo del codice front-end a supporto delle soluzioni visive.  
  Prototipazione delle schermate e delle interazioni in Figma.

- Dell’Oro Letizia
  Progettazione concettuale e visiva del progetto.  
  Sviluppo del codice front-end. 
  Prototipazione delle schermate e delle interazioni in Figma.
  
- Fontana Marta
  Progettazione visiva delle visualizzazioni e dei layout.  
  Sviluppo del codice front-end.  
  Supporto alla definizione e all’allineamento degli obiettivi di conoscenza.

- Golinelli Luca
  Sviluppo del codice e implementazione delle interazioni.  
  Realizzazione delle animazioni e delle transizioni tra le visualizzazioni.  
  Attività di debug, ottimizzazione e revisione generale del progetto.

- Rosa Giacomo 
  Analisi esplorativa dei dati e supporto alla selezione delle variabili rilevanti.  
  Contributo alla definizione delle soluzioni visive in relazione ai dati.  
  Verifica della coerenza tra dati, visualizzazioni e obiettivi di conoscenza.

- Sabbatini Viola
  Analisi, riordino e categorizzazione dei dataset.  
  Supporto alla rielaborazione dei dati in funzione delle visualizzazioni.  
  Sviluppo del codice e integrazione dei dati nel progetto.





SCELTE PROGETTUALI A SUPPORTO DEGLI OBIETTIVI DI CONOSCENZA

Le scelte progettuali sono state guidate dalla volontà di superare una semplice presentazione statistica del fenomeno degli incidenti stradali, costruendo una narrazione visiva capace di rendere percepibile la reale ampiezza, complessità e gravità del problema. Le strategie visive e di codice adottate sono state pensate in relazione diretta agli obiettivi di conoscenza definiti all’inizio del progetto.

OBIETTIVO 1 – COMPRENDERE LA RILEVANZA DEL PROBLEMA DEGLI INCIDENTI STRADALI IN ITALIA

Per rendere evidente l’elevato numero di incidenti stradali e di persone coinvolte
ogni anno, il progetto prende avvio da una visualizzazione d’insieme basata su una
griglia modulare di quadrati, in cui ogni elemento rappresenta un incidente.

Questa scelta visiva consente di percepire immediatamente la scala del fenomeno,
superando la distanza tra la percezione comune e la reale dimensione del problema.
L’utilizzo dello scrollytelling permette inoltre una lettura progressiva e guidata dei dati, accompagnando l’utente nella comprensione dell’ampiezza complessiva del fenomeno.

A supporto di questa strategia è stato integrato un counter aggiornato in tempo reale, che mostra il numero medio di incidenti, morti e feriti nel corso della giornata. Il counter rende percepibile la continuità del fenomeno e la rapidità con cui i numeri crescono, rafforzando la consapevolezza della gravità del problema.


OBIETTIVO 2 – PRENDERE CONSAPEVOLEZZA DELLA CORRESPONSABILITÀ NELLA SICUREZZA STRADALE

Per mostrare che il rischio stradale non dipende da un’unica categoria di soggetti, la visualizzazione d’insieme viene riorganizzata in una vista intermedia basata su tre macro-categorie di responsabilità: conducenti, utenti non conducenti e cause esterne e concomitanti.

Questa aggregazione consente di visualizzare come gli incidenti siano il risultato di una corresponsabilità complessiva che coinvolge più attori e fattori. La scelta di mantenere visivamente l’unità di partenza (i quadrati) rafforza l’idea che tutte le categorie contribuiscono allo stesso fenomeno, pur in misura diversa.


OBIETTIVO 3 – IDENTIFICARE COMPORTAMENTI E FATTORI PERICOLOSI CHE AUMENTANO IL RISCHIO DI INCIDENTE

Per permettere l’identificazione delle diverse circostanze che portano agli incidenti, è stata progettata una visualizzazione di dettaglio che scompone le macro-categorie in sottocategorie specifiche.

Ogni circostanza viene rappresentata mantenendo la relazione con il numero di incidenti, consentendo il confronto tra comportamenti diversi di conducenti, non conducenti e condizioni esterne. Questa scelta permette di rendere leggibili anche fattori meno evidenti, che spesso vengono sottovalutati nella percezione comune del rischio stradale.


OBIETTIVO 4 – PRENDERE CONSAPEVOLEZZA DELL’IMPATTO IN TERMINI DI FERITI E VITTIME

Per evidenziare le conseguenze reali e spesso irreversibili di ogni comportamento pericoloso, la visualizzazione di dettaglio introduce una trasformazione visiva dal quadrato bidimensionale al parallelepipedo tridimensionale.

La tridimensionalità consente di integrare una terza variabile informativa: l’impatto in termini di soggetti lesi, distinguendo tra feriti e vittime. L’altezza (proporzionale al numero dei soggetti lesi) e l’opacità (proporzionale al numero di incidenti mortali) degli elementi permettono di confrontare situazioni molto diverse tra loro, nonostante la forte asimmetria numerica tra morti e feriti.

Questa scelta progettuale rende visibile come anche circostanze apparentemente meno frequenti possano generare conseguenze gravi sulla vita delle persone, rafforzando la consapevolezza dell’impatto umano del fenomeno.


NOTE SULLE SCELTE DI SINTESI E IMPLEMENTAZIONE

Il dataset utilizzato è molto ricco, ma strutturato per categorie aggregate e non per singolo incidente. Questo ha richiesto scelte selettive su quali informazioni raccontare e su come renderle visualizzabili in modo chiaro e immediato.

Le soluzioni adottate combinano strategie visive, trasformazioni geometriche e scelte di codice
orientate alla leggibilità, mantenendo un equilibrio tra rigore informativo, chiarezza comunicativa e impatto percettivo.






UTILIZZO DI STRUMENTI DI INTELLIGENZA ARTIFICIALE

Strumenti utilizzati:

- Chatgpt 
Utilizzato come supporto alla fase di organizzazione e analisi dei dati, brainstorming progettuale, definizione della narrazione e della struttura informativa del sito.

- Github copilot (visual studio code) 
Utilizzato come supporto alla scrittura del codice, alla correzione di errori sintattici e all’ottimizzazione di parti non funzionanti.


Ambiti di utilizzo:

- Animazioni di transizione dal quadrato bidimensionale al parallelepipedo tridimensionale;  
- Transizione dalla visualizzazione d'insieme a quella di dettaglio tramite scomposizione e ricomposizione geometrica.



In tutti i casi, l’uso dell’ai è stato integrativo e supervisionato, senza sostituire le decisioni progettuali del gruppo.

