// main.js

// --- 1. CARD DECK LOGIC ---

/**
 * Represents a single playing card.
 */
class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
    }
    // Returns the card name (e.g., "A of Spades")
    toString() {
        return `${this.rank} of ${this.suit}`;
    }
}

/**
 * Represents a standard 52-card deck with shuffling and drawing capabilities.
 */
class Deck {
    constructor() {
        this.suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
        this.ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        // Initial values: A=11 (handled dynamically in BJ), 2-9=face, 10/J/Q/K=10
        this.values = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]; 
        this.cards = [];
        this.newDeck();
    }
    
    // Creates the initial 52 cards
    createDeck() {
        this.cards = [];
        for (let i = 0; i < this.suits.length; i++) {
            for (let j = 0; j < this.ranks.length; j++) {
                this.cards.push(new Card(this.suits[i], this.ranks[j], this.values[j]));
            }
        }
    }

    // Shuffles the cards using the Fisher-Yates algorithm
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // Creates and shuffles a new deck
    newDeck() {
        this.createDeck();
        this.shuffle();
    }

    // Draws the top card from the deck
    drawCard() {
        return this.cards.pop();
    }
    
    // Draws multiple cards
    drawCards(count) {
        const drawn = [];
        for (let i = 0; i < count && this.cards.length > 0; i++) {
            drawn.push(this.drawCard());
        }
        return drawn;
    }

    cardsRemaining() {
        return this.cards.length;
    }
}

const deck = new Deck();

// --- 2. DOM ELEMENTS AND INITIAL SETUP ---

// General Utility Elements
const cardsRemainingSpan = document.getElementById('cards-remaining');
const drawnCardSpan = document.getElementById('drawn-card');
const shuffleButton = document.getElementById('shuffle-deck');
const drawButton = document.getElementById('draw-card');
const multiDrawButton = document.getElementById('multi-draw-button');
const drawCountInput = document.getElementById('draw-count');

// Blackjack Demo Elements
const dealerHandEl = document.getElementById('dealerHand');
const playerHandEl = document.getElementById('playerHand');
const bjMessageEl = document.getElementById('bjMessage');
const playerBankDemoEl = document.getElementById('playerBankDemo');

const demoStartButton = document.getElementById('demo-bj-start-button');
const demoHitButton = document.getElementById('demo-hit-button');
const demoStandButton = document.getElementById('demo-stand-button');
const demoResetButton = document.getElementById('demo-reset-button');
const bjBetInput = document.getElementById('bj-bet-input');


// --- 3. BLACKJACK STATE AND CORE LOGIC ---

let bjGame = false;
let playerHand = [];
let dealerHand = [];
let playerBank = 1000; // Starting bank for demo (Simulating /balance state)
let currentBet = 0;

/**
 * Calculates the value of a hand, handling Aces dynamically (1 or 11).
 * @param {Array<Card>} hand 
 * @returns {number} The total hand value.
 */
function calculateHandValue(hand) {
    let value = 0;
    let aceCount = 0;
    
    for (const card of hand) {
        if (card.rank === "A") {
            aceCount++;
        }
        value += card.value; 
    }

    // Convert Aces from 11 to 1 if the total exceeds 21
    while (value > 21 && aceCount > 0) {
        value -= 10; 
        aceCount--;
    }

    return value;
}

/**
 * Converts a hand array into a display string.
 * @param {Array<Card>} hand 
 * @param {boolean} hideDealerCard - True to hide the dealer's second card.
 * @returns {string} Formatted hand string.
 */
function handToString(hand, hideDealerCard = false) {
    if (hand.length === 0) return "-";
    
    if (hideDealerCard && hand.length > 1) {
        const visibleCard = hand[0];
        // Calculate visible value based on the first card
        let visibleValue = visibleCard.value;
        if (visibleCard.rank === "A") visibleValue = 11;

        return `${visibleCard.toString()}, [Hidden Card] (Showing: ${visibleValue})`;
    } else {
        const cardStrings = hand.map(card => card.toString()).join(', ');
        const value = calculateHandValue(hand);
        return `${cardStrings} (Total: ${value})`;
    }
}

/**
 * Updates the Deck and Blackjack display elements, including the simulated /balance.
 * @param {boolean} hideDealer - Whether to hide the dealer's second card.
 */
function updateBlackjackDisplay(hideDealer = true) {
    cardsRemainingSpan.textContent = deck.cardsRemaining();
    
    // Bot Output Hand Displays
    dealerHandEl.innerHTML = `Dealer Hand: <strong>${handToString(dealerHand, hideDealer)}</strong>`;
    playerHandEl.innerHTML = `Your Hand: <strong>${handToString(playerHand)}</strong>`;

    // Bot Output Balance Display (Simulating /balance command output)
    playerBankDemoEl.innerHTML = `Player Bank: $${playerBank} | Current Bet: $${currentBet}`;
}

/**
 * Ends the Blackjack game, calculates winnings/losses, and updates the bank.
 * @param {string} message - The outcome message.
 * @param {('win'|'loss'|'push'|'none')} result - The game outcome.
 */
function endGame(message, result = 'none') {
    bjGame = false;
    
    updateBlackjackDisplay(false); // Reveal dealer's hand
    
    // Update bank based on result (simulating the bot's currency logic)
    if (result === 'win') {
        playerBank += currentBet;
        message = `${message} | **WIN!** You won $${currentBet}. New Bank: $${playerBank}`;
    } else if (result === 'loss') {
        playerBank -= currentBet;
        message = `${message} | **LOSS!** You lost $${currentBet}. New Bank: $${playerBank}`;
    } else if (result === 'push') {
        // Bet is returned, bank doesn't change
        message = `${message} | **PUSH** (Bet returned). Bank: $${playerBank}`;
    } else {
        // 'none' or reset
        message = `${message} Bank: $${playerBank}`;
    }
    
    bjMessageEl.textContent = `Bot Output: ${message}`;
    
    // Reset controls for new game
    currentBet = 0; 
    demoHitButton.style.display = 'none';
    demoStandButton.style.display = 'none';
    demoResetButton.style.display = 'block';
    demoStartButton.style.display = 'inline-block';
}

/**
 * Executes the dealer's turn after the player stands or gets Blackjack/21.
 */
function dealerTurn() {
    bjMessageEl.textContent = `Bot Output: Player stands at ${calculateHandValue(playerHand)}. Dealer plays...`;
    
    let dealerValue = calculateHandValue(dealerHand);
    
    // Dealer must hit until 17 or higher
    while (dealerValue < 17) {
        dealerHand.push(deck.drawCard());
        dealerValue = calculateHandValue(dealerHand);
    }

    const playerValue = calculateHandValue(playerHand);

    let message;
    let result;
    if (dealerValue > 21) {
        message = `Dealer busts with ${dealerValue}. Player wins!`;
        result = 'win';
    } else if (playerValue > dealerValue) {
        message = `Player ${playerValue} beats Dealer ${dealerValue}. Player wins!`;
        result = 'win';
    } else if (dealerValue > playerValue) {
        message = `Dealer ${dealerValue} beats Player ${playerValue}. Dealer wins.`;
        result = 'loss';
    } else {
        message = `Push! Both are ${playerValue}.`;
        result = 'push';
    }
    endGame(message, result);
}

// --- 4. EVENT LISTENERS FOR BOT COMMANDS (Simulating interactions) ---

// Simulates /bj start [bet] command
demoStartButton.addEventListener('click', () => {
    // 1. Parse bet amount
    let betAmount = parseInt(bjBetInput.value, 10);
    
    // Use default bet if input is invalid
    if (isNaN(betAmount) || betAmount <= 0) {
        betAmount = 50; 
    }

    // 2. Check bank (Simulating bot permission check)
    if (playerBank < betAmount) {
        bjMessageEl.textContent = `Bot Output: Error. Cannot start game. You only have $${playerBank}. Bet must be <= $${playerBank}.`;
        return;
    }

    // 3. Initialize game state
    currentBet = betAmount;
    bjGame = true;
    deck.newDeck(); 
    playerHand = [];
    dealerHand = [];
    
    // 4. Deal initial cards (Player, Dealer, Player, Dealer)
    playerHand.push(deck.drawCard());
    dealerHand.push(deck.drawCard());
    playerHand.push(deck.drawCard());
    dealerHand.push(deck.drawCard());
    
    updateBlackjackDisplay(true);
    
    const playerValue = calculateHandValue(playerHand);
    
    // 5. Check for instant Blackjack
    if (playerValue === 21) {
        bjMessageEl.textContent = `Bot Output: **BJ START successful!** Bet of $${currentBet} placed. Blackjack! Dealer plays...`;
        dealerTurn();
        return;
    }
    
    // 6. Ready for player action
    // Updated message to reflect component actions (HIT/STAND)
    bjMessageEl.textContent = `Bot Output: **BJ START successful!** Bet of $${currentBet} placed. Current Hand Value: ${playerValue}. **Next Action: HIT or STAND**`;
    
    // 7. Toggle control visibility
    demoStartButton.style.display = 'none';
    demoHitButton.style.display = 'inline-block';
    demoStandButton.style.display = 'inline-block';
    demoResetButton.style.display = 'none';
});

// Simulates the 'HIT' game action/component interaction
demoHitButton.addEventListener('click', () => {
    if (!bjGame) return;
    
    playerHand.push(deck.drawCard());
    updateBlackjackDisplay(true);
    
    const playerValue = calculateHandValue(playerHand);
    
    if (playerValue > 21) {
        endGame(`Player busts with ${playerValue}. Dealer wins.`, 'loss');
    } else if (playerValue === 21) {
        dealerTurn(); 
    } else {
        // Message updated
        bjMessageEl.textContent = `Bot Output: You HIT and drew ${playerHand[playerHand.length-1].toString()}. New Hand Value: ${playerValue}. **Next Action: HIT or STAND**`;
    }
});

// Simulates the 'STAND' game action/component interaction
demoStandButton.addEventListener('click', () => {
    if (!bjGame) return;
    dealerTurn();
});

// Simulates a demo reset
demoResetButton.addEventListener('click', () => {
    playerHand = [];
    dealerHand = [];
    currentBet = 0;
    updateBlackjackDisplay(false);
    // Message updated
    bjMessageEl.textContent = `Bot Output: Demo Reset. Use the **'/bj start'** command to begin a new game! Current Bank: $${playerBank}.`;
    
    // Reset control visibility
    demoStartButton.style.display = 'inline-block';
    demoResetButton.style.display = 'none';
    demoHitButton.style.display = 'none';
    demoStandButton.style.display = 'none';
});

// --- 5. LISTENERS FOR GENERAL UTILITY (Simulating /shuffle, /draw) ---

// Shuffle Deck listener (Simulates /shuffle)
shuffleButton.addEventListener('click', () => {
  deck.newDeck();
  drawnCardSpan.textContent = 'Deck shuffled! Draw a card.';
  // Also clear any previous BJ game state on shuffle
  if (bjGame) endGame("Game Reset by Deck Shuffle.", 'none'); 
  updateBlackjackDisplay();
});

// Single card draw listener (Simulates /draw 1)
drawButton.addEventListener('click', () => {
  if (bjGame) endGame("Game Reset by Card Draw.", 'none');
  const card = deck.drawCard();
  if (card) {
    drawnCardSpan.textContent = `Drew 1 card: ${card.toString()}`;
  } else {
    drawnCardSpan.textContent = 'Deck is empty! Shuffle to restart.';
  }
  updateBlackjackDisplay();
});

// Multi-card draw listener (Simulates /draw [count])
multiDrawButton.addEventListener('click', () => {
    if (bjGame) endGame("Game Reset by Card Draw.", 'none');

    const count = parseInt(drawCountInput.value, 10);
    
    if (isNaN(count) || count <= 0) {
        drawnCardSpan.textContent = 'Please enter a valid number of cards to draw (1 or more).';
        return;
    }
    
    const drawnCards = deck.drawCards(count);

    if (drawnCards.length > 0) {
        const cardStrings = drawnCards.map(card => card.toString()).join(', ');
        drawnCardSpan.textContent = `Drew ${drawnCards.length} cards: ${cardStrings}`;
    } else {
        drawnCardSpan.textContent = 'Deck is empty! Shuffle to restart.';
    }
    updateBlackjackDisplay();
});

// Initial load update
updateBlackjackDisplay(false);
