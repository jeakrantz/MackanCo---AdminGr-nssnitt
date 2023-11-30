"use strict";

/* // Hämta api lokalt, ändra länkarna och API-nyckel.
let foodurl = "Länk till food_api.php";
let drinkurl = "Länk till drink_api.php";
let takeawayurl = "Länk till takeaway_api.php";
let userurl = "Länk till login_api.php";
let presentationurl = "Länk till presentation_api.php";
let reviewurl = "Länk till reviews_api.php";
 */

/* let apikey = "APIKEY här"; */

window.onload = init;

//Hämtar information från APIer vid laddning av sidan
function init() {
    getFood();
    getDrink();
    getOrder();
    getText();
    getReview();
}

/* INLOGGNING */

//Variabler lagrar information från inloggningsformulär
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginmessageEl = document.getElementById("loginmessage");

function getUser(e) {
    e.preventDefault();

    fetch(userurl, {
        headers: {
            "X-API-KEY": apikey
        }

    })
        .then(response => {
            if (response.status != 200) {
                return
            }
            return response.json()
                .then(data => loginUser(data))
                .catch(err => console.log(err))
        })
}

function loginUser(user) {

    //Kontroll att användarnamn inte är tomt
    if (usernameInput.value === "") {
        loginmessageEl.innerHTML = `<p class="bad">Skriv in ett användarnamn</p>`;
        return;
    }

    user.forEach(u => {
        //Kontroll att användarnamnet finns i databasen
        if (usernameInput.value === u.username) {
            
            //Kontroll att lösenord inte är tomt
            if (passwordInput.value === "") {
                loginmessageEl.innerHTML = `<p class="bad">Skriv in ett lösenord</p>`;
                return;
            }

            //Kontroll att lösenordet finns i databasen
            if (passwordInput.value === u.password) {
                //Om både användarnamn och lösenord finns i databasen lagras användarnamnet i sessions-variabel
                sessionStorage.setItem("username", usernameInput.value);

                window.location.href = "index.html";
                clearLoginForm();
            } else {
                loginmessageEl.innerHTML = `<p class="bad">Fel lösenord</p>`;
                return;
            }
        } else {
            loginmessageEl.innerHTML = `<p class="bad">Fel användarnamn</p>`;
            return;
        }

    });

}

function clearLoginForm() {
    usernameInput.value = "";
    passwordInput.value = "";
}

function logoutUser() {
    sessionStorage.clear();
}

/* MATRÄTTER */

//Variabler för data från formulär 
const foodnameInput = document.getElementById("foodnameForm");
const foodpriceInput = document.getElementById("foodpriceForm");
const ingredientsInput = document.getElementById("ingredientsForm");
const foodFormEl = document.getElementById("foodForm");
const foodmessageEl = document.getElementById('foodmessage');
const addmessageEl = document.getElementById('addmessage');

// Hämta maträtter från api
function getFood() {

    fetch(foodurl, {
        headers: {
            "X-API-KEY": apikey
        }

    })
        .then(response => {
            if (response.status != 200) {
                return
            }
            return response.json()
                .then(data => writeFood(data))
                .catch(err => console.log(err))
        })
}

//Skriv ut maträtter i tabellen
function writeFood(food) {
    const foodmenuEl = document.getElementById('food-menu');
    foodmenuEl.innerHTML = "";

    food.forEach(food => {
        foodmenuEl.innerHTML += `<div class="menu-article"><div class="menu-piece">
        <h4>Namn: <div id="foodname${food.id}" contenteditable> ${food.name}</div></h4>
        <h4>Pris: <div id="foodprice${food.id}" contenteditable>${food.price}</div>:-</h4>
        </div>
        <p>Ingredienser: <div id="ingredients${food.id}" contenteditable> ${food.ingredients}</div></p>
        </div>
        <div class="btn-container">
        <button class="btn good foodEdit" data-id="${food.id}">Ändra</button>
        <button class="btn bad foodDelete delete" data-id="${food.id}">Radera</button>
        </div>`
    });

    // Funktionalitet för uppdatera- och radera-knappen
    let fDelEl = document.getElementsByClassName('foodDelete');
    let fEditEl = document.getElementsByClassName('foodEdit');

    for (let i = 0; i < fDelEl.length; i++) {
        fDelEl[i].addEventListener("click", deleteFood);
        fEditEl[i].addEventListener("click", updateFood);
    }
}

// Ta bort maträtter från api
function deleteFood(e) {
    let id = e.target.dataset.id;

    fetch(foodurl + "?id=" + id,
        {
            method: "DELETE",
            headers: {
                "X-API-KEY": apikey,
            }
        })
        .then(response => response.json())
        .then(data => getFood())
        .catch(err => console.log(err))

    foodmessageEl.innerHTML = `<p class="bad">Maträtten är borttagen.</p>`;
}



// Lägg till maträtter i api
function updateFood(e) {
    e.preventDefault();

    // Data från formulär
    let id = e.target.dataset.id;
    let foodname = document.getElementById("foodname" + id).innerHTML;
    let foodprice = document.getElementById("foodprice" + id).innerHTML;
    let ingredients = document.getElementById("ingredients" + id).innerHTML;

    let jsonStr = JSON.stringify({
        id: id,
        name: foodname,
        price: foodprice,
        ingredients: ingredients
    });

    fetch(foodurl, {
        method: "put",
        headers: {
            "X-API-KEY": apikey,
            "content-type": "application/json"
        },
        body: jsonStr
    })
        .then(response => response.json())
        .then(data => {
            console.log("Uppdaterad");
            getFood();
        })
        .catch(err => console.log(err))

    foodmessageEl.innerHTML = `<p class="good">Maträtten är uppdaterad.</p>`;
}

// Lägg till maträtter i api
function createFood(e) {
    foodmessageEl.innerHTML = "";
    drinkmessageEl.innerHTML = "";

    console.log(foodnameInput);
    e.preventDefault();

    // Data från formulär
    let foodname = foodnameInput.value;
    let foodprice = foodpriceInput.value;
    let ingredients = ingredientsInput.value;

    if (foodname.length < 2) {
        addmessageEl.innerHTML = `<p class="bad">Skicka med namn på maträtten. Minst två tecken.</p>`
        return;
    }

    if (foodprice === "") {
        addmessageEl.innerHTML = `<p class="bad">Skicka med pris på maträtten.</p>`
        return;
    }

    if (ingredients.length < 5) {
        addmessageEl.innerHTML = `<p class="bad">Skicka med ingredienser. Minst fem tecken.</p>`
        return;
    }

    let jsonStr = JSON.stringify({
        name: foodname,
        price: foodprice,
        ingredients: ingredients
    });

    fetch(foodurl, {
        method: "post",
        headers: {
            "X-API-KEY": apikey,
            "content-type": "application/json"
        },
        body: jsonStr
    })
        .then(response => response.json())
        .then(data => clearFoodForm())
        .catch(err => console.log(err))

    addmessageEl.innerHTML = `<p class="good">Maträtten är tillagd!</p>`
}


// Töm formuläret efter maträtter lagts till
function clearFoodForm() {
    foodnameInput.value = "";
    foodpriceInput.value = "";
    ingredientsInput.value = "";

    getFood();
}


/* DRINKAR */

//Variabler för data från formulär 
const drinknameInput = document.getElementById("drinkname");
const drinkpriceInput = document.getElementById("drinkprice");
const drinkmessageEl = document.getElementById('drinkmessage');

// Hämta drycker från api
function getDrink() {
    fetch(drinkurl, {
        headers: {
            "X-API-KEY": apikey
        }

    })
        .then(response => {
            if (response.status != 200) {
                return
            }
            return response.json()
                .then(data => writeDrink(data))
                .catch(err => console.log(err))
        })
}

//Skriv ut drycker i tabellen
function writeDrink(drink) {
    const drinkmenuEl = document.getElementById('drink-menu');
    drinkmenuEl.innerHTML = "";

    drink.forEach(drink => {
        drinkmenuEl.innerHTML += `<div class="menu-article"><div class="menu-piece">
        <h4>Namn: <div id="drinkname${drink.id}" contenteditable>${drink.name}</div></h4>
        <h4>Pris: <div id="drinkprice${drink.id}" contenteditable>${drink.price}</div>:-</h4>
        </div></div>
        <div class="btn-container">
        <button class="btn good drinkEdit" data-id="${drink.id}">Ändra</button>
        <button class="btn delete bad drinkDelete" data-id="${drink.id}">Radera</button>
        </div>`
    });

    // Funktionalitet för uppdatera- och radera-knappen
    let dDelEl = document.getElementsByClassName('drinkDelete');
    let dEditEl = document.getElementsByClassName('drinkEdit');

    for (let i = 0; i < dDelEl.length; i++) {
        dDelEl[i].addEventListener("click", deleteDrink);
        dEditEl[i].addEventListener("click", updateDrink);
    }


}

// Ta bort drycker från api
function deleteDrink(e) {
    let id = e.target.dataset.id;


    fetch(drinkurl + "?id=" + id, {
        method: "DELETE",
        headers: {
            "X-API-KEY": apikey,
        }
    })
        .then(response => response.json())
        .then(data => getDrink())
        .catch(err => console.log(err))

    drinkmessageEl.innerHTML = `<p class="bad">Drycken är borttagen.</p>`;

}

function updateDrink(e) {
    e.preventDefault();

    // Data från formulär
    let id = e.target.dataset.id;
    let drinkname = document.getElementById("drinkname" + id).innerHTML;
    let drinkprice = document.getElementById("drinkprice" + id).innerHTML;

    let jsonStr = JSON.stringify({
        id: id,
        name: drinkname,
        price: drinkprice
    });

    fetch(drinkurl, {
        method: "put",
        headers: {
            "X-API-KEY": apikey,
            "content-type": "application/json"
        },
        body: jsonStr
    })

        .then(response => response.json())
        .then(data => {
            console.log("Uppdaterad");
            getDrink();
        })
        .catch(err => console.log(err))

    drinkmessageEl.innerHTML = `<p class="good">Drycken är uppdaterad.</p>`;
}

// Lägg till drycker i api
function createDrink(e) {
    foodmessageEl.innerHTML = "";
    drinkmessageEl.innerHTML = "";
    e.preventDefault();

    // Data från formulär
    let drinkname = drinknameInput.value;
    let drinkprice = drinkpriceInput.value;

    if (drinkname.length < 2) {
        addmessageEl.innerHTML = `<p class="bad">Skicka med namn på drycken. Minst två tecken.</p>`
        return;
    }

    if (drinkprice === "") {
        addmessageEl.innerHTML = `<p class="bad">Skicka med pris på drycken.</p>`
        return;
    }

    let jsonStr = JSON.stringify({
        name: drinkname,
        price: drinkprice
    });

    fetch(drinkurl, {
        method: "POST",
        headers: {
            "X-API-KEY": apikey,
            "content-type": "application/json"
        },
        body: jsonStr
    })
        .then(response => response.json())
        .then(data => clearDrinkForm())
        .catch(err => console.log(err))

    addmessageEl.innerHTML = `<p class="good">Drycken är tillagd!</p>`
}


// Töm formuläret efter drycken lagts till
function clearDrinkForm() {
    drinknameInput.value = "";
    drinkpriceInput.value = "";

    getDrink();
}

/* TAKE AWAY */

const takeawaymessageEl = document.getElementById("takeawaymessage");


// Hämta order från api
function getOrder() {
    fetch(takeawayurl, {
        headers: {
            "X-API-KEY": apikey
        }

    })
        .then(response => {
            if (response.status != 200) {
                takeawaymessageEl.innerHTML = `<h2 class="bad">Inga ordrar.</h2>`;
                return
            }
            return response.json()
                .then(data => writeOrder(data))
                .catch(err => {
                    console.log(err)
                })
        })
}

//Skriv ut order i tabellen
function writeOrder(orderList) {
    const ordersEl = document.getElementById('orders');
    ordersEl.innerHTML = "";
    takeawaymessageEl.innerHTML = "";

    orderList.forEach(o => {
        ordersEl.innerHTML += `<div class="order-box">
        <h3>${o.create_date}</h3>
        <div>
        <h3>Orderid: ${o.id}</h3>
        <div class="order">
        <p>Maträtt: ${o.foodname} Dricka: ${o.drinkname}</p>
        <p>Beställare: ${o.tkname}, ${o.tkemail}, ${o.tkphone}</p> 
        </div> 
        <button class="btn takeawayDelete good delete" id="${o.id}">Klar</button>
        </div> 
        </div>`
    });

    // Funktionalitet för uppdater- och radera-knappen
    let tDelEl = document.getElementsByClassName('takeawayDelete');

    for (let i = 0; i < tDelEl.length; i++) {
        tDelEl[i].addEventListener("click", deleteOrder);
    }
}

// Ta bort order från api
function deleteOrder(e) {
    let id = e.target.id;

    fetch(takeawayurl + "?id=" + id, {
        method: "DELETE",
        headers: {
            "X-API-KEY": apikey,
        }
    })
        .then(response => response.json())
        .then(data => getOrder())
        .catch(err => console.log(err))

}


//Från text formuläret
const textInput = document.getElementById('text');
const textmessageEl = document.getElementById('textmessage');

//Hämta text från API
function getText() {
    fetch(presentationurl, {
        headers: {
            "X-API-KEY": apikey
        }

    })
        .then(response => {
            if (response.status != 200) {
                textmessageEl.innerHTML = `<p>Ingen presentation är tillagd. Skriv en i textrutan nedan.</p>`;
                return
            }
            return response.json()
                .then(data => writeText(data))
                .catch(err => console.log(err))
        })
}

//Skriv ut text i rätt format
function writeText(text) {
    const presentationEl = document.getElementById('presentation');
    presentationEl.innerHTML = "";

    text.forEach(t => {
        presentationEl.innerHTML += `<p id="text${t.id}" contenteditable>${t.text}</p>
        <div class="btn-container">
        <button data-id="${t.id}" class="btn good update">Uppdatera</button>
        <button class="btn delete bad textDelete" data-id="${t.id}">Radera</button>
        </div>`
    });

    // Funktionalitet för uppdatera- och radera-knappen
    let textDelEl = document.getElementsByClassName('textDelete');
    let updateEl = document.getElementsByClassName("update");


    for (let i = 0; i < textDelEl.length; i++) {
        textDelEl[i].addEventListener("click", deleteText);
        updateEl[i].addEventListener("click", updateText);
    }
}

//Skapa text från formuläret
function createText(e) {
    e.preventDefault();

    // Data från formulär
    let text = textInput.value;

    if (text.length < 5) {
        textmessageEl.innerHTML = `<p class="bad">Skicka med en text på minst fem tecken.</p>`
        return;
    }

    let jsonStr = JSON.stringify({
        text: text
    });

    fetch(presentationurl, {
        method: "POST",
        headers: {
            "X-API-KEY": apikey,
            "content-type": "application/json"
        },
        body: jsonStr
    })
        .then(response => response.json())
        .then(data => clearTextForm())
        .catch(err => console.log(err))
    textmessageEl.innerHTML = `<p class="good">Texten är tillagd!</p>`;
}

//Uppdatera text i API
function updateText(e) {
    e.preventDefault();

    // Data från formulär
    let id = e.target.dataset.id;
    let text = document.getElementById("text" + id).innerHTML;


    let jsonStr = JSON.stringify({
        id: id,
        text: text
    });

    fetch(presentationurl, {
        method: "put",
        headers: {
            "X-API-KEY": apikey,
            "content-type": "application/json"
        },
        body: jsonStr
    })
        .then(response => response.json())
        .then(data => {
            console.log("Uppdaterad");
            getText();
        })
        .catch(err => console.log(err))
    textmessageEl.innerHTML = `<p class="good">Texten är uppdaterad!</p>`;
}

//Ta bort text ur API
function deleteText(e) {
    let id = e.target.dataset.id;

    fetch(presentationurl + "?id=" + id, {
        method: "DELETE",
        headers: {
            "X-API-KEY": apikey,
        }
    })
        .then(response => response.json())
        .then(data => getText())
        .catch(err => console.log(err))
    textmessageEl.innerHTML = `<p class="bad">Texten är borttagen.</p>`;
}

function clearTextForm() {
    textInput.value = "";

    getText();
}

const rmessageEl = document.getElementById("rmessage");

// Hämta recesioner från API
function getReview() {
    fetch(reviewurl, {
        headers: {
            "X-API-KEY": apikey
        }

    })
        .then(response => {
            if (response.status != 200) {
                return
            }
            return response.json()
                .then(data => writeReview(data))
                .catch(err => console.log(err))
        })
}

//Skriv ut recesnion
function writeReview(review) {
    const reviewsEl = document.getElementById('reviews');
    reviewsEl.innerHTML = "";

    //Skriver ut recension med rätt formattering i menyn
    review.forEach(r => {
        let d = new Date(r.create_date);
        const year = d.getFullYear();
        const month = d.getMonth();
        const date = d.getDate();
        let reviewdate = date + "/" + (month + 1) + "/" + year;

        reviewsEl.innerHTML += `<div class="review-article">
        <p><strong>Status: ${r.status}</strong></p>
        <div><p>Namn:</p><p><div id="rname${r.id}">${r.reviewname}</div></p><p>Datum: ${reviewdate} Stjärnor:</p><p><div id="rate${r.id}">${r.rate}</div></p></div>
        <p id="rtext${r.id}">${r.text}</p>
        <select id="status${r.id}">
        <option value="0">0 = Ej godkänd</option>
        <option value="1">1 = Godkänd</option>
        </select>
        </div>
        <div class="btn-container">
        <button class="btn good rEdit" data-id="${r.id}">Ändra</button>
        <button class="btn bad rDelete delete" data-id="${r.id}">Radera</button>
        </div>`
    });

    // Funktionalitet för uppdatera- och radera-knappen
    let rDelEl = document.getElementsByClassName('rDelete');
    let rEditEl = document.getElementsByClassName('rEdit');

    for (let i = 0; i < rDelEl.length; i++) {
        rDelEl[i].addEventListener("click", deleteReview);
        rEditEl[i].addEventListener("click", updateReview);
    }

}

// Ta bort recension från api
function deleteReview(e) {
    let id = e.target.dataset.id;


    fetch(reviewurl + "?id=" + id, {
        method: "DELETE",
        headers: {
            "X-API-KEY": apikey,
        }
    })
        .then(response => response.json())
        .then(data => getReview())
        .catch(err => console.log(err))

    rmessageEl.innerHTML = `<p class="bad">Recensionen är borttagen.</p>`;

}

function updateReview(e) {
    e.preventDefault();

    
    // Data från formulär
    let id = e.target.dataset.id;
    let rname = document.getElementById("rname" + id).innerHTML;
    let rtext = document.getElementById("rtext" + id).innerHTML;
    let rate = document.getElementById("rate" + id).innerHTML;
    let statusInput = document.getElementById("status" + id);

    let status = statusInput.value;

    let jsonStr = JSON.stringify({
        id: id,
        reviewname: rname,
        text: rtext,
        rate: rate,
        status: status
    });

    console.log(jsonStr);

    fetch(reviewurl, {
        method: "put",
        headers: {
            "X-API-KEY": apikey,
            "content-type": "application/json"
        },
        body: jsonStr
    })

        .then(response => response.json())
        .then(data => {
            console.log("Uppdaterad");
            getReview();
        })
        .catch(err => console.log(err))

    rmessageEl.innerHTML = `<p class="good">Recensionen är uppdaterad.</p>`;
}