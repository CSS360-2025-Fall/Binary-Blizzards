const WORDS = [
  "apple","table","chair","water","mouse","candy",
  "peace","light","sound","train","plant","world",
  "smart","heart"
];

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

const games = {};

function evaluateGuess(guess, answer) {
  const result = Array(5).fill("⬛");
  const answerArr = answer.split("");

  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "🟩";
      answerArr[i] = null;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] === "🟩") continue;
    const idx = answerArr.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = "🟨";
      answerArr[idx] = null;
    }
  }

  return result.join("");
}

export function startGame(userId) {
  games[userId] = {
    answer: randomWord(),
    attempts: 0,
    finished: false
  };
  return "Wordle started. Use `/wordle guess` with a 5-letter word.";
}

export function guessWord(userId, guess) {
  const game = games[userId];
  if (!game) return "No active Wordle game. Use `/wordle start`.";
  if (game.finished) return "Game already finished. Start a new one.";

  if (!guess || guess.length !== 5) return "Your guess must be exactly 5 letters.";

  guess = guess.toLowerCase();
  game.attempts++;

  const feedback = evaluateGuess(guess, game.answer);

  if (guess === game.answer) {
    game.finished = true;
    return `🎉 Correct! The word was **${game.answer}**\n${feedback}`;
  }

  if (game.attempts >= 6) {
    game.finished = true;
    return `❌ Out of attempts. The word was **${game.answer}**`;
  }

  return `Attempt ${game.attempts}/6\n${feedback}`;
}


