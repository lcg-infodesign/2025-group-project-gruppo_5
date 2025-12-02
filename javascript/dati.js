//========= creare una tendina che si apre al click ==========
// *paradossalmente per questa cosa è molto più facile farlo in js che in p5

document.addEventListener('DOMContentLoaded', function() {
         let newCategory = document.querySelectorAll(".newCategory"); //dico di riferirsi alla categoria nuova (nella pagina è l'elemento cerchiato in bianco)

         newCategory.forEach(i => { //ad ogni oggetto i
                  i.addEventListener('click', function() { //se clicco
                           let oldCategory = i.nextElementSibling; //let oldCat = l'elemento subito successivo (nxtElSib)
                           if (oldCategory.style.display === "block") { //se corrisponde alla stringa "block"
                                    oldCategory.style.display = "none"; //cambia in stringa "none" --> così me lo fa anche scomparire se riclicco
                                    i.classList.remove("active"); //rimuovi classe "active" x rotazione freccia
                           } else {
                                    oldCategory.style.display = "block"; //altrimenti metti in blokc
                                    i.classList.add("active"); //aggiunge "active" x rotazione freccia
                           }
                  });
         });
});

