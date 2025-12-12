import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji } from './utils.js';
import { getShuffledOptions } from './game.js';
import { Deck } from './card.js';
import fs from 'fs';
import path from 'path';
import { readBalances, writeBalances, getUser, ensureUser, incrementWin, incrementLoss, getTopBalances } from './balances-manager.js';
import { rerun } from './deploy-commands.js';
import { TarotCard } from './tarot-card.js';

// global for emoji mode; default is off.
export let TOGGLE_MODE = 'off';

// readBalances and writeBalances are provided by balances-manager

const app = express();
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));
const PORT = process.env.PORT || 3000;

const games = new Map();
const pendingGuesses = new Map();

const blackjackGames = new Map();


function handValue(hand) {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else if (card.value === 'A') {
      value += 11;
      aces++;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

function suitEmoji(suit) {
  const map = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return map[suit];
}

function formatHand(hand) {
  const suitMap = {
    hearts: '♥ (hearts)',
    diamonds: '♦ (diamonds)',
    clubs: '♣ (clubs)',
    spades: '♠ (spades)',
  };
  return hand
    .map(c => `${c.value}${suitMap[c.suit]}`)
    .join(', ');
}



app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  try {
    console.log('📥 Incoming Interaction');
    const body = req.body;
    const { type, data } = body;


    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

  
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      /*  /test  */
      if (name === 'test') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `Hello world ${getRandomEmoji()}` },
        });
      }

      /*  /challenge */
      if (name === 'challenge') {
        const options = getShuffledOptions();
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Choose your fighter!',
            components: [
              {
                type: 1,
                components: [{ type: 3, custom_id: 'starter', options }],
              },
            ],
          },
        });
      }

      /*  /rules  */
      if (name === 'guessrules') {
        const guessRulesText =
`
Rules for the guessing game:

🎴Guess the Card
A fast, simple card-guessing game.
I secretly draw one card from a fresh deck.
You guess the *suit* and *value*
I'll tell you if you got the suit right, the value right, or both wrong.
Keep guessing until you find the hidden card!`;
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: guessRulesText },
        });
      }

        if (name === 'bjrules') {
          const bjRulesText =
`Rules for BlackJack game:

Objective:

Get a hand value closer to 21 than the dealer without going over.
🂡 Card Values
Number cards (2–10): face value
J, Q, K: 10
Ace (A): 11, but becomes 1 if 11 would cause the hand to bust

🃏 Player Rules

You start with two cards.
After seeing your cards, you may choose:
Hit → take another card
Stand → stop taking cards
You may continue hitting as long as your total does not exceed 21.
If your total goes over 21, you bust and immediately lose.

🏦 Dealer Rules

The dealer also starts with two cards, but only one is shown.
The dealer must draw cards until the hand total is 17 or higher.
The dealer cannot choose to stop early
If the dealer exceeds 21, the dealer busts and you automatically win.

🏁 Winning the Game

After both you and the dealer have finished:
If you bust → Dealer wins
If the dealer busts → You win

Otherwise:

Higher total wins
Equal totals → Tie (Push)`;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: bjRulesText },
        });
      }

      if (name === 'wordlerules') {
          const wordleRulesText =
  `
  Rules for Wordle:
              Try to guess a 5 letter word in less than 6 guesses.  The wordle board will show you a 🟩 symbol if a letter in that word is in the correct space. If the letter is in the word but in the incorrect space the wordle board will display 🟨. If neither of these symbols are shown then none of the letters in the word you guessed are in the hidden word`  ;
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: wordleRulesText },
          });
        }

      /*  /guess  */
        if (name === 'guess') {
          const userId = body.member.user.id;

          const convertRank =data.options.find(o => o.name === 'rank').value.toUpperCase();

          // get actual values from options
          const suitGuess = data.options.find(o => o.name === 'suit').value.toLowerCase();
          // const valueGuess = data.options.find(o => o.name === 'value').value.toUpperCase();
          const valueGuess = convertRank;

          // store actual values in pendingGuesses
          pendingGuesses.set(userId, { suitGuess, valueGuess });

          // show confirm button
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `You guessed **${valueGuess} of ${suitGuess}**. Click confirm to submit.`,
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 2,
                      style: 1,
                      label: "Confirm Guess",
                      custom_id: "confirm_guess"
                    }
                  ]
                }
              ]
            }
          });
        }

        if(name === 'dadjoke') {
          // Fetch a random dad joke from an external API
          const response = await fetch('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' },
          });
          const data = await response.json();
          const joke = data.joke || "Couldn't fetch a dad joke at the moment.";

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: joke },
          });
        }

      if (name === 'tarot') {
      // FIX: Longer term, respect OOP principles.
      const readingType = req.body.data.options[0].value;
      console.log('Reading type selected:', readingType);
      let tarotDeck = new TarotCard(readingType);
      const cards = tarotDeck.shuffleDeck();

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `For entertainment purposes only. Please contact [988](<https://988lifeline.org/>) if you are in crisis.
            \n\nPast (${cards[0].cardName}, ${cards[0].direction}): ${cards[0].reading}
            \nPresent (${cards[1].cardName}, ${cards[2].direction}): ${cards[1].reading}
            \nFuture (${cards[2].cardName}, ${cards[2].direction}): ${cards[2].reading}` },
        });
      }

      if (name === 'emoji') {
        let previousMode = TOGGLE_MODE;
        const mode = data.options[0].value;
        TOGGLE_MODE = mode;
        console.log(TOGGLE_MODE);

        if(previousMode !== TOGGLE_MODE) {
          rerun();
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `Mode guessing game mode to **${mode}**.` },
        });
      }

      
      /*  /stats  */
      if (name === 'stats' || name === 'balance') {
        const userId = body.member.user.id;
        const balances = readBalances();
        const user = getUser(balances, userId);

        const bwins = user.blackjackWins || 0;
        const blosses = user.blackjackLosses || 0;
        const bTotal = bwins + blosses;
        const bRate = bTotal ? ((bwins / bTotal) * 100).toFixed(1) + '%' : 'N/A';

        const gwins = user.guessingWins || 0;
        const glosses = user.guessingLosses || 0;
        const gTotal = gwins + glosses;
        const gRate = gTotal ? ((gwins / gTotal) * 100).toFixed(1) + '%' : 'N/A';

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `💰 Your balance: ${Number(user.balance).toLocaleString()}\n🃏 Blackjack: ${bwins} wins / ${blosses} losses (Winrate: ${bRate})\n🎴 Guessing game: ${gwins} wins / ${glosses} losses (Winrate: ${gRate})` },
        });
      }
      /*  /leaderboard  */
      if (name === 'leaderboard') {
        const top = getTopBalances(5);
        if (!top.length) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: 'No users in leaderboard yet.' },
          });
        }

        const msg = top.map((u, idx) => `${idx + 1}. <@${u.userId}> — ${Number(u.balance).toLocaleString()}`).join('\n');
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `🏆 Top ${top.length} Balances\n\n${msg}` },
        });
      }

      /*  /daily  */
      if (name === 'daily') {
        const userId = body.member.user.id;
        const balances = readBalances();
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        let user = balances[userId] || { balance: 0, lastDaily: 0 };

        if (now - (user.lastDaily || 0) < DAY) {
          const remaining = DAY - (now - (user.lastDaily || 0));
          const hours = Math.floor(remaining / 3600000);
          const minutes = Math.floor((remaining % 3600000) / 60000);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `❌ Daily already claimed. Try again in ${hours}h ${minutes}m.` },
          });
        }

        const AMOUNT = 100;
        user.balance = (user.balance || 0) + AMOUNT;
        user.lastDaily = now;
        balances[userId] = user;
        writeBalances(balances);

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `✅ You claimed ${AMOUNT} coins. New balance: ${user.balance}` },
        });
      }
      
      /*
         /bj start
       */
      if (name === 'bj') {
        const sub = data.options[0].name;
        if (sub === 'start') {
          const userId = body.member.user.id;

           // check for typed bet option; if missing, default to a no-bet game
          const subOptions = data.options[0].options || [];
          const betOpt = subOptions.find(o => o.name === 'bet');

          const balances = readBalances();
          ensureUser(balances, userId);
          const user = balances[userId];

          const amount = betOpt ? (parseInt(betOpt.value, 10) || 0) : 0;
          if (amount < 0) {
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: { content: '❌ Invalid bet amount. Use a positive integer.' },
            });
          }

          if (amount > 0) {
            if ((user.balance || 0) < amount) {
              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `❌ Insufficient funds. Your balance: ${user.balance}` },
              });
            }

            // Deduct bet and persist
            balances[userId].balance = (balances[userId].balance || 0) - amount;
            writeBalances(balances);
          }

          const deck = new Deck();
          const player = [deck.draw(), deck.draw()];
          const dealer = [deck.draw(), deck.draw()];

          blackjackGames.set(userId, {
            deck,
            player,
            dealer,
            bet: amount
          });

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
`🎰 **Blackjack Started!** (Bet: ${amount})\n\nDealer shows: ${dealer[0].value}${suitEmoji(dealer[0].suit)}\nYour hand: ${formatHand(player)} (value ${handValue(player)})\n\nHit or Stand?`,
              components: [
                {
                  type: 1,
                  components: [
                    { type: 2, style: 1, label: "Hit", custom_id: "bj_hit" },
                    { type: 2, style: 4, label: "Stand", custom_id: "bj_stand" }
                  ]
                }
              ]
            }
          });
        }
      }
    }
      //guess button
      
      if (body.type === 3 && body.data.custom_id === "confirm_guess") {
        const userId = body.member.user.id;
        const guess = pendingGuesses.get(userId);

        if (!guess) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: "❌ You have no guess pending." }
          });
        }

        const { suitGuess, valueGuess } = guess;

        if (!games.has(userId)) {
          const deck = new Deck();
          const secretCard = deck.draw();
          games.set(userId, secretCard);
        }

        const secretCard = games.get(userId);

        pendingGuesses.delete(userId);

        if (
          suitGuess === secretCard.suit.toLowerCase() &&
          valueGuess === secretCard.value.toUpperCase()
        ) {
          // correct guess -> increment guessing wins
          incrementWin(userId, 'guessing');
          games.delete(userId);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: `🎉 Correct! It was **${secretCard.value} of ${secretCard.suit}**.` }
          });
        }

        if (suitGuess === secretCard.suit.toLowerCase()) {
          // Partial match counts as a loss
          incrementLoss(userId, 'guessing');
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: "✔ Correct suit, wrong value." }
          });
        }
        // wrong guess -> record loss
        incrementLoss(userId, 'guessing');
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "❌ Wrong guess!" }
        });
      }



    /*
=======
    /* 
>>>>>>> 96dd0c7203eedc05383a388ce99f4ba2fd7fd1fb
       BUTTON INTERACTIONS (Hit / Stand)
    */

    if (type === InteractionType.MESSAGE_COMPONENT) {
      const userId = body.member.user.id;
      const customId = data.custom_id;
      const game = blackjackGames.get(userId);

      if (!game) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: "No active Blackjack game! Use `/bj start`." }
        });
      }

      /* HIT */
      if (customId === "bj_hit") {
        game.player.push(game.deck.draw());
        const pVal = handValue(game.player);

        if (pVal > 21) {
          // player busted -> record blackjack loss
          incrementLoss(userId, 'blackjack');
          blackjackGames.delete(userId);
          return res.send({
            type: 7,
            data: {
              content:
`💥 **Busted!**
Your hand: ${formatHand(game.player)} (${pVal})
Dealer wins.`,
              components: []
            }
          });
        }

        return res.send({
          type: 7,
          data: {
            content:
`🎰 **Blackjack**
Dealer shows: ${game.dealer[0].value}${suitEmoji(game.dealer[0].suit)}
Your hand: ${formatHand(game.player)} (${pVal})
Hit or Stand?`,
            components: [
              {
                type: 1,
                components: [
                  { type: 2, style: 1, label: "Hit", custom_id: "bj_hit" },
                  { type: 2, style: 4, label: "Stand", custom_id: "bj_stand" }
                ]
              }
            ]
          }
        });
      }

      /* STAND */
      if (customId === "bj_stand") {
        let dVal = handValue(game.dealer);

        while (dVal < 17) {
          game.dealer.push(game.deck.draw());
          dVal = handValue(game.dealer);
        }

        const pVal = handValue(game.player);

        let result = "";
        let outcome = null; // 'win' | 'loss' | 'push'
          const bet = game.bet || 0;
        if (bet) {
          const balances = readBalances();
          const userBal = balances[userId] || { balance: 0, lastDaily: 0 };

          if (dVal > 21) {
            result = `Dealer busts! **You win ${bet}! 🎉**`;
            userBal.balance = (userBal.balance || 0) + (bet * 2);
            outcome = 'win';
          } else if (pVal > dVal) {
            result = `**You win ${bet}! 🎉**`;
            userBal.balance = (userBal.balance || 0) + (bet * 2);
            outcome = 'win';
          } else if (pVal < dVal) {
            result = `**Dealer wins. You lost ${bet}. 😭**`;
            // bet was already deducted when game started
            outcome = 'loss';
          } else {
            result = `**Push (tie). Your ${bet} has been returned. 🤝**`;
            userBal.balance = (userBal.balance || 0) + bet;
            outcome = 'push';
          }

          balances[userId] = userBal;
          writeBalances(balances);
        } else {
        if (dVal > 21) { result = "Dealer busts! **You win! 🎉**"; outcome = 'win'; }
        else if (pVal > dVal) { result = "**You win! 🎉**"; outcome = 'win'; }
        else if (pVal < dVal) { result = "**Dealer wins. 😭**"; outcome = 'loss'; }
        else { result = "**Push (tie). 🤝**"; outcome = 'push'; }
        }
        blackjackGames.delete(userId);

        // Update stats depending on the outcome
        if (outcome === 'win') incrementWin(userId, 'blackjack');
        else if (outcome === 'loss') incrementLoss(userId, 'blackjack');

        return res.send({
          type: 7,
          data: {
            content:
`🎰 **Final Results**

Dealer: ${formatHand(game.dealer)} (${dVal})
Player: ${formatHand(game.player)} (${pVal})

${result}`,
            components: []
          }
        });
      }
    }

    res.status(400).send('Unknown interaction');
  } catch (err) {
    console.error('❌ Error handling interaction:', err);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/', (_, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
