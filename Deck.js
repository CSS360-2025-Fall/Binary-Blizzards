//
// deck.js responsiblities
// just deck class and logic directly related to the deck
//

//
// START: deck.js update (FIX tabs... :/)
// class Deck {
//  SUIT = ["Spades", "Hearts", "Diamonds", "Clubs"];
//  RANK = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
//
//      constructor() {
//          this.deck = createDeck();
//      }
//
//      createDeck() {
//          const deck = new Array(52);
//          for(let currentSuitIndex = 0; currentSuitIndex < suit.length; currentSuitIndex++) {
//              for(let currentRankIndex = 0; currentRankIndex < rank.length; currentRankIndex) {
//                  deck.push(new Card(suit[currentSuitIndex], rank[currentRankIndex]); // UPDATE: Card
//              }
//          }
//          return deck;
//      }
//      // ADD: shuffled
//      // ADD: draw
// }
// END: deck.js update
//

// // Binary Blizzards Bot - Version 1.1
// //  Deck.js

// class Deck{
//     constructor(){
//         this.cards = [];
        
//     }
//     //populates Cards with their suit, rank, and value
//     createDeck(){
//         for(let i = 0; i < suits.length; i++){
//             for(let j = 0; j < ranks.length; j++){
//                 this.cards.push(new Card(suits[i],ranks[j],values[j]));
//             }
//         }
//     }
//     //shuffles deck -- used ChatGPT for help to write this section
//     shuffleDeck(){
//         for (let i = this.cards.length - 1; i > 0; i--){
//             const j = Math.floor(Math.random() * (i + 1));
//             [this.cards[i],this.cards[j]] = [this.cards[j],this.cards[i]];
//         }
//     }
    
//     // draws card from top of the deck
//     drawCard(){
//         if (this.cards.length == 0) return null;
//         return this.cards.pop();
//     }
    
//     // creates new deck of cards
//     newDeck(){
//         this.createDeck();
//     }
// }



///
/// START: Henry'S Deck - What is being used?
// export class Deck {
//   constructor() {
//     this.cards = [];
//     this._build();
//   }

//   _build() {
//     const suits = ['hearts'];//, 'diamonds', 'clubs', 'spades'];
//     const values = ['A'];//, '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
//     for (const suit of suits) {
//       for (const value of values) {
//         this.cards.push(new Card(suit, value));
//       }
//     }
//   }

//   draw() {
//     const idx = Math.floor(Math.random() * this.cards.length);
//     return this.cards.splice(idx, 1)[0]; // remove + return
//   }

//   remaining() {
//     return this.cards.length;
//   }
// }
/// END: Henry'S Deck - What is being used?
///