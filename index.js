
async function test(){
  const get = fetch("http://localhost:8080/api/products", {
    "method" : 'GET',
  });

  console.log((await get));
  const get_result = (await get).json();
  console.log((await get_result));
}

test();

const ingredient_1 = document.createElement("p");
ingredient_1.innerHTML = `
  <div class= "ingredient-container" id="kaart">
      <div class="ingredient-foto-container">
        <img class="ingredient-foto" src="images/Placeholder.jpg">
        <!--Prijs en aantal-->
        <div class="prijs-en-aantal">
          <p class="prijs">4.<span class="prijs-cent">99</span></p>
          <p class="hoeveelheid">100g</p>
        </div>
        
      </div >
      <!--Bestelknop met titel-->
      <div class="bestel-knop-en-titel">
        <p>Wagyu</p>
        <!-- Bestel knop-->
        <div class="bestel-knop-container-small">
          <img src="Icons/Plus-icon.svg">
        </div>
      </div>
      <div class="uitklap-en-voorraad">
        <div class="uitklap-container">
          <img class="uitklap-icon" src="Icons/Expand-icon.svg">
        </div>
        <p class="voorraad">voorraad: <span>15</span></p>
      </div>

    </div>
`;
  document.body.appendChild(ingredient_1);
  let button = document.getElementById("button");
  console.log(button);
  button.onclick = function() {
    let ingredienten_kaart = document.getElementById("kaart")
    ingredienten_kaart.className="ingredient-container-uitgeklapt";  
    console.log("button clicked");
  };

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


