//
// app.js responsiblities
// server behavior, kinda
//

import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, capitalize } from './utils.js';
// import { getShuffledOptions } from './game.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { Game } from './game.js';
import { DiscordRequest } from './utils.js';
import { TarotCard } from './tarot-card.js';

const app = express();
const PORT = process.env.PORT || 3000;
const currentGames = new Map();

// ✅ Middleware (verifyKeyMiddleware handles raw body internally)
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  try {
    console.log('📥 Incoming Interaction');
    const body = req.body; // Already parsed JSON object
    const { type, id, data } = body;

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
      if (name === 'guess' && id) {
        const context = req.body.context;
        const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
        // console.log(userId);
        const suitChoice = req.body.data.options[0].value;
        const rankChoice = req.body.data.options[1].value;
        const currentGame = new Game('guess');

        currentGames[id] = {
          id: userId,
          suit: suitChoice,
          rank: rankChoice,
          game: currentGame,
        }
        console.log(currentGames[id].game.winningCard);
        // https://github.com/CSS360-2025-Fall/Binary-Blizzards/blob/main/examples/app.js
        
        // https://discord.com/developers/docs/resources/webhook
        // malformed (for me)
        const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.user.id}`;
        console.log(endpoint);

      }

      if (name === 'tarot') {
      // FIX: Longer term, respect OOP principles.
      const readingType = req.body.data.options[0].value;
      console.log('Reading type selected:', readingType);
      let tarotDeck = new TarotCard(readingType);
      const cards = tarotDeck.shuffleDeck();

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `For entertainment purposes only.\n\nPast, ${cards[0].cardName}: ${cards[0].reading}\n\nPresent, ${cards[1].cardName}: ${cards[1].reading}\n\nFuture, ${cards[2].cardName}: ${cards[2].reading}` },
        });
      }
    }

    // Fallback for unhandled commands
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Command not recognized or not implemented yet.' },
    });
  } catch (error) {
    console.error('Error handling interaction:', error);
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'An error occurred while processing your request.' },
    });
  }
});

// Health check
app.get('/', (_, res) => res.send('Bot is running!'));

app.listen(PORT, () => {
  console.log(`🚀 Listening on port ${PORT}`);
});
