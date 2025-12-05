# Report - analysis of limitations and weaknesses

## George
- Found an issue through running github copilot in the app.js file
- Issue: The bot's suit-check compared the user's guessed suit (which is normalized to lowercase) against the secret card's suit value without normalizing case, so players who actually guessed the suit would be told they were wrong if casing was different. 
- Made the small fix to make sure a correct guess wouldnt be seen as wrong by the code.

## Kayla
##### npm Static Analysis Tools

The following code analysis focused on running two widely used npm static analysis tools on the first version of a Discord Bot application being developed by a team of five college students. The basecode for the Bot was obtained from an example application provided by the professor and modified by the team.

#### `npm audit`

Note: `retire` was also run but returned the same information as `npm audit` so the results were omitted.

`npm audit` was run on the most updated version of the code, pulled from the main branch on 10/31/25. The following report was generated:

    brace-expansion 1.0.0 - 1.1.11

    brace-expansion Regular Expression Denial of Service vulnerability - [https://github.com/advisories/GHSA-v6h2-p8h4-qcjw](https://github.com/advisories/GHSA-v6h2-p8h4-qcjw)

    fix available via `npm audit fix`

    node_modules/brace-expansion

    1 low severity vulnerability

npm's brace-expansion provides the same functionality as the sh/bash mechanism. Brace expansion uses a pattern to generate arbitrary strings. Some examples where this may be helpful include:

- Creating file names for a project that generates multiple files to avoid overwriting previous files

- Creating names for variables or objects that are automatically generated

Github's Advisory Database entry classifies the vulnerability as a regular expression denial of service (ReDoS). A ReDoS attack exploits inefficient regular expression patterns. If a targeted regex pattern causes strings to exponentially grow, the program will become slow or unresponsive. A patch has been released and can be updated by running `npm audit fix` as stated in the report.

#### `npx eslint`

`npx eslint` was run on the most updated version of the code, pulled from the main branch on 10/31/25; 23 issues were reported.

| Issue | [eslint rule]([https://eslint.org/docs/latest/rules/](https://eslint.org/docs/latest/rules/)) | # of times issue was identified |
| --- | --- | --- |
| Unused variable | [no-unused-vars]([https://eslint.org/docs/latest/rules/no-unused-vars#rule-details](https://eslint.org/docs/latest/rules/no-unused-vars#rule-details)) | 2 |
| Undeclared variable | [no-undef]([https://eslint.org/docs/latest/rules/no-undef#rule-details](https://eslint.org/docs/latest/rules/no-undef#rule-details)) | 21 |

The report showed the project has a number of undeclared variables and a few unused variables. This is to be expected given the project used a boilerplate Discord Bot application as its base and the developers are learning, so they may write test code that is never used or properly declared. Javascript is a forgiving language, so a developer may ignore these details while creating a prototype.

In conclusion, it is recommended `npm audit fix` is run and the project is pushed to main so the patched brace-expansion is visible. The developers can also start the process of removing unused code.
## Cameron
Identified a problem where the user can type in multiple suits and values. We want the user to only be able to type in one of each other wise they will never win the game or get a relevant hint. The solution for this would be to write an if statement that checks the string's length against the maximum length that our suits and values could be. 

## Henry
- Found an player expereience issue through user stories
- Issue: The discord bot accepts any input values from the users (the game only expects correct values and suits of pocker cards). The player can freely input the values which will affect the game experience.
- An input verification has been added, which will alert the player if they make unreasonable inputs.
  
## Christie
- In the web folder, this is a logic flaw: Incorrect Card Values in main.js.
- The Issue: The values array assigns:
    Jack (J) has a value of 11. (Should typically be 10)
    Queen (Q) has a value of 12. (Should typically be 10)
    King (K) has a value of 13. (Should typically be 10)
    Ace (A) has a value of 1. (In games like Blackjack, it often needs to be handled as 1 or 11.)
- The current implementation assigns non-standard values to these cards, which would be incorrect for most traditional card games.
