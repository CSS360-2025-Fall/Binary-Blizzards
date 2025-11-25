import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import { Deck } from './card.js';
import { AltCard } from './alt-card.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Creates suit drop down selection.
function createSuitSelection() {
  const suits = AltCard.getSuitChoices();
  const suitChoices = [];

  for (let suit of suits) {
    suitChoices.push({
      name: AltCard.suits[suit].namePlural,
      value: AltCard.suits[suit].namePlural.toLowerCase(),
    });
  }

  return suitChoices;
}

// Creates rank drop down selection.
function createRankSelection() {
  const ranks = AltCard.getRankChoices();
  const rankChoices = [];

  for (let rank of ranks) {
    rankChoices.push({
      name: rank,
      value: rank.toLowerCase(),
    });
  }

  return rankChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};


const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

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


const RULES_COMMAND = {
  name: 'rules',
  description: 'Show the rules for the Black Jack Card game',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};


const BALANCE_COMMAND = {
  name: 'balance',
  description: 'Show your current balance',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const DAILY_COMMAND = {
  name: 'daily',
  description: 'Claim your daily free money (24h cooldown)',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const BJ_COMMAND = {
  name: 'bj',
  description: 'Play a simple Blackjack game',
  options: [
    {
      type: 1,
      name: 'start',
      description: 'Start a Blackjack game',
      options: [
        {
          type: 4, // integer
          name: 'bet',
          description: 'Amount to bet',
          required: false,
        }
      ]
    }
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const MODE_COMMAND = {
  name: 'mode',
  description: 'Toggle light/dark mode for guessing game',
  options: [
    {
      type: 3,
      name: 'mode',
      description: 'Select mode',
      required: true,
      choices: [
        {
          name: 'Light',
          value: 'light',
        },
        {
          name: 'Dark',
          value: 'dark',
        }
      ],
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, GUESS_COMMAND, RULES_COMMAND, BJ_COMMAND, BALANCE_COMMAND, DAILY_COMMAND, MODE_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);