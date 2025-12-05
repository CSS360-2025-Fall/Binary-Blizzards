// Binary Blizzards Bot - Version 1.1
//  Deck.js

class Deck{
    constructor(){
        this.suits = ["Spades","Hearts","Diamonds","Clubs"];
        this.ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
        this.values = [1,2,3,4,5,6,7,8,9,10,11,12,13];
        this.cards = [];
        
    }
    //populates Cards with their suit, rank, and value
    createDeck(){
        for(let i = 0; i < suits.length; i++){
            for(let j = 0; j < ranks.length; j++){
                this.cards.push(new Card(suits[i],ranks[j],values[j]));
            }
        }
    }
    //shuffles deck -- used ChatGPT for help to write this section
    shuffleDeck(){
        for (let i = this.cards.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i],this.cards[j]] = [this.cards[j],this.cards[i]];
        }
    }
    
    // draws card from top of the deck
    drawCard(){
        if (this.cards.length == 0) return null;
        return this.cards.pop();
    }
    
    // creates new deck of cards
    newDeck(){
        this.createDeck();
    }
}
