export class Card {
  // NOTE: These maps could be moved to a storage file later if
  // they become annoying, but let's keep them in here for now.
    static suits = {
      spade: {
        name: 'Spade',
        namePlural: 'Spades',
        unicodeBlack: 'U+2660',
        unicodeLine: 'U+2664',
      },
      heart: {
        name: 'Heart',
        namePlural: 'Hearts',
        unicodeBlack: 'U+2665',
        unicodeLine: 'U+2661',
      },
      diamond: {
        name: 'Diamond',
        namePlural: 'Diamonds',
        unicodeBlack: 'U+2666',
        unicodeLine: 'U+2662',
      },
      club: {
        name: 'Club',
        namePlural: 'Clubs',
        unicodeBlack: 'U+2663',
        unicodeLine: 'U+2667',
      },
    };

    static ranks = {
      game: {
        blackjack: {
          A: {
            value: 1, // 11/10 FIX: Add method/logic to determine if value is 1 or 11
          },
          2: {
            value: 2, // NOTE: Call with [], example: Card.ranks.game.blackjack[2].value;
          },
          3: {
            value: 3,
          },
          4: {
            value: 4,
          },
          5: {
            value: 5,
          },
          6: {
            value: 6,
          },
          7: {
            value: 7,
          },
          8: {
            value: 8,
          },
          9: {
            value: 9,
          },
          10: {
            value: 10,
          },
          J: {
            value: 10, // NOTE: Call with ., example: Card.ranks.game.blackjack.J.value;
          },
          Q: {
            value: 10,
          },
          K: {
            value: 10,
          },
        },
      },
    };

  // NOTE: Cards are generated for specific games.
  // This logic could be placed in game, but this
  // will likely be easier on devs longer term because
  // they can simply pull the value directly from the card
  // instead of adding it to the game logic. Let's try it for now.
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank; // check when auto gen
  }

  static createCards() {

    for(let key in Card.suits) {
      this.suit = Card.suits.key;
      for(let key in Card.ranks.game.blackjack) { // NOTE: Assumes game is blackjack for now.
        this.rank = Card.ranks.key;
      }
    }

    return this;
  }

  toString() {
    return `${this.value} of ${this.suit} with ${this.value}.`;
  }
}
