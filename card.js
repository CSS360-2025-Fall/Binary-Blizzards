export class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  toString() {
    return `${this.value} of ${this.suit}`;
  }
}

export class Deck {
  constructor() {
    this.cards = [];
    this._build();
  }

  _build() {
    const suits = ['hearts'];//, 'diamonds', 'clubs', 'spades'];
    const values = ['A'];//, '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    for (const suit of suits) {
      for (const value of values) {
        this.cards.push(new Card(suit, value));
      }
    }
  }

  draw() {
    const idx = Math.floor(Math.random() * this.cards.length);
    return this.cards.splice(idx, 1)[0]; // remove + return
  }

  remaining() {
    return this.cards.length;
  }
}