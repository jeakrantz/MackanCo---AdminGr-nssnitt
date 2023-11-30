// Vald knapp
enum BtnResponse {
    drink = 0,
    food = 1,
    close = 2,
}

// Funktion för att visa valt formulär
function showForm(answer: BtnResponse): void {
    let foodForm: any = document.getElementById('foodForm');
    let drinkForm: any = document.getElementById('drinkForm');

    if (answer === 1) {
        // Om maträtt har valts
        foodForm.style = "display:inline";

    } else {
        // Om dryck valts
        foodForm.style = "display:none";

    }
    if (answer === 0) {
        // Om maträtt har valts
        drinkForm.style = "display:inline";

    } else {
        // Om dryck valts
        drinkForm.style = "display:none";
    }

    //Stäng
    if (answer === 2) {
        foodForm.style = "display:none";
        drinkForm.style = "display:none";
    }
}
