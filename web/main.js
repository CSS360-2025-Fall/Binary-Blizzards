// main.js

// --- 1. ADAPTED LOGIC from Deck.js (Card Deck) ---

// Simple Card class
class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
    }
    // Shows rank, suit, and corrected value
    toString() {
        return `${this.rank} of ${this.suit} (Value: ${this.value})`;
    }
}

class Deck {
    constructor() {
        this.suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
        this.ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        // Standard card values: A=1, 2-9=face value, 10/J/Q/K = 10
        this.values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]; 
        this.cards = [];
        this.newDeck();
    }
    
    // Creates the initial 52 cards
    createDeck() {
        this.cards = [];
        for (let i = 0; i < this.suits.length; i++) {
            for (let j = 0; j < this.ranks.length; j++) {
                // j is the index for both rank and the fixed value
                this.cards.push(new Card(this.suits[i], this.ranks[j], this.values[j]));
            }
        }
    }
    
    // Shuffles deck (Fisher-Yates algorithm)
    shuffleDeck() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    /**
     * Draws a single card from the top of the deck.
     * @returns {Card | null}
     */
    drawCard() {
        if (this.cards.length === 0) return null;
        return this.cards.pop();
    }

    /**
     * Draws a specified number of cards from the top of the deck.
     * @param {number} count The number of cards to draw.
     * @returns {Card[]} An array of drawn cards.
     */
    drawCards(count = 1) {
        const drawn = [];
        const actualCount = Math.min(count, this.cards.length); // Don't over-draw
        
        for (let i = 0; i < actualCount; i++) {
            drawn.push(this.cards.pop());
        }
        return drawn;
    }
    
    // Recreates and shuffles the deck
    newDeck() {
        this.createDeck();
        this.shuffleDeck();
    }
}

// --- 2. MAIN INITIALIZATION AND EVENT LISTENERS ---

// Card Deck Initialization and DOM elements
const deck = new Deck();
const cardsRemainingSpan = document.getElementById('cards-remaining');
const drawnCardSpan = document.getElementById('drawn-card');
const shuffleButton = document.getElementById('shuffle-deck');
const drawButton = document.getElementById('draw-card'); 
const multiDrawButton = document.getElementById('multi-draw-button'); 
const drawCountInput = document.getElementById('draw-count'); 

function updateDeckDisplay() {
  cardsRemainingSpan.textContent = deck.cards.length;
}

shuffleButton.addEventListener('click', () => {
  deck.newDeck();
  drawnCardSpan.textContent = 'Deck shuffled! Draw a card.';
  updateDeckDisplay();
});

// Single card draw listener
drawButton.addEventListener('click', () => {
  const card = deck.drawCard();
  if (card) {
    drawnCardSpan.textContent = `Drew 1 card: ${card.toString()}`;
  } else {
    drawnCardSpan.textContent = 'Deck is empty! Shuffle to restart.';
  }
  updateDeckDisplay();
});

// Multi-card draw listener
multiDrawButton.addEventListener('click', () => {
    const count = parseInt(drawCountInput.value, 10);
    
    // Input validation
    if (isNaN(count) || count <= 0) {
        drawnCardSpan.textContent = 'Please enter a valid number of cards to draw (1 or more).';
        return;
    }
    
    const drawnCards = deck.drawCards(count);

    if (drawnCards.length > 0) {
        // Concatenate card details for display
        const cardStrings = drawnCards.map(card => card.toString()).join(', ');
        drawnCardSpan.textContent = `Drew ${drawnCards.length} cards: ${cardStrings}`;
    } else {
        drawnCardSpan.textContent = 'Deck is empty! Shuffle to restart.';
    }

    updateDeckDisplay();
    drawCountInput.value = ''; // Clear input after successful draw
});


// Initial display setup
updateDeckDisplay();
```eof
