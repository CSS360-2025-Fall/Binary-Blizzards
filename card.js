export class Card {
  // NOTE:
  // If you need to learn more about these objects, they are called javascript Maps.
  // These maps could be moved to a storage file later if they become annoying,
  // but let's keep them in here for now.
  // Example call: suits.spade.name; returns 'Spade'
    static suits = {
      Spade: {
        name: 'Spade',
        namePlural: 'Spades',
        lowercase: 'spade',
        unicodeBlack: 'U+2660',
        unicodeLine: 'U+2664',
      },
      Heart: {
        name: 'Heart',
        namePlural: 'Hearts',
        lowercase: 'heart',
        unicodeBlack: 'U+2665',
        unicodeLine: 'U+2661',
      },
      Diamond: {
        name: 'Diamond',
        namePlural: 'Diamonds',
        lowercase: 'diamond',
        unicodeBlack: 'U+2666',
        unicodeLine: 'U+2662',
      },
      Club: {
        name: 'Club',
        namePlural: 'Clubs',
        lowercase: 'club',
        unicodeBlack: 'U+2663',
        unicodeLine: 'U+2667',
      },
    };

    // NOTE:
    // Call numerical values with []
    // Example call: Card.rank.value; returns 2
    // Call alpha character(s) with .
    // Example call: Card.rank.name; returns 'Jack'
    static ranks = {
      A: {
        name: 'A',
        value: 1, // 11/10 FIX: Add method/logic to determine if value is 1 or 11
      },
      2: {
        name: '2',
        value: 2,
      },
      3: {
        name: '3',
        value: 3,
      },
      4: {
        name: '4',
        value: 4,
      },
      5: {
        name: '5',
        value: 5,
      },
      6: {
        name: '6',
        value: 6,
      },
      7: {
        name: '7',
        value: 7,
      },
      8: {
        name: '8',
        value: 8,
      },
      9: {
        name: '9',
        value: 9,
      },
      10: {
        name: '10',
        value: 10,
      },
      Jack: {
        name: 'Jack',
        value: 10,
      },
      Queen: {
        name: 'Queen',
        value: 10,
      },
      King: {
        name: 'King',
        value: 10,
      },
      // Joker: {
      //   name: 'Joker'
      //   value: 11, // Include if playing Carnival Variant
      // }
    };

  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank; // check when auto gen
    this.inPlay = false;
  }

  // NOTE: Decided to give this responsibility to Card class.
  // One could make the argument that this creates a deck and should
  // live in the Deck class. That's fair and it could be moved.
  // But, I'd argue that Deck class should be about the Deck's behavior
  // such as shuffling and manipulating the order of card stack.
  static createCards() {
    // A Map object can maintain order, but reordering a Map gets weird.
    // Using an array is slower but allows us to manipulate the order easily.
    let cardStack = [];

    for(let suit in Card.suits) {
      let currentSuit = Card.suits[suit];
      for(let rank in Card.ranks) {
        let currentRank = Card.ranks[rank];
        let currentCard = new Card(currentSuit,  currentRank);
        cardStack.push(currentCard);
      }
    }

    return cardStack;
  }

  static getSuitChoices() {
    return Object.keys(Card.suits);
  }

  static getRankChoices() {
    return Object.keys(Card.ranks);
  }

  toString() {
    return `${this.rank.name} of ${this.suit.name} with ${this.rank.value}.`;
  }
}
