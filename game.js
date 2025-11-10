//
// game.js responsiblities
// game logic, game state
//

//
// START: game.js update
// import { getDeck } from './deck.js'; // ADD: function list
//
//
// START: getShuffledDeck (removed from command)
// Get the game choices from game.js
// function createCommandChoices() {
//   const choices = getRPSChoices();
//   const commandChoices = [];
//
//   for (let choice of choices) {
//     commandChoices.push({
//       name: capitalize(choice),
//       value: choice.toLowerCase(),
//     });
//   }
//   return commandChoices;
// }
//
// function getShuffledDeck() {
//      const deck = getDeck(); // deck responsible for card generation
// }
//
// END: getShuffledDeck
// END: game.js update
//

// import { capitalize } from './utils.js';

// export function getResult(p1, p2) {
//   let gameResult;
//   if (RPSChoices[p1.objectName] && RPSChoices[p1.objectName][p2.objectName]) {
//     // o1 wins
//     gameResult = {
//       win: p1,
//       lose: p2,
//       verb: RPSChoices[p1.objectName][p2.objectName],
//     };
//   } else if (
//     RPSChoices[p2.objectName] &&
//     RPSChoices[p2.objectName][p1.objectName]
//   ) {
//     // o2 wins
//     gameResult = {
//       win: p2,
//       lose: p1,
//       verb: RPSChoices[p2.objectName][p1.objectName],
//     };
//   } else {
//     // tie -- win/lose don't
//     gameResult = { win: p1, lose: p2, verb: 'tie' };
//   }

//   return formatResult(gameResult);
// }

// function formatResult(result) {
//   const { win, lose, verb } = result;
//   return verb === 'tie'
//     ? `<@${win.id}> and <@${lose.id}> draw with **${win.objectName}**`
//     : `<@${win.id}>'s **${win.objectName}** ${verb} <@${lose.id}>'s **${lose.objectName}**`;
// }

// // this is just to figure out winner + verb
// const RPSChoices = {
//   rock: {
//     description: 'sedimentary, igneous, or perhaps even metamorphic',
//     virus: 'outwaits',
//     computer: 'smashes',
//     scissors: 'crushes',
//   },
//   cowboy: {
//     description: 'yeehaw~',
//     scissors: 'puts away',
//     wumpus: 'lassos',
//     rock: 'steel-toe kicks',
//   },
//   scissors: {
//     description: 'careful ! sharp ! edges !!',
//     paper: 'cuts',
//     computer: 'cuts cord of',
//     virus: 'cuts DNA of',
//   },
//   virus: {
//     description: 'genetic mutation, malware, or something inbetween',
//     cowboy: 'infects',
//     computer: 'corrupts',
//     wumpus: 'infects',
//   },
//   computer: {
//     description: 'beep boop beep bzzrrhggggg',
//     cowboy: 'overwhelms',
//     paper: 'uninstalls firmware for',
//     wumpus: 'deletes assets for',
//   },
//   wumpus: {
//     description: 'the purple Discord fella',
//     paper: 'draws picture on',
//     rock: 'paints cute face on',
//     scissors: 'admires own reflection in',
//   },
//   paper: {
//     description: 'versatile and iconic',
//     virus: 'ignores',
//     cowboy: 'gives papercut to',
//     rock: 'covers',
//   },
// };

// export function getRPSChoices() {
//   return Object.keys(RPSChoices);
// }

// // Function to fetch shuffled options for select menu
// export function getShuffledOptions() {
//   const allChoices = getRPSChoices();
//   const options = [];

//   for (let c of allChoices) {
//     // Formatted for select menus
//     // https://discord.com/developers/docs/components/reference#string-select-select-option-structure
//     options.push({
//       label: capitalize(c),
//       value: c.toLowerCase(),
//       description: RPSChoices[c]['description'],
//     });
//   }

//   return options.sort(() => Math.random() - 0.5);
// }
