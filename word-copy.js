// async function getWord() {
//   const response = await fetch("https://words.dev-apis.com/word-of-the-day");

//   const data = await response.json();

//   return data.word;
// }

// async function validateWord() {
//   const word = await getWord();

//   console.log(`I got the word: ${word}`);

//   const validate = await fetch("https://words.dev-apis.com/validate-word", {
//     method: "POST",
//     body: JSON.stringify({ word: word }),
//   });

//   const validateResult = await validate.json();

//   console.log(`I validated the word: ${validateResult.word}`);

//   return validateResult.word;
// }

// validateWord();

//query DOM for everything you need

const letters = document.querySelectorAll(".scoreboard-letter");
console.log(letters);

const loadingDiv = document.querySelector(".info-bar");

const ANSWER_LENGTH = 5;

let done = false;

let ROUNDS = 5;
let isLoading = true;
setLoading(false);
isLoading = false;

//work on typing

async function init() {
  let currentGuess = "";
  let currentRow = 0;

  const wordRes = await fetch("https://words.dev-apis.com/word-of-the-day");

  const resObj = await wordRes.json();

  const word = resObj.word.toUpperCase();

  const wordParts = word.split("");

  setLoading(false);

  console.log(wordParts);

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    //i keep track of currentGuess, then refer to it and use its current index to add letter to the div

    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    console.log("committing..");

    if (currentGuess.length != ANSWER_LENGTH) {
      console.log("doing nothing");
      //do nothing
      return;
    }

    //validate the word

    isLoading = true;
    setLoading(true);

    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });

    const resObj = await res.json();

    const validWord = resObj.validWord;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
      alert("That aint a word bra");

      return;
    }

    //do all the marking as 'correct' 'close' or 'wrong'

    const guessParts = currentGuess.split("");

    const map = makeMap(wordParts);
    console.log(map);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        //once it is correct, update the map
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        //do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        //to make more accurate
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
      } else letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
    }

    console.log(guessParts);
    //did they win or lose?

    currentRow++;

    if (currentGuess === word) {
      alert("congrats! You won!");

      done = true;

      return;
    }

    if (currentRow === ROUNDS) {
      alert("Nah bro You Lost");
      done = true;
    }

    currentGuess = "";
  }

  document.addEventListener("keydown", function handleKeyPress(evt) {
    if (done || isLoading) {
      return;
    }

    let action = evt.key;
    console.log(evt.key);

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      //do nothing
    }
  });

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
  }
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

//takes in true or false
//if isLoading is true it will add it, and if false it will remove it

function setLoading(isLoading) {
  loadingDiv.classList.toggle("show", isLoading);
}

//make an object of how many letters in the word

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }

  return obj;
}

init();
