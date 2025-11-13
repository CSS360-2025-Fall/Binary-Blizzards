export class Card {
  // NOTE:
  // If you need to learn more about these objects, they are called javascript Maps.
  // These maps could be moved to a storage file later if they become annoying,
  // but let's keep them in here for now.
  // Example call: suits.spade.name; returns 'Spade'
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

    // NOTE:
    // Call numerical values with []
    // Example call: Card.ranks.game.blackjack[2].value; returns 2
    // Call alpha character(s) with .
    // Example call: Card.ranks.game.blackjack.J.value; returns 10
    static ranks = {
      game: {
        blackjack: {
          A: {
            value: 1, // 11/10 FIX: Add method/logic to determine if value is 1 or 11
          },
          2: {
            value: 2,
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
            value: 10,
          },
          Q: {
            value: 10,
          },
          K: {
            value: 10,
          },
          // Joker: {
          //   value: 11, // Include if playing Carnival Variant
          // }
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
    this.rank = suit; // check when auto gen
  }

  // NOTE: Decided to give this responsibility to Card class.
  // One could make the arguement that this creates a deck and should
  // live in the Deck class. That's fair and it could be moved.
  // But, I'd argue that Deck class should be about the Deck's behavior
  // such as shuffling and manipulating the order of card stack.
  static createCards() {

    // A Map object can maintain order, but reordering a Map gets weird.
    // Using an array is slower but allows us to manipulate the order easily.
    let cardStack = [];

    for(let suit in Card.suits) {
      let currentSuit = Card.suits[suit];
      for(let rank in Card.ranks.game.blackjack) { // FIX: Assumes game is blackjack for now.
        let currentRank = Card.ranks[rank];
        let currentCard = new Card(currentSuit,  currentRank);
        cardStack.push(currentCard);
      }
    }
    return cardStack;
  }

  toString() {
    return `${this.value} of ${this.suit} with ${this.value}.`;
  }
}
