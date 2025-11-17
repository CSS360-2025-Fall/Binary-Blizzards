//
// app.js responsiblities
// server behavior, kinda
//

import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, capitalize } from './utils.js';
// import { getShuffledOptions } from './game.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { Game } from './game.js';

const app = express();
const PORT = process.env.PORT || 3000;
const games = new Map();

// ✅ Middleware (verifyKeyMiddleware handles raw body internally)
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  try {
    console.log('📥 Incoming Interaction');
    const body = req.body; // Already parsed JSON object
    const { type, data } = body;

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      // /test
      if (name === 'test') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `Hello world ${Card.getSuitChoices()}` }, // new Game("Guess").gameKickOff() // new Deck().shuffleDeck().deck[0].suit.name
        });
      }

      // /challenge
      // if (name === 'challenge') {
      //   const options = getShuffledOptions();
      //   return res.send({
      //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //     data: {
      //       content: 'Choose your fighter!',
      //       components: [
      //         {
      //           type: 1,
      //           components: [{ type: 3, custom_id: 'starter', options }],
      //         },
      //       ],
      //     },
      //   });
      // }

      // /rules
      if (name === 'rules') {
        const rulesText = `Guess the Card rules:\n\n- I pick a secret card from a standard 52-card deck.\n- You guess by providing a suit (hearts, spades, clubs, diamonds) and a value (A, 2-10, J, Q, K).\n- If both suit and value match, you win and the game ends.\n- If only the suit is correct, I'll tell you it's the correct suit as a hint.\n- Otherwise I'll tell you the guess was incorrect and you can try again.\n- Use /guess to make a guess. Good luck!`;

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: rulesText },
        });
      }

      // /guess
      if (name === 'guess') { //&& id
        //
        // START: guess command new setup
        const context = req.body.context;
        // const userId = context === 0 ? req.body.member.user.id : req.body.user.id;

        const suitChoice = req.body.data.options[0].value;
        const rankChoice = req.body.data.options[1].value;
        const game = new Game("Guess");
        const result = game.guessingResult(suitChoice, rankChoice);
        console.log(result);
        // END: guess command new setup
        //

        // const newDeck = new Deck();
        // console.log(newDeck.deck[0].suit.name);
        // const suitOptions = Card.getSuitChoices();
        // console.log(suitOptions);

        // return res.send({
        //   type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        //   data: {
        //     content: 'Choose suit: ',
        //     components: [
        //       {
        //         type: 1,
        //         components: [{ type: 3, custom_id: 'kick off', suitOptions }],
        //       },
        //     ],
        //   },
        // });

        // const userId = body.member.user.id;
        // console.log(userId);
        // const suitGuess = data.options.find(o => o.name === 'suit').value;
        // const valueGuess = data.options.find(o => o.name === 'value').value;

        // if (!games.has(userId)) {
        //   const deck = new Deck();
        //   const secretCard = deck.draw();
        //   games.set(userId, secretCard);
        // }

        // const secretCard = games.get(userId);
        // if (
        //   suitGuess === secretCard.suit &&
        //   valueGuess === secretCard.value
        // ) {
        //   games.delete(userId);
        //   return res.send({
        //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        //     data: {
        //       content: `🎉 You got it! It was **${secretCard.value} of ${secretCard.suit}**.`,
        //     },
        //   });
        // } else if (suitGuess === secretCard.suit) {
        //   return res.send({
        //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        //     data: {
        //       content: `❌ Nope! ${capitalize(suitGuess)} was the correct suit but ${valueGuess} was not the correct value. Try again!`,
        //     },
        //   });
        // }
          
        // else {
        //   return res.send({
        //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        //     data: {
        //       content: `❌ Nope! It wasn’t ${valueGuess} of ${suitGuess}. Try again!`,
        //     },
        //   });
        // }
      }
    }

    res.status(400).send('Unknown interaction type');
  } catch (err) {
    console.error('❌ Error handling interaction:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Health check
app.get('/', (_, res) => res.send('Bot is running!'));

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
