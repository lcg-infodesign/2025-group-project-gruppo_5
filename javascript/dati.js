//========= creare una tendina che si apre al click con p5.js ==========

function setup() {
  noCanvas(); // Non serve canvas, usiamo solo p5 per le interazioni
  
  // Seleziona tutti i bottoni delle categorie usando p5
  let buttons = selectAll('.newCategory');
  
  // Per ogni bottone, aggiungi l'event listener con p5
  buttons.forEach(button => {
    button.mousePressed(() => {
      // Accedi all'elemento HTML nativo
      let buttonElement = button.elt;
      let oldCategory = buttonElement.nextElementSibling;
      
      if (oldCategory && oldCategory.classList.contains('oldCategory')) {
        if (oldCategory.style.display === "block") {
          oldCategory.style.display = "none";
          buttonElement.classList.remove("active");
        } else {
          oldCategory.style.display = "block";
          buttonElement.classList.add("active");
        }
      }
    });
  });
}

