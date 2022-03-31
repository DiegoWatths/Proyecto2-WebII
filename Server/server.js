const express =  require('express');
const app =  express();
const path = require('path');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3900

var moves = ['placeholder'];
var currentPlayers = [];
var game = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']];
var hasPlayer1 = false;
var hasPlayer2 = false;
var gameCounter = 1;

function getRandomInt() {
    return Math.floor(Math.random() * 50);
  }

app.use(express.static('public'));

app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, '/public/index.html'));
})

io.on('connection', function(socket){
    console.log(`Un usuario de id = ${socket.id} se ha unido`);

    if(!hasPlayer1){
        if(!hasPlayer2){
            const ran = getRandomInt()%2; //<-- 50% chance of being either player 1 or 2, based on whether getRandomInt() returns an even or odd number, respectively

            if(ran == 0){
                currentPlayers.push(setPlayer(socket.id, 1));
                hasPlayer1 = true;
            } 
            else {
                currentPlayers.push(setPlayer(socket.id, 2));
                hasPlayer2 = true;
            }
        }else{
            currentPlayers.push(setPlayer(socket.id, 1));
            hasPlayer1 = true;
        } 
    }else{
        if(!hasPlayer2){            
            currentPlayers.push(setPlayer(socket.id, 2));
            hasPlayer2 = true;
        }else{
            console.log(`Spectator: ${socket.id} ♫`);
        }
    }

    const index = currentPlayers.findIndex(object => {
        return object.id === socket.id;
      });
    console.log(`index = ${index} y cp = ${currentPlayers[index]}`);
    io.emit('userData', currentPlayers[index])

    socket.on('Move', function(arg){
        console.log(`El jugador ${arg.Player} hizo una movida al cubiculo #${arg.Position}`);
        
        if(!(moves.length == 0)){
            if(!(arg.Player == moves[moves.length - 1].Player)){
                moves.push(arg)
                buildGame(moves[moves.length - 1])
                gameCounter++;
            }
        }else{
            moves.push(arg);
            buildGame(moves[0])
        }
        
        io.emit("resetTurns", "please")
    })

    socket.on('disconnect', () => {
        console.log(`${socket.id} se desconectó...`);
        const index = currentPlayers.findIndex(object => {
            return object.id === socket.id;
        });
        
        currentPlayers[index].piece == 'X' ? hasPlayer1 = false : hasPlayer2 = false;
        currentPlayers.splice(index, 1);

        if (currentPlayers.length == 0) game = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']];
    })

    socket.on('reset', () =>{
        game = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']];
        io.emit('Game', game);
    })
})


function buildGame(move) {
    console.log(move);

    switch(move.Player){
        case currentPlayers[0].id: 
            console.log(`Fue ${currentPlayers[0].id}`);
            switch(move.Position){
                case 1: currentPlayers[0].piece == 'X' ? game[0][0] = 'X' : game[0][0] = 'O'; break; //condition ? true : false ;
                case 2: currentPlayers[0].piece == 'X' ? game[0][1] = 'X' : game[0][1] = 'O'; break;
                case 3: currentPlayers[0].piece == 'X' ? game[0][2] = 'X' : game[0][2] = 'O'; break;
                case 4: currentPlayers[0].piece == 'X' ? game[1][0] = 'X' : game[1][0] = 'O'; break;
                case 5: currentPlayers[0].piece == 'X' ? game[1][1] = 'X' : game[1][1] = 'O'; break;
                case 6: currentPlayers[0].piece == 'X' ? game[1][2] = 'X' : game[1][2] = 'O'; break;
                case 7: currentPlayers[0].piece == 'X' ? game[2][0] = 'X' : game[2][0] = 'O'; break;
                case 8: currentPlayers[0].piece == 'X' ? game[2][1] = 'X' : game[2][1] = 'O'; break;
                case 9: currentPlayers[0].piece == 'X' ? game[2][2] = 'X' : game[2][2] = 'O'; break;
                default: console.log("ERROR JUGADA INVÁLIDA"); break;
            }
            sendGame(game);
            break;
        case currentPlayers[1].id: 
            console.log(`Fue ${currentPlayers[1].id}`); 
            switch(move.Position){
                case 1: currentPlayers[1].piece == 'X' ? game[0][0] = 'X' : game[0][0] = 'O'; break;
                case 2: currentPlayers[1].piece == 'X' ? game[0][1] = 'X' : game[0][1] = 'O'; break;
                case 3: currentPlayers[1].piece == 'X' ? game[0][2] = 'X' : game[0][2] = 'O'; break;
                case 4: currentPlayers[1].piece == 'X' ? game[1][0] = 'X' : game[1][0] = 'O'; break;
                case 5: currentPlayers[1].piece == 'X' ? game[1][1] = 'X' : game[1][1] = 'O'; break;
                case 6: currentPlayers[1].piece == 'X' ? game[1][2] = 'X' : game[1][2] = 'O'; break;
                case 7: currentPlayers[1].piece == 'X' ? game[2][0] = 'X' : game[2][0] = 'O'; break;
                case 8: currentPlayers[1].piece == 'X' ? game[2][1] = 'X' : game[2][1] = 'O'; break;
                case 9: currentPlayers[1].piece == 'X' ? game[2][2] = 'X' : game[2][2] = 'O'; break;
                default: console.log("ERROR JUGADA INVÁLIDA"); break;
            }
            sendGame(game);
            break;
        default: console.log("ERROR: A NON-PLAYER MADE A MOVE :O"); break;
    }

}

function setPlayer(socket, x){
    var newPlayer;
    if(x == 1){
        newPlayer = {
            id: socket,
            piece: 'X'
        }
    }else{
        newPlayer = {
            id: socket,
            piece: 'O'
        }
    }
    return newPlayer;
}

function sendGame(gamer) {
    io.emit('Game', gamer);

    const winner = checkWinConditions(gamer);
    if (winner) {
        io.emit('winner', winner);
    }
}

function checkWinConditions(gamer) {
    const game = [
        gamer[0][0] + gamer[0][1] + gamer[0][2], //<-- First row
        gamer[1][0] + gamer[1][1] + gamer[1][2], //<-- middle row
        gamer[2][0] + gamer[2][1] + gamer[2][2], //<-- last row
        gamer[0][0] + gamer[1][0] + gamer[2][0], //<-- left column
        gamer[0][1] + gamer[1][1] + gamer[2][1], //<-- middle column
        gamer[0][2] + gamer[1][2] + gamer[2][2], //<-- right column
        gamer[0][0] + gamer[1][1] + gamer[2][2], //<-- left-to-right diagonal
        gamer[0][2] + gamer[1][1] + gamer[2][0]  //<-- right-to-left diagonal
    ];
    var winner;

    for (let i = 0; i < game.length; i++) {
        switch (game[i]) {
            case 'XXX':
                winner = 'X';
                break;
            case 'OOO':
                winner = 'O';                
                break;
            default: break;
        }
    }

    if (winner) {
        gameCounter = 1;
        return winner;
    }else{
        if (gameCounter == 9) {
            return 'draw'
        } else {
            return false;            
        }
    }
}

server.listen(PORT, () => console.log(`El juego de la vieja está disponible en http://${HOST}:${PORT}`));