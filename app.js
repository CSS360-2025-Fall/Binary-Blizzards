/*
import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionCallbackType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji } from './utils.js';
import { getShuffledOptions } from './game.js';
import { Deck } from './card.js';

const app = express();
const PORT = process.env.PORT || 3000;
const games = new Map();

app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async (req, res) => {
  try {
    console.log('📥 Incoming Interaction');
    const body = req.body;
    const { type, data } = body;

    // ✅ PING check
    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    // ✅ Slash command handling
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      // /test command
      if (name === 'test') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: `Hello world ${getRandomEmoji()}` },
        });
      }

      // /guess command
      if (name === 'guess') {
        const userId = body.member.user.id;
        const suitGuess = data.options.find(o => o.name === 'suit').value.toLowerCase();
        const valueGuess = data.options.find(o => o.name === 'value').value.toUpperCase();

        if (!games.has(userId)) {
          const deck = new Deck();
          const secretCard = deck.draw();
          games.set(userId, secretCard);
        }

        const secretCard = games.get(userId);
        let responseText;

        if (
          suitGuess === secretCard.suit.toLowerCase() &&
          valueGuess === secretCard.value.toUpperCase()
        ) {
          games.delete(userId);
          responseText = `🎉 You got it! It was **${secretCard.value} of ${secretCard.suit}**.`;
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: { content: responseText },
          });
        } else {
          // Generate hint if correct suit
          if (suitGuess === secretCard.suit.toLowerCase()) {
            responseText = `Hint: you got the correct suit of the card!`;
          } else {
            responseText = `❌ Nope! It wasn’t ${valueGuess} of ${suitGuess}. Try again!`;
          }

          // Provide action buttons for "make another guess" or "end game"
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: responseText,
              components: [
                {
                  type: 1,
                  components: [
                    {
                      type: 2,
                      label: 'Make another guess',
                      style: 1,
                      custom_id: `guess_again_${userId}`,
                    },
                    {
                      type: 2,
                      label: 'End the game',
                      style: 4,
                      custom_id: `end_game_${userId}`,
                    },
                  ],
                },
              ],
            },
          });
        }
      }
    }

    // ✅ Component (button) interactions
    if (type === InteractionType.MESSAGE_COMPONENT) {
      const userId = body.member.user.id;
      const customId = data.custom_id;
      const secretCard = games.get(userId);

      if (!secretCard) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: 'No active game found! Use `/guess` to start a new one.' },
        });
      }

      if (customId.startsWith('end_game_')) {
        games.delete(userId);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `🛑 Game ended. The secret card was **${secretCard.value} of ${secretCard.suit}**.`,
          },
        });
      }

      if (customId.startsWith('guess_again_')) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: '🔁 Okay! Make another guess using `/guess`!',
          },
        });
      }
    }

    res.status(400).send('Unknown interaction type');
  } catch (err) {
    console.error('❌ Error handling interaction:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (_, res) => res.send('Bot is running!'));

app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));

*/
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
          data: { content: `Hello world ${getRandomEmoji()}` },
        });
      }

      // /challenge
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

      // /guess
      if (name === 'guess') {
        const userId = body.member.user.id;
        const suitGuess = data.options.find(o => o.name === 'suit').value.toLowerCase();
        const valueGuess = data.options.find(o => o.name === 'value').value.toUpperCase();

        if (!games.has(userId)) {
          const deck = new Deck();
          const secretCard = deck.draw();
          games.set(userId, secretCard);
        }

        const secretCard = games.get(userId);
        if (
          suitGuess === secretCard.suit.toLowerCase() &&
          valueGuess === secretCard.value.toUpperCase()
        ) {
          games.delete(userId);
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `🎉 You got it! It was **${secretCard.value} of ${secretCard.suit}**.`,
            },
          });
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `❌ Nope! It wasn’t ${valueGuess} of ${suitGuess}. Try again!`,
            },
          });
        }
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