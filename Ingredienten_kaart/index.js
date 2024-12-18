var fruits = [];

async function test(){
  const get = fetch("http://localhost:8080/api/categories/1", {
    "method" : 'GET',
  });

  console.log((await get));
  const get_result = (await get).json();
  var fruit = JSON.parse(JSON.stringify(await get_result));
  
  for (product of fruit){
    fruits.push(product);
    
  }
}

async function print_fruits(){
  await test();
  console.log(fruits[0])
  for (let i = 0; i < fruits.length; i++){
    let prijs = fruits[i].Price / 100;
    const ingredient_1 = document.createElement("div");
    ingredient_1.className = "ingredient-container";
    ingredient_1.innerHTML = `
      <div class="ingredient-foto-container">
        <img class="ingredient-foto" src="images/Placeholder.jpg">
        <!--Prijs en aantal-->
        <div class="prijs-en-aantal">
          <p class="prijs">${prijs | 0}.<span class="prijs-cent">${(prijs + "").split(".")[1]}</span></p>
          <p class="hoeveelheid">${fruits[i].Size}</p>
        </div>
        
      </div >
      <!--Bestelknop met titel-->
      <div class="bestel-knop-en-titel">
        <p>${fruits[i].Name}</p>
        <!-- Bestel knop-->
        <div class="bestel-knop-container-small">
          <img src="Icons/Plus-icon.svg">
        </div>
      </div>
      <div class="uitklap-en-voorraad" id="omschrijving-${i}">
        <div onclick()=uitklap(${i}) class="uitklap-container">
          <img class="uitklap-icon" src="Icons/Expand-icon.svg">
        </div>
        <p class="voorraad">voorraad: <span>${fruits[i].AmountInStock}</span></p>
      </div>
    `;
    document.body.appendChild(ingredient_1);
    const omschrijving = document.createElement("p");
    omschrijving.className = "omschrijving-ingredient"
    omschrijving.innerHTML = `Lorum ipsum Lorum ipsumLorum ipsumLorum ipsumLorum ipsumLorum ipsumLorum ipsumLorum ipsumLorum ipsumLorum ipsumLorum ipsumLorum ipsumLorum ipsum`
  
    document.getElementById(`omschrijving-${i}`).appendChild(omschrijving);
  }
}

print_fruits();

function uitklap(kaart_index){

}


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


