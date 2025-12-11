/// main.js

// --- 0. EMBEDDED TAROT DATA ---
const TAROT_CARDS = {
    MajorArcana: [
        {
            name: 'The Fool',
            number: 0,
            arcana: 'Major',
            upright: {
                general: 'New beginnings, innocence, free spirit, taking a leap of faith.',
                advice: 'Go forth and trust your instincts. A new journey is starting.',
            },
            reversed: {
                general: 'Recklessness, risk-taking, held back by fear, poor judgment.',
                advice: 'Delay your start. Sometimes life is defined by the journeys we chose to avoid.',
            },
        },
        {
            name: 'The Empress',
            number: 3,
            arcana: 'Major',
            upright: {
                general: 'Femininity, beauty, nature, nurturing, abundance.',
                advice: 'Embrace creativity and abundance. Nurture your projects and relationships.',
            },
            reversed: {
                general: 'Creative block, dependence on others, neglect of self or home.',
                advice: 'Focus on self-care and independence. You may be blocked creatively.',
            },
        },
        {
            name: 'The Hierophant',
            number: 5,
            arcana: 'Major',
            upright: {
                general: 'Tradition, conformity, spiritual guidance, established beliefs, wisdom.',
                advice: 'Seek advice from a wise mentor or stick to conventional methods.',
            },
            reversed: {
                general: 'Rebellion, unconventionality, new approaches, personal beliefs.',
                advice: 'Challenge the status quo. You may need to find your own path.',
            },
        },
        {
            name: 'The Emperor',
            number: 4,
            arcana: 'Major',
            upright: {
                general: 'Authority, structure, control, father figure, stable leadership.',
                advice: 'Take control and act with discipline. Structure will bring success.',
            },
            reversed: {
                general: 'Domination, excessive control, lack of discipline, reliance on force.',
                advice: 'Avoid being overbearing. Check your motivations for control.',
            },
        },
        {
            name: 'The Lovers',
            number: 6,
            arcana: 'Major',
            upright: {
                general: 'Partnerships, union, choices, harmony, alignment of values.',
                advice: 'A significant decision related to a relationship or partnership is needed.',
            },
            reversed: {
                general: 'Disharmony, imbalance, misalignment of values, bad choices in relationship.',
                advice: 'Address internal or external conflicts preventing harmony.',
            },
        }
    ],
};

// Wordle words
const WORDLE_WORDS = ["apple","table","water","mouse","candy","peace","light","sound","train","plant","world","smart","heart"];

// --- 1. CARD AND DECK LOGIC ---
class Card {
    constructor(suit, rank, value) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
    }
    toString() {
        return `${this.rank} of ${this.suit}`;
    }
}

class Deck {
    constructor() {
        this.suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
        this.ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        this.values = [11,2,3,4,5,6,7,8,9,10,10,10,10];
        this.cards = [];
        this.newDeck();
    }

    createDeck() {
        this.cards = [];
        for (let suit of this.suits) {
            for (let i=0; i<this.ranks.length; i++) {
                this.cards.push(new Card(suit, this.ranks[i], this.values[i]));
            }
        }
    }

    shuffle() {
        for (let i=this.cards.length-1; i>0; i--) {
            const j = Math.floor(Math.random()*(i+1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    newDeck() {
        this.createDeck();
        this.shuffle();
    }

    drawCard() {
        return this.cards.pop();
    }

    drawCards(count) {
        const drawn = [];
        for (let i=0; i<count && this.cards.length>0; i++) {
            drawn.push(this.drawCard());
        }
        return drawn;
    }

    cardsRemaining() {
        return this.cards.length;
    }
}

const deck = new Deck();

// --- 2. GAME STATE ---
let bjGame = false;
let playerHand = [];
let dealerHand = [];
let playerBank = 1000;
let currentBet = 0;

let wordleGame = {
    answer: WORDLE_WORDS[Math.floor(Math.random()*WORDLE_WORDS.length)],
    attempts: 0,
    finished: false
};

// --- 3. UTILITY FUNCTIONS ---
function calculateHandValue(hand) {
    let value = 0;
    let aceCount = 0;
    for (const card of hand) {
        if (card.rank === "A") aceCount++;
        value += card.value;
    }
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    return value;
}

function handToString(hand, hideDealerCard=false) {
    if (hand.length===0) return "-";
    if (hideDealerCard && hand.length>1) {
        const visible = hand[0];
        let val = visible.value;
        if (visible.rank==="A") val=11;
        return `${visible.toString()}, [Hidden Card] (Showing: ${val})`;
    } else {
        const str = hand.map(c=>c.toString()).join(', ');
        return `${str} (Total: ${calculateHandValue(hand)})`;
    }
}

function endGame(message, result='none') {
    bjGame = false;
    updateBlackjackDisplay(false);
    if (result==='win') {
        playerBank += currentBet;
        message += ` | WIN! +$${currentBet}, Bank: $${playerBank}`;
    } else if (result==='loss') {
        playerBank -= currentBet;
        message += ` | LOSS! -$${currentBet}, Bank: $${playerBank}`;
    } else if (result==='push') {
        message += ` | PUSH, Bank: $${playerBank}`;
    } else {
        message += ` Bank: $${playerBank}`;
    }
    bjMessageEl.textContent = `Bot Output: ${message}`;
    currentBet=0;
    demoHitButton.style.display='none';
    demoStandButton.style.display='none';
    demoResetButton.style.display='block';
    demoStartButton.style.display='inline-block';
}

function dealerTurn() {
    bjMessageEl.textContent = `Bot Output: Player stands at ${calculateHandValue(playerHand)}. Dealer plays...`;
    let dealerValue = calculateHandValue(dealerHand);
    while(dealerValue<17){
        dealerHand.push(deck.drawCard());
        dealerValue = calculateHandValue(dealerHand);
    }
    const playerValue = calculateHandValue(playerHand);
    let message, result;
    if (dealerValue>21 || playerValue>dealerValue) { message=`Player wins!`; result='win'; }
    else if (dealerValue>playerValue) { message=`Dealer wins.`; result='loss'; }
    else { message=`Push!`; result='push'; }
    endGame(message, result);
}

function evaulateGuess(guess, answer) {
    let result = '';
    let arr = answer.split('');
    for (let i=0;i<5;i++) {
        if (guess[i]===answer[i]) { result+='🟩'; arr[i]=null; }
        else { result+='_'; }
    }
    let finalResult='';
    for (let i=0;i<5;i++){
        if(result[i]==='🟩') finalResult+='🟩';
        else if(arr.includes(guess[i])) { finalResult+='🟨'; arr[arr.indexOf(guess[i])]=null; }
        else finalResult+='⬛';
    }
    return finalResult;
}

function randomWord() { return WORDLE_WORDS[Math.floor(Math.random()*WORDLE_WORDS.length)]; }

// --- 4. DOMContentLoaded: all DOM access and listeners ---
document.addEventListener("DOMContentLoaded", () => {
    // --- DOM ELEMENTS ---
    const cardsRemainingSpan = document.getElementById('cards-remaining');
    const drawnCardSpan = document.getElementById('drawn-card');
    const shuffleButton = document.getElementById('shuffle-deck');
    const drawButton = document.getElementById('draw-card');
    const multiDrawButton = document.getElementById('multi-draw-button');
    const drawCountInput = document.getElementById('draw-count');

    const dealerHandEl = document.getElementById('dealerHand');
    const playerHandEl = document.getElementById('playerHand');
    const bjMessageEl = document.getElementById('bjMessage');
    const playerBankDemoEl = document.getElementById('playerBankDemo');

    const demoStartButton = document.getElementById('demo-bj-start-button');
    const demoHitButton = document.getElementById('demo-hit-button');
    const demoStandButton = document.getElementById('demo-stand-button');
    const demoResetButton = document.getElementById('demo-reset-button');
    const bjBetInput = document.getElementById('bj-bet-input');

    const fetchDadJokeButton = document.getElementById('fetch-dadjoke');
    const fetchEmojiButton = document.getElementById('fetch-emoji');
    const jokeDisplaySpan = document.getElementById('joke-display');

    const drawTarotButton = document.getElementById('draw-tarot-card');
    const tarotCardDisplaySpan = document.getElementById('tarot-card-display');
    const tarotMeaningDisplaySpan = document.getElementById('tarot-meaning-display');

    const wordleInput = document.getElementById("wordle-input");
    const wordleSubmit = document.getElementById("wordle-submit");
    const wordleStatus = document.getElementById("wordle-status");
    const wordleBoard = document.getElementById("wordle-board");

    // --- BLACKJACK LISTENERS ---
    demoStartButton.addEventListener('click', ()=>{
        let bet = parseInt(bjBetInput.value);
        if(isNaN(bet) || bet<=0) bet=50;
        if(playerBank<bet){ bjMessageEl.textContent=`Bot Output: Not enough money.`; return; }
        currentBet=bet; bjGame=true; deck.newDeck(); playerHand=[]; dealerHand=[];
        playerHand.push(deck.drawCard(), deck.drawCard());
        dealerHand.push(deck.drawCard(), deck.drawCard());
        updateBlackjackDisplay(true);
        const val = calculateHandValue(playerHand);
        if(val===21){ dealerTurn(); return; }
        bjMessageEl.textContent=`Bot Output: Game started. Hand Value: ${val}`;
        demoStartButton.style.display='none';
        demoHitButton.style.display='inline-block';
        demoStandButton.style.display='inline-block';
        demoResetButton.style.display='none';
    });

    demoHitButton.addEventListener('click', ()=>{
        if(!bjGame) return;
        playerHand.push(deck.drawCard());
        updateBlackjackDisplay(true);
        const val=calculateHandValue(playerHand);
        if(val>21) endGame(`Bust!`, 'loss');
        else if(val===21) dealerTurn();
        else bjMessageEl.textContent=`Bot Output: You HIT. Hand Value: ${val}`;
    });

    demoStandButton.addEventListener('click', ()=>{ if(bjGame) dealerTurn(); });

    demoResetButton.addEventListener('click', ()=>{
        playerHand=[]; dealerHand=[]; currentBet=0;
        updateBlackjackDisplay(false);
        bjMessageEl.textContent=`Bot Output: Demo reset. Bank: $${playerBank}`;
        demoStartButton.style.display='inline-block';
        demoResetButton.style.display='none';
        demoHitButton.style.display='none';
        demoStandButton.style.display='none';
    });

    // --- DECK LISTENERS ---
    shuffleButton.addEventListener('click', ()=>{
        deck.newDeck();
        drawnCardSpan.textContent='Deck shuffled!';
        if(bjGame) endGame("Reset by deck shuffle.", 'none');
        updateBlackjackDisplay();
    });

    drawButton.addEventListener('click', ()=>{
        if(bjGame) endGame("Reset by card draw.", 'none');
        const card = deck.drawCard();
        drawnCardSpan.textContent = card? `Drew 1 card: ${card.toString()}` : 'Deck empty!';
        updateBlackjackDisplay();
    });

    multiDrawButton.addEventListener('click', ()=>{
        if(bjGame) endGame("Reset by card draw.", 'none');
        const count = parseInt(drawCountInput.value);
        if(isNaN(count) || count<=0){ drawnCardSpan.textContent='Enter valid count'; return; }
        const cards = deck.drawCards(count);
        drawnCardSpan.textContent = cards.length>0? `Drew ${cards.length}: ${cards.map(c=>c.toString()).join(', ')}` : 'Deck empty!';
        updateBlackjackDisplay();
    });

    // --- UTILITY LISTENERS ---
    fetchDadJokeButton.addEventListener('click', async ()=>{
        jokeDisplaySpan.textContent="Fetching joke...";
        try{
            const res = await fetch('https://icanhazdadjoke.com/', { headers:{Accept:'application/json'}});
            const data = await res.json();
            jokeDisplaySpan.textContent=data.joke || "No joke.";
        } catch(e){ jokeDisplaySpan.textContent="Error fetching joke."; }
        tarotCardDisplaySpan.textContent='Click to draw tarot.';
        tarotMeaningDisplaySpan.textContent='';
    });

    fetchEmojiButton.addEventListener('click', ()=>{
        const emojis = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','🍕','🎉','💻','💡'];
        jokeDisplaySpan.textContent = `Random emoji: ${emojis[Math.floor(Math.random()*emojis.length)]}`;
        tarotCardDisplaySpan.textContent='Click to draw tarot.';
        tarotMeaningDisplaySpan.textContent='';
    });

    drawTarotButton.addEventListener('click', ()=>{
        jokeDisplaySpan.textContent='Click a button to start!';
        const cards = TAROT_CARDS.MajorArcana;
        if(cards.length===0){ tarotCardDisplaySpan.textContent='No cards.'; return; }
        const card = cards[Math.floor(Math.random()*cards.length)];
        const isReversed = Math.random()<0.5;
        const direction = isReversed?'reversed':'upright';
        const reading = card[direction].general || `General meaning of ${card.name}`;
        const name = isReversed? `${card.name} (Reversed)` : card.name;
        tarotCardDisplaySpan.innerHTML=`<strong>${name}</strong> (#${card.number} ${card.arcana} Arcana)`;
        tarotMeaningDisplaySpan.textContent=reading;
    });

    // --- WORDLE LISTENER ---
    wordleSubmit.addEventListener('click', ()=>{
        const guess = wordleInput.value.toLowerCase();
        if(guess.length!==5){ wordleStatus.textContent='Guess 5 letters'; return; }
        if(wordleGame.finished){ wordleStatus.textContent='Game over. Refresh.'; return; }
        wordleGame.attempts++;
        const feedback = evaulateGuess(guess, wordleGame.answer);
        wordleBoard.textContent += feedback + "\n";
        if(guess===wordleGame.answer){ wordleGame.finished=true; wordleStatus.textContent=`🎉 Correct!`; return; }
        if(wordleGame.attempts>=6){ wordleGame.finished=true; wordleStatus.textContent=`❌ Out of attempts. Word was ${wordleGame.answer}`; return; }
        wordleStatus.textContent=`Guess ${wordleGame.attempts}/6`;
        wordleInput.value='';
    });

    // --- INITIAL UPDATE ---
    function updateBlackjackDisplay(hideDealer=true){
        cardsRemainingSpan.textContent=deck.cardsRemaining();
        dealerHandEl.innerHTML=`Dealer Hand: <strong>${handToString(dealerHand, hideDealer)}</strong>`;
        playerHandEl.innerHTML=`Your Hand: <strong>${handToString(playerHand)}</strong>`;
        playerBankDemoEl.innerHTML=`Player Bank: $${playerBank} | Current Bet: $${currentBet}`;
    }

    updateBlackjackDisplay(false);
});

