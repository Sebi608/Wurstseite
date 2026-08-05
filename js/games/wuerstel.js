let guessNr;
let word;
let wordarr = [];
let guess;
let guessarr = [];
let wordNr;
let letters = '';
let guessList = [];
let wordList = [];
let guessSet;
let wordSet;
let allowedWords;
let reset = true;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function init(){
    guessList = await readGuessList();
    wordList = await readWordList();

    guessSet = new Set(guessList);
    wordSet = new Set(wordList);

    allowedWords = new Set([...wordList, ...guessList]);
    resetFunction();
    
};

init();

const inputs = document.querySelectorAll('.input');
const outputs = document.querySelectorAll('.ausgabe');
const resetButton = document.getElementById('reset');

const keys = document.querySelectorAll(".key, .big_key");
const letterKeys = document.querySelectorAll(".key");
const bigKeys = document.querySelectorAll(".big_key");

letterKeys.forEach(key => {

    key.addEventListener("click", () => {

        const letter = key.innerText.toLowerCase();
        typeLetter(letter);

    });

});

bigKeys.forEach(key => {

    key.addEventListener("click", () => {

        const action = key.getAttribute("data-key"); 

        if (action === "enter") {
            submitGuess();
        }

        if (action === "backspace") {
            deleteLetter();
        }
        
    });
});

function typeLetter(letter){

    for(let i = 0; i < inputs.length; i++){

        if(inputs[i].value === ""){
            inputs[i].value = letter;
            if(i < inputs.length - 1){
                inputs[i+1].focus();
            }
            break;
        }

    }

}

function deleteLetter(){

    for(let i = inputs.length - 1; i >= 0; i--){

        if(inputs[i].value !== ""){
            inputs[i].value = "";
            inputs[i].focus();
            break;
        }

    }

}

function submitGuess(){

    letters = Array.from(inputs).map(input => input.value).join('');

    if (letters.length === 5 && checkWord()) {

        guess = letters;
        guessarr = guess.split('');

        compareWord();

        inputs.forEach(input => input.value = '');
        inputs[0].focus();
    }
}

function updateKeyboard(letter, color){

    const key = document.querySelector(`.key[data-key="${letter}"]`);
    if(!key) return;

    const currentState = key.dataset.state;

    if(currentState === "green") return;

    if(currentState === "orange" && color === "transparent") return;

    if(color === "green"){
        key.style.backgroundColor = "green";
        key.dataset.state = "green";
    }
    else if(color === "orange"){
        key.style.backgroundColor = "orange";
        key.dataset.state = "orange";
    }
    else{
        key.style.backgroundColor = "transparent";
        key.dataset.state = "transparent";
    }
}

resetButton.addEventListener('click', resetFunction);

function resetFunction(){
    if(!reset){
        reset = confirm("Are you sure you want to reset the game?");
    }
    if(!reset) return;
    for(let i = 0; i < outputs.length; i++){
        outputs[i].innerText = '';
        outputs[i].style.backgroundColor = 'transparent';
    }
    for(let i = 0; i < 5; i++){
        inputs[i].value = '';
    }
    keys.forEach(key => {
        key.style.backgroundColor = '';
        key.dataset.state = '';
    });
    guessNr = 0;
    pickRandomWord();
    wordarr = word.split('');
    inputs[0].focus()
    reset = false;
}

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        input.value = input.value.replace(/[^a-zA-Z]/g, '').toLowerCase();
        if (e.target.value.length == 1) {
            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key == 'Backspace'&& e.target.value.length == 0) {
            if (index > 0) {
                inputs[index - 1].focus();
            }
        }
        if (e.key == 'ArrowLeft') {
            if (index > 0) {
                e.preventDefault();
                inputs[index - 1].focus();
            }
        }
        if (e.key == 'ArrowRight') {
            if (index < inputs.length - 1) {
                e.preventDefault();
                inputs[index + 1].focus();
            }
        }
    });
});

async function readGuessList(){
    try {
            const response = await fetch('/games/wuerstel/words/word_guesses.txt');
            const data = await response.text();
            const List = data.split(/\r?\n/);
            return List;

        } catch (error) {
            console.error('Error reading GuessList:', error);
        }
};

async function readWordList(){
    try {
            const response = await fetch('/games/wuerstel/words/word_solutions.txt');
            const data = await response.text();
            const List = data.split(/\r?\n/);
            return List;

        } catch (error) {
            console.error('Error reading WordList:', error);
        }
};

window.addEventListener('keydown', async (e) => {

    if (e.key === 'Enter' && guessNr < 6) {

        if(!word) return;
        letters = Array.from(inputs).map(input => input.value).join('');

        if (letters.length === 5 && checkWord()) {
            guess = letters;
            guessarr = guess.split('');
            compareWord();
            inputs.forEach(input => input.value = '');
            inputs[0].focus();
        }
        e.preventDefault();
    }
});

function checkWord(){

    if (!guessSet || !wordSet) return false;

    const exists =
        guessSet.has(letters.toLowerCase()) ||
        wordSet.has(letters.toLowerCase());
    return exists;
};

function pickRandomWord(){

    do{
        wordNr = Math.floor(Math.random() * wordList.length);
        word = wordList[wordNr];
    }while(word.length !== 5);
}

async function compareWord(){

    const result = compareWordLogic();

    for(let i = 0; i < 5; i++){

        const letter = guessarr[i];
        const color = result[i];

        outputs[guessNr*5 + i].innerText = letter;
        outputs[guessNr*5 + i].style.backgroundColor = color;

        updateKeyboard(letter, color);

        await delay(250);
    }
    
    guessNr++;
    checkForWin();
    if(guessNr > 5 && guess !== word){
        lose();
    }
}

function compareWordLogic(){

    let result = Array(5).fill("gray");
    let remaining = [...wordarr];

    for(let i = 0; i < 5; i++){
        if(guessarr[i] === wordarr[i]){
            result[i] = "green";
            remaining[i] = null;
        }
    }

    for(let i = 0; i < 5; i++){

        if(result[i] === "green") continue;

        const index = remaining.indexOf(guessarr[i]);

        if(index !== -1){
            result[i] = "orange";
            remaining[index] = null;
        }
    }

    return result;
}

function checkForWin(){
    if(word == guess){
        alert("Congratulations! You guessed the word: " + word.toUpperCase());
        reset = true;
        resetFunction();
    }
};

function lose(){
    alert("You Lose!!! The Word was: " + word.toUpperCase());
    reset = true;
    resetFunction();
};