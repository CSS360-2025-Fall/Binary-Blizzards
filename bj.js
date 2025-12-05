import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';

import { Deck } from '../card.js';

// Helper functions
function handValue(hand) {
  let value = 0;
  let aces = 0;

  for (const c of hand) {
    if (['J', 'Q', 'K'].includes(c.value)) {
      value += 10;
    } else if (c.value === 'A') {
      value += 11;
      aces++;
    } else {
      value += parseInt(c.value, 10);
    }
  }

  // downgrade Aces from 11 to 1 if we bust
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

function formatHand(hand) {
  return hand.map(c => `${c.value}${c.suit[0].toUpperCase()}`).join(' ');
}

const blackjackSessions = new Map();

/**
 * Simple result description for no-coin blackjack.
 */
function describeResult(pVal, dVal) {
  if (pVal > 21 && dVal <= 21) {
    return '💥 **You busted. Dealer wins.**';
  }
  if (dVal > 21 && pVal <= 21) {
    return 'Dealer busts! **You win! 🎉**';
  }
  if (pVal > dVal && pVal <= 21) {
    return '**You win! 🎉**';
  }
  if (pVal < dVal && dVal <= 21) {
    return '**Dealer wins. 😭**';
  }
  return '**Push (tie). 🤝**';
}

export default {
  data: new SlashCommandBuilder()
    .setName('bj')
    .setDescription('Play a game of Blackjack')
    .addSubcommand(sub =>
      sub
        .setName('start')
        .setDescription('Start a Blackjack game'),
    ),

  // Slash command handler
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== 'start') return;

    const userId = interaction.user.id;

    const deck = new Deck();
    const player = [deck.draw(), deck.draw()];
    const dealer = [deck.draw(), deck.draw()];

    const game = {
      deck,
      player,
      dealer,
      hasDoubled: false,
      isFinished: false,
    };

    blackjackSessions.set(userId, game);

    const pVal = handValue(player);
    const dVal = handValue(dealer);

    // Auto-resolve on natural 21
    if (pVal === 21 || dVal === 21) {
      const result = describeResult(pVal, dVal);
      game.isFinished = true;
      blackjackSessions.delete(userId);

      const embed = new EmbedBuilder()
        .setTitle('🃏 Blackjack - Natural 21')
        .setColor(0x00ff99)
        .setDescription(
`**Your Hand:** ${formatHand(player)} (${pVal})
**Dealer Hand:** ${formatHand(dealer)} (${dVal})

${result}`,
        );

      return interaction.reply({ embeds: [embed], components: [] });
    }

    const embed = new EmbedBuilder()
      .setTitle('🃏 Blackjack')
      .setColor(0x00bfff)
      .setDescription(
`Dealer shows: ${dealer[0].value}${dealer[0].suit[0].toUpperCase()}
Your hand: ${formatHand(player)} (${pVal})

Hit, Stand, or Double Down?`,
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('bj_hit')
        .setLabel('Hit')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('bj_stand')
        .setLabel('Stand')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('bj_double')
        .setLabel('Double Down')
        .setStyle(ButtonStyle.Success),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },

  // Button handlers (call from your interactionCreate event)
  async handleButton(interaction) {
    const userId = interaction.user.id;
    const customId = interaction.customId;
    const game = blackjackSessions.get(userId);

    if (!game || game.isFinished) {
      return interaction.reply({
        content: 'No active Blackjack game. Use `/bj start` to begin.',
        ephemeral: true,
      });
    }

    // HIT
    if (customId === 'bj_hit') {
      game.player.push(game.deck.draw());
      const pVal = handValue(game.player);

      // Player busts
      if (pVal > 21) {
        game.isFinished = true;
        blackjackSessions.delete(userId);

        const dVal = handValue(game.dealer);
        const result = describeResult(pVal, dVal);

        const embed = new EmbedBuilder()
          .setTitle('🃏 Final Results')
          .setColor(0xff0000)
          .setDescription(
`**Your Hand:** ${formatHand(game.player)} (${pVal})
**Dealer Hand:** ${formatHand(game.dealer)} (${dVal})

${result}`,
          );

        return interaction.update({ embeds: [embed], components: [] });
      }

      // Hit 21 -> auto-stand
      if (pVal === 21) {
        let dVal = handValue(game.dealer);
        while (dVal < 17) {
          game.dealer.push(game.deck.draw());
          dVal = handValue(game.dealer);
        }

        const result = describeResult(pVal, dVal);
        game.isFinished = true;
        blackjackSessions.delete(userId);

        const embed = new EmbedBuilder()
          .setTitle('🃏 Final Results')
          .setColor(0x00ff99)
          .setDescription(
`**Your Hand:** ${formatHand(game.player)} (${pVal})
**Dealer Hand:** ${formatHand(game.dealer)} (${dVal})

${result}`,
          );

        return interaction.update({ embeds: [embed], components: [] });
      }

      // Continue game - only Hit / Stand now (no more Double)
      const dUp = game.dealer[0];
      const embed = new EmbedBuilder()
        .setTitle('🃏 Blackjack')
        .setColor(0x00bfff)
        .setDescription(
`Dealer shows: ${dUp.value}${dUp.suit[0].toUpperCase()}
Your hand: ${formatHand(game.player)} (${pVal})

Hit or Stand?`,
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('bj_hit')
          .setLabel('Hit')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('bj_stand')
          .setLabel('Stand')
          .setStyle(ButtonStyle.Danger),
      );

      return interaction.update({ embeds: [embed], components: [row] });
    }

    // DOUBLE DOWN
    if (customId === 'bj_double') {
      if (game.hasDoubled) {
        return interaction.reply({
          content: 'You already doubled down on this hand.',
          ephemeral: true,
        });
      }

      game.hasDoubled = true;

      // One card only, then auto-stand
      game.player.push(game.deck.draw());
      const pVal = handValue(game.player);

      // Player busts on double
      if (pVal > 21) {
        game.isFinished = true;
        blackjackSessions.delete(userId);

        const dVal = handValue(game.dealer);
        const result = describeResult(pVal, dVal) + ' (after double down)';

        const embed = new EmbedBuilder()
          .setTitle('🃏 Final Results (Double Down)')
          .setColor(0xff0000)
          .setDescription(
`**Your Hand:** ${formatHand(game.player)} (${pVal})
**Dealer Hand:** ${formatHand(game.dealer)} (${dVal})

${result}`,
          );

        return interaction.update({ embeds: [embed], components: [] });
      }

      // Dealer plays out hand
      let dVal = handValue(game.dealer);
      while (dVal < 17) {
        game.dealer.push(game.deck.draw());
        dVal = handValue(game.dealer);
      }

      const result = describeResult(pVal, dVal) + ' (double down)';
      game.isFinished = true;
      blackjackSessions.delete(userId);

      const embed = new EmbedBuilder()
        .setTitle('🃏 Final Results (Double Down)')
        .setColor(0x00ff99)
        .setDescription(
`**Your Hand:** ${formatHand(game.player)} (${pVal})
**Dealer Hand:** ${formatHand(game.dealer)} (${dVal})

${result}`,
        );

      return interaction.update({ embeds: [embed], components: [] });
    }

    // STAND
    if (customId === 'bj_stand') {
      let dVal = handValue(game.dealer);
      while (dVal < 17) {
        game.dealer.push(game.deck.draw());
        dVal = handValue(game.dealer);
      }

      const pVal = handValue(game.player);
      const result = describeResult(pVal, dVal);

      game.isFinished = true;
      blackjackSessions.delete(userId);

      const embed = new EmbedBuilder()
        .setTitle('🃏 Final Results')
        .setColor(0x00ff99)
        .setDescription(
`**Your Hand:** ${formatHand(game.player)} (${pVal})
**Dealer Hand:** ${formatHand(game.dealer)} (${dVal})

${result}`,
        );

      return interaction.update({ embeds: [embed], components: [] });
    }
  },
};
