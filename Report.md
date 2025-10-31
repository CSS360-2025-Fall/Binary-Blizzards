# Report - analysis of limitations and weaknesses

## George
- Found an issue through running github copilot in the app.js file
- Issue: The bot's suit-check compared the user's guessed suit (which is normalized to lowercase) against the secret card's suit value without normalizing case, so players who actually guessed the suit would be told they were wrong if casing was different. 
- Made the small fix to make sure a correct guess wouldnt be seen as wrong by the code.

## Kayla

## Cameron
Identified a problem where the user can type in multiple suits and values. We want the user to only be able to type in one of each other wise they will never win the game or get a relevant hint. The solution for this would be to write an if statement that checks the string's length against the maximum length that our suits and values could be. 

## Henry

## Christie

