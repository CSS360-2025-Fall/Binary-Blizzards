//
// commands.js responsiblities
// all commands live here.
//

import 'dotenv/config';
// REMOVE
// import { getRPSChoices } from './game.js';
// REMOVE
// import { getShuffledDeck} from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import { Card } from './card.js';
// REMOVE: all stuff should comes from game
// import { Deck } from './card.js';
// REMOVE: all stuff should come from game

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

function createSuitSelection() {
  const suits = Card.getSuitChoices();
  const suitChoices = [];

  for (let suit of suits) {
    suitChoices.push({
      name: capitalize(suit),
      value: suit.toLowerCase(),
    });
  }

  return suitChoices;
}

function createRankSelection() {
  const ranks = Card.getRankChoices();
  const rankChoices = [];

  for (let rank of ranks) {
    rankChoices.push({
      name: capitalize(rank),
      value: rank.toLowerCase(),
    });
  }

  return rankChoices;
}

// Card guessing command
const GUESS_COMMAND = {
  name: 'guess',
  description: 'Try to guess the card I have picked!',
  options: [
    {
      type: 3,
      name: 'suit',
      description: 'Select suit from menu: ',
      required: true,
      choices: createSuitSelection(),
    },
    {
      type: 3,
      name: 'rank',
      description: 'Select rank from menu: ',
      required: true,
      choices: createRankSelection(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

// Card guessing rules command
const RULES_COMMAND = {
  name: 'rules',
  description: 'Show the rules for the Guess the Card game',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

// Tarot card reading command
const TAROT_COMMAND = {
  name: 'tarot',
  description: 'Get a tarot card reading',
  options: [
    {
      type: 3,
      name: 'type',
      description: 'Select reading type',
      required: true,
      choices: [
        { name: 'general', value: 'general' },
        { name: 'love', value: 'love' },
        { name: 'career', value: 'career' },
        { name: 'finances', value: 'finances' },
      ],
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};


const ALL_COMMANDS = [TEST_COMMAND, GUESS_COMMAND, RULES_COMMAND, TAROT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);