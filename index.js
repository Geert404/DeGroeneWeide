/*
const sheet = CSSStyleSheet();

class ingredientKaart extends HTMLElement {
  constructor(){
    super();

    const shadowRoot = this.attachShadow({mode: 'open'});
    let h2 = document.createElement("h2");
    h2.classList.add("Titel");
    h2.part.add("Titel")
    h2.textContent = "Helooooooooooo";
    shadowRoot.appendChild(h2);
  }
}

customElements.define("ingredient-kaart", ingredientKaart);
*/

const parentdiv = document.getElementById("parent");

/*
window.onload = function() {
  const ingredient_1 = document.createElement("p");
  ingredient_1.innerHTML = `
    <div class= "ingredient-container">
          <img class="ingredient-foto" src="images/Placeholder.jpg">
          <!--Bestelknop met titel-->
          <div class="bestel-knop-en-titel">
            <p>Wagyu</p>
            <!-- Bestel knop-->
            <div class="bestel-knop-container-small">
              <img class="knop-icon-small" src="Icons/Plus-icon.svg">
            </div>
          </div>
          <!--Prijs en aantal-->
          <div>
            <p class="prijs">4.<span class="prijs-cent">99</span></p>
          </div>
        </div>
  `;
  document.body.appendChild(ingredient_1)
}

*/
customElements.define(
  "ingredient-kaart",
  class extends HTMLElement {
    constructor() {
      super();
      let template = document.getElementById("ingredient-kaart");
      let templateContent = template.content;

      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(templateContent.cloneNode(true));
    }
  },
);
