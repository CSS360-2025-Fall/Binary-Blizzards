In the web file, the architecture is split into three main files:
index.html: The structure and content of the web page, introducing the bot's logic.
style.css: The visual presentation and design of the html.
main.js: The core application logic, including the card game simulation.

Client-Server interaction Architecture:

This flowchart shows the path from the server running on a personal machine to the Discord server to the client. 
```mermaid
flowchart LR;
A(["Discord User"])
A-->B{"Discord Server/Discord API"}
B-->C(["Our Discord bot code"])
B-->D(["Our bot server running locally"])
D-->C

```

Code architecture
```mermaid
graph TD
	A[Discord API] --> B[app.js]
	B --> C[commands.js]
	C --> D[game.js]
	D --> E[Deck.js]
	D --> F[card.js]
	B --> G[web/main.js]
	G --> H[index.html/style.css]
	D --> I[utils.js]
```


##### START: Basic Discord Command Path Flowchart
The following flowchart depicts the path a valid command made by a Discord user will travel while using this Bot application.
The client makes a valid command request to Discord. Discord's API sends this request to ngrok's public server.
ngrok's server sends the request along a tunnel to the developer's local server.
The local server will return the response which will travel the same path, but in reverse.


```mermaid
%% Bot Task 4
flowchart TD
    A[Bot app on local machine]<-->B
    B[local web server on machine]<--->|ngrok's secure tunnel| C(ngrok's public server)
    C <--> D[Discord's Gateway API Server]
    D <-->|valid command| E[User]
```
##### END: Basic Discord Command Path Flowchart
