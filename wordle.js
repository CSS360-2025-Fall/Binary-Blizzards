// wordle.js
const WORDS = [
    "apple","table","chair","water","mouse","candy","peace",
    "light","sound","train","plant","world","smart","heart"
];

function randomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)].toLowerCase();
}

const games = {};  
// structure per user: 
// games[userId] = { answer: "apple", attempts: 0, finished: false };

function evaluateGuess(guess, answer) {
    let result = "";
    let answerArr = answer.split("");

    for (let i = 0; i < 5; i++) {
        if (guess[i] === answer[i]) {
            result += "🟩";        // correct letter + correct position
            answerArr[i] = null;   // mark used
        } else {
            result += "_";         // fill temporary
        }
    }

    let finalResult = "";

    for (let i = 0; i < 5; i++) {
        if (result[i] === "🟩") {
            finalResult += "🟩";
        } else if (answerArr.includes(guess[i])) {
            finalResult += "🟨";   // correct letter wrong position
            answerArr[answerArr.indexOf(guess[i])] = null;
        } else {
            finalResult += "⬛";   // not in word
        }
    }

    return finalResult;
}

module.exports = {
    startGame(userId) {
        games[userId] = {
            answer: randomWord(),
            attempts: 0,
            finished: false
        };
        return "Wordle game started! Guess a 5-letter word using **!guess <word>**.";
    },

    guessWord(userId, guess) {
        guess = guess.toLowerCase();

        const game = games[userId];
        if (!game) return "You have no active game! Use **!wordle** to start.";
        if (game.finished) return "Game already ended! Start a new one with **!wordle**.";

        if (guess.length !== 5) return "❌ Your guess must be **5 letters**.";

        game.attempts++;

        const feedback = evaluateGuess(guess, game.answer);

        if (guess === game.answer) {
            game.finished = true;
            return `🎉 Correct! The word was **${game.answer}**.\n${feedback}`;
        }

        if (game.attempts >= 6) {
            let ans = game.answer;
            game.finished = true;
            return `❌ Out of attempts! The word was **${ans}**.\n${feedback}`;
        }

        return `Guess **${game.attempts}/6**:\n${feedback}`;
    }
};

