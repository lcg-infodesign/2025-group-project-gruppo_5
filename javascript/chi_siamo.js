//========= Animazioni LED per le card del team con p5.js ==========

let sketches = [];
const initials = ['GB', 'LD', 'MF', 'VS', 'LG', 'GR'];

function setup() {
  noCanvas(); // Non serve canvas globale
  
  // Crea un'istanza p5 per ogni card
  for (let i = 1; i <= 6; i++) {
    let container = select(`#canvas-${i}`);
    if (container) {
      createCardSketch(container, initials[i - 1], i);
    }
  }
}

function createCardSketch(container, text, index) {
  let sketch = function(p) {
    let dots = [];
    let isHovered = false;
    
    p.setup = function() {
      let canvas = p.createCanvas(container.elt.offsetWidth, container.elt.offsetHeight);
      canvas.parent(container.elt);
      generateDots();
      
      // Hover listeners
      container.elt.parentElement.addEventListener('mouseenter', () => {
        isHovered = true;
      });
      
      container.elt.parentElement.addEventListener('mouseleave', () => {
        isHovered = false;
      });
    };
    
    function generateDots() {
      dots = [];
      p.textFont('Arial');
      p.textSize(32);
      p.textAlign(p.CENTER, p.CENTER);
      
      // Buffer per campionare i pixel del testo
      let buffer = p.createGraphics(p.width, p.height);
      buffer.background(0);
      buffer.fill(255);
      buffer.textFont('Arial');
      buffer.textSize(32);
      buffer.textAlign(buffer.CENTER, buffer.CENTER);
      buffer.text(text, buffer.width / 2, buffer.height / 2);
      buffer.loadPixels();
      
      // Crea punti LED dove c'è testo
      let spacing = 6;
      for (let x = 0; x < buffer.width; x += spacing) {
        for (let y = 0; y < buffer.height; y += spacing) {
          let index = (x + y * buffer.width) * 4;
          if (buffer.pixels[index] > 128) {
            dots.push({ x: x, y: y });
          }
        }
      }
    }
    
    p.draw = function() {
      p.background(0);
      
      for (let dot of dots) {
        // Animazione brightness
        let time = p.millis() * 0.001;
        let noise = p.noise(dot.x * 0.05, dot.y * 0.05, time * 0.5);
        let brightness = isHovered ? 1 : 0.7 + noise * 0.3;
        
        // Colore arancione con brightness
        p.fill(255 * brightness, 139 * brightness, 67 * brightness);
        p.noStroke();
        p.ellipse(dot.x, dot.y, 4, 4);
      }
    };
    
    p.windowResized = function() {
      p.resizeCanvas(container.elt.offsetWidth, container.elt.offsetHeight);
      generateDots();
    };
  };
  
  sketches.push(new p5(sketch));
}
