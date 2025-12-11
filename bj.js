import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';

import { Deck } from '../card.js';   // USE YOUR REAL DECK
import { incrementWin, incrementLoss } from './balances-manager.js';

// Helper functions
function handValue(hand) {
  let value = 0;
  let aces = 0;

  for (const c of hand) {
    if (['J', 'Q', 'K'].includes(c.value)) value += 10;
    else if (c.value === 'A') { value += 11; aces++; }
    else value += parseInt(c.value);
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

function formatHand(hand) {
  return hand.map(c => `${c.value}${c.suit[0]}`).join(' ');
}

// Store active games
const blackjackSessions = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('bj')
    .setDescription('Blackjack game')
    .addSubcommand(sub => sub
      .setName('start')
      .setDescription('Start a Blackjack game')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'start') {
      const userId = interaction.user.id;

      const deck = new Deck();
      const player = [deck.draw(), deck.draw()];
      const dealer = [deck.draw(), deck.draw()];

      blackjackSessions.set(userId, {
        deck,
        player,
        dealer,
        channelId: interaction.channelId,
      });

      const embed = new EmbedBuilder()
        .setTitle('🃏 Blackjack Started!')
        .setColor(0x4CAF50)
        .setDescription(
`**Dealer Shows:** ${dealer[0].value}${dealer[0].suit[0]}
**Your Hand:** ${formatHand(player)}  (value: **${handValue(player)}**)

Hit or Stand?`
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('bj_hit')
          .setLabel('Hit')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('bj_stand')
          .setLabel('Stand')
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  },

  // BUTTON HANDLERS (must be imported in your interactionCreate event)
  async handleButton(interaction) {
    const userId = interaction.user.id;
    const game = blackjackSessions.get(userId);
    if (!game) {
      return interaction.reply({ content: 'No active Blackjack game!', ephemeral: true });
    }

    if (interaction.customId === 'bj_hit') {
      game.player.push(game.deck.draw());
      const pVal = handValue(game.player);

      if (pVal > 21) {
        // record loss
        incrementLoss(userId, 'blackjack');
        blackjackSessions.delete(userId);

        return interaction.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('💥 You Busted!')
              .setColor(0xff3333)
              .setDescription(
`**Your Hand:** ${formatHand(game.player)} (${pVal})
Dealer wins!`
              )
          ],
          components: []
        });
      }

      return interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('🃏 Blackjack')
            .setColor(0x4CAF50)
            .setDescription(
`**Dealer Shows:** ${game.dealer[0].value}${game.dealer[0].suit[0]}
**Your Hand:** ${formatHand(game.player)} (value: **${pVal}**)

Hit or Stand?`
            )
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('bj_hit').setStyle(ButtonStyle.Primary).setLabel('Hit'),
            new ButtonBuilder().setCustomId('bj_stand').setStyle(ButtonStyle.Danger).setLabel('Stand')
          )
        ]
      });
    }

    if (interaction.customId === 'bj_stand') {
      let dVal = handValue(game.dealer);

      while (dVal < 17) {
        game.dealer.push(game.deck.draw());
        dVal = handValue(game.dealer);
      }

      const pVal = handValue(game.player);
      let result;

      let outcome;
      if (dVal > 21) { result = "Dealer busts! **You win! 🎉**"; outcome = 'win'; }
      else if (pVal > dVal) { result = "**You win! 🎉**"; outcome = 'win'; }
      else if (pVal < dVal) { result = "**Dealer wins! 😭**"; outcome = 'loss'; }
      else { result = "**Push (tie). 🤝**"; outcome = 'push'; }

      blackjackSessions.delete(userId);
      if (outcome === 'win') incrementWin(userId, 'blackjack');
      else if (outcome === 'loss') incrementLoss(userId, 'blackjack');

      return interaction.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('🃏 Final Results')
            .setColor(0xFFD700)
            .setDescription(
`**Your Hand:** ${formatHand(game.player)} (${pVal})
**Dealer Hand:** ${formatHand(game.dealer)} (${dVal})

${result}`
            )
        ],
        components: []
      });
    }
  }
};
