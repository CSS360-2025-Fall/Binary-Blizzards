import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';
import { Deck } from './card.js';

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
      description: 'Enter the card suit (hearts, spades, clubs, diamonds)',
      required: true,
    },
    {
      type: 3,
      name: 'value',
      description: 'Enter the card value (A, 2–10, J, Q, K)',
      required: true,
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};


const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, GUESS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);