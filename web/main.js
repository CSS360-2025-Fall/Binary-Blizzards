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


// --- 2. BLACKJACK GAME LOGIC ---

let bjGame = null;

// Calculates the value of a hand, handling Ace (1 or 11)
function handValue(hand) {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
        // Special case: The Card class stores rank/value. We need to use rank for BJ logic
        let cardValue = card.rank;

        if (['J', 'Q', 'K'].includes(cardValue)) {
            value += 10;
        } else if (cardValue === 'A') {
            value += 11;
            aces++;
        } else {
            value += parseInt(cardValue);
        }
    }

    // Convert Ace from 11 to 1 if the hand busts
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}

// Helper to format a card for display
function formatCard(card, isHidden = false) {
    if (isHidden) return '??';
    const suitMap = {
        Spades: '♠',
        Hearts: '♥',
        Diamonds: '♦',
        Clubs: '♣',
    };
    return `<span class="card-icon">${card.rank}${suitMap[card.suit]}</span>`;
}

// Helper to format an entire hand
function formatHand(hand, hideDealerCard = false) {
    return hand.map((card, index) => {
        // Hide the dealer's second card if hideDealerCard is true
        return formatCard(card, hideDealerCard && index === 1);
    }).join(' ');
}


// --- Blackjack Game Flow Functions ---

window.startGame = function() {
    // Re-use the existing main deck for simplicity in the utility
    if (deck.cards.length < 52) {
      deck.newDeck();
    }
    deck.shuffleDeck();
    
    // Deal initial hands
    const playerHand = [deck.drawCard(), deck.drawCard()];
    const dealerHand = [deck.drawCard(), deck.drawCard()];
    
    // Ensure both initial hands were dealt
    if (!playerHand[0] || !dealerHand[0]) {
      alert("Error: Deck is too small to start a game. Shuffling now.");
      deck.newDeck();
      return;
    }

    bjGame = { deck, playerHand, dealerHand };

    // Update the main deck display since cards were drawn
    updateDeckDisplay();
    updateBlackjackUI('start');
}

window.playerHit = function() {
    if (!bjGame) return;
    
    const newCard = bjGame.deck.drawCard();
    if (!newCard) {
      alert("Deck ran out of cards! Ending game.");
      endGame("Deck empty. Game over.");
      return;
    }

    bjGame.playerHand.push(newCard);
    const pVal = handValue(bjGame.playerHand);
    
    updateDeckDisplay();

    if (pVal > 21) {
        // Player busts
        endGame("Bust! Dealer Wins. 💥");
    } else {
        updateBlackjackUI('hit');
    }
}

window.playerStand = function() {
    if (!bjGame) return;
    
    // Dealer's turn logic
    let dVal = handValue(bjGame.dealerHand);
    
    // Dealer must draw until total is 17 or higher
    while (dVal < 17) {
        const newCard = bjGame.deck.drawCard();
        if (!newCard) break; // Stop if deck runs out
        
        bjGame.dealerHand.push(newCard);
        dVal = handValue(bjGame.dealerHand);
    }
    
    updateDeckDisplay();

    const pVal = handValue(bjGame.playerHand);
    let result = "";

    if (pVal > 21) {
        result = "Player busted. Dealer Wins. 💥";
    } else if (dVal > 21) {
        result = "Dealer busts! You Win! 🎉";
    } else if (pVal > dVal) {
        result = "You Win! 🎉";
    } else if (pVal < dVal) {
        result = "Dealer Wins. 😭";
    } else {
        result = "Push (Tie). 🤝";
    }

    endGame(result);
}

// --- UI Update Functions ---

// Get new DOM elements for Blackjack
const dealerHandEl = document.getElementById('dealerHand');
const playerHandEl = document.getElementById('playerHand');
const messageEl = document.getElementById('bjMessage');
const controlsEl = document.getElementById('bjControls');

function updateBlackjackUI(action) {
    if (!bjGame) return;

    const pVal = handValue(bjGame.playerHand);

    // Initial state or after a 'Hit'
    dealerHandEl.innerHTML = `Dealer Hand: ${formatCard(bjGame.dealerHand[0])} <span class="hidden-card-text">(One hidden card)</span>`;
    playerHandEl.innerHTML = `Player Hand: ${formatHand(bjGame.playerHand)} (Value: **${pVal}**)`;

    messageEl.textContent = "Hit or Stand?";
    controlsEl.innerHTML = `
        <button onclick="playerHit()">Hit</button> 
        <button onclick="playerStand()">Stand</button>
    `;
}

function endGame(resultMessage) {
    if (!bjGame) return;

    const pVal = handValue(bjGame.playerHand);
    const dVal = handValue(bjGame.dealerHand);

    // Show all cards and final values
    dealerHandEl.innerHTML = `Dealer Hand: ${formatHand(bjGame.dealerHand)} (Value: **${dVal}**)`;
    playerHandEl.innerHTML = `Player Hand: ${formatHand(bjGame.playerHand)} (Value: **${pVal}**)`;
    
    messageEl.textContent = `FINAL RESULT: ${resultMessage}`;
    
    // Replace Hit/Stand with a Start button
    controlsEl.innerHTML = `<button onclick="startGame()">Start Blackjack</button>`;
    
    bjGame = null; // Clear game state
}


// --- 3. MAIN INITIALIZATION AND EVENT LISTENERS (Existing Code) ---

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
  // Also clear any previous BJ game state on shuffle
  if (bjGame) endGame("Game Reset by Shuffle.");
  updateDeckDisplay();
});

// Single card draw listener
drawButton.addEventListener('click', () => {
  if (bjGame) endGame("Game Reset by Card Draw.");
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
    if (bjGame) endGame("Game Reset by Card Draw.");

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
