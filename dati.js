let categories = [];
let activeCategory = null;

function setup() {
  noCanvas(); // No need for a canvas since we're working with DOM elements

  // Select all elements with the class "newCategory"
  let newCategoryElements = selectAll(".newCategory");

  // Initialize categories
  newCategoryElements.forEach((element, index) => {
    let oldCategory = element.elt.nextElementSibling; // Get the next sibling element
    categories.push({ button: element, content: oldCategory, isVisible: false });

    // Add a mousePressed event to each button
    element.mousePressed(() => toggleCategory(index));

    console.log(newCategoryElements);
  });
}

function toggleCategory(index) {
  let category = categories[index];

  if (category.isVisible) {
    // Hide the content
    category.content.style.display = "none";
    category.button.removeClass("active");
  } else {
    // Show the content
    category.content.style.display = "block";
    category.button.addClass("active");
  }

  // Update visibility state
  category.isVisible = !category.isVisible;
}