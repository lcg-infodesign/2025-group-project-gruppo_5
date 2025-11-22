// =======================
// Typewriter testo iniziale
// =======================
const typewriterText = document.getElementById("typewriter");
const fullText = typewriterText.textContent;
typewriterText.textContent = "";
let index = 0;

function typeWriter() {
  if (index < fullText.length) {
    typewriterText.textContent += fullText[index];
    index++;
    setTimeout(typeWriter, 50); // Velocità scrittura
  }
}
window.addEventListener("load", () => {
  typeWriter();
});

// =======================
// Scroll down freccia
// =======================
const scrollDown = document.getElementById("scrollDown");
scrollDown.addEventListener("click", () => {
  document.getElementById("incidenti").scrollIntoView({behavior: "smooth"});
});

// =======================
// Navbar evidenziazione
// =======================
const sections = document.querySelectorAll(".section");
const navItems = document.querySelectorAll("#navbar-left li");

function updateNavbar() {
  const scrollPos = window.scrollY + window.innerHeight / 2;
  sections.forEach((section, i) => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      navItems.forEach(item => item.classList.remove("active"));
      navItems[i].classList.add("active");
    }
  });
}

// =======================
// Scroll al click navbar
// =======================
navItems.forEach(item => {
  item.addEventListener("click", () => {
    const sectionId = item.getAttribute("data-section");
    const targetSection = document.getElementById(sectionId);
    if(targetSection){
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  });
});


window.addEventListener("scroll", updateNavbar);

// =======================
// Griglia quadratini animati (solo scroll verso il basso)
// =======================
const dotsContainer = document.getElementById("dots-container");
const introDots = document.getElementById("intro-dots");
const totalNumber = document.getElementById("total-number");

const rows = 17;
const cols = 30;
const totalDots = rows * cols;
let createdDots = 0;

// Pre-crea tutti i div della griglia
const dotsArray = [];
for(let i=0; i<totalDots; i++){
  const dot = document.createElement("div");
  dotsContainer.appendChild(dot);
  dotsArray.push(dot);
}

// Funzione per mostrare i quadratini gradualmente
let revealInterval;
let isAnimating = false;

function startRevealDots() {
  if (isAnimating || createdDots >= totalDots) return;
  isAnimating = true;

  revealInterval = setInterval(() => {
    if(createdDots >= totalDots) {
      clearInterval(revealInterval);
      introDots.classList.add("hidden");
      totalNumber.classList.remove("hidden");
      return;
    }
    dotsArray[createdDots].classList.add("visible");
    createdDots++;
  }, 20); // 50ms tra un quadratino e l'altro
}

// Controllo della direzione dello scroll
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const dotsSection = document.getElementById("responsabilita");
  const sectionTop = dotsSection.offsetTop;
  const sectionHeight = dotsSection.offsetHeight;
  const scrollY = window.scrollY + window.innerHeight;

  // Avvia l'animazione solo scroll verso il basso
  if (window.scrollY > lastScrollY && scrollY > sectionTop + sectionHeight * 0.1) {
    startRevealDots();
  }

  lastScrollY = window.scrollY;
});

const circlesContainer = document.getElementById("circles-container");
const totalCircles = 20; // numero di prova
let circlesCreated = 0;

for(let i=0; i<totalCircles; i++){
  const circle = document.createElement("div");
  circle.classList.add("circle");
  circlesContainer.appendChild(circle);
}

const allCircles = document.querySelectorAll("#circles-container .circle");

function revealCircles() {
  if(circlesCreated >= totalCircles) return;
  allCircles[circlesCreated].classList.add("visible");
  circlesCreated++;
}

window.addEventListener("scroll", () => {
  const section = document.getElementById("ogni-morto");
  const scrollY = window.scrollY + window.innerHeight;
  if(scrollY > section.offsetTop + section.offsetHeight * 0.2){
    revealCircles();
  }
});

// =======================
// Counter numeri animati
// =======================

const counters = document.querySelectorAll(".number");

function animateCounter(counter) {
  const target = +counter.getAttribute("data-target");
  let count = 0;
  const increment = target / 100; // velocità approssimativa
  const interval = setInterval(() => {
    count += increment;
    if(count >= target){
      count = target;
      clearInterval(interval);
    }
    counter.textContent = Math.floor(count);
  }, 20); // intervallo in ms
}

// trigger scroll per animazione
window.addEventListener("scroll", () => {
  const section = document.getElementById("solo-oggi");
  const scrollY = window.scrollY + window.innerHeight;
  if(scrollY > section.offsetTop + section.offsetHeight * 0.2){
    counters.forEach(c => {
      if(!c.classList.contains("animated")){
        c.classList.add("animated");
        animateCounter(c);
      }
    });
  }
});

// =======================
// Info button alert
// =======================

const infoBtn = document.getElementById("info-btn");
infoBtn.addEventListener("click", () => {
  alert("Questo counter mostra il totale aggiornato degli incidenti, morti e feriti.");
});

