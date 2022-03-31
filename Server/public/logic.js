var socket = io();
var buttons = document.querySelectorAll('div.btn')
var uniGame = [];
var yourWins = 0;
var oppWins = 0;
var socketID;
var yourTurn = true;
var numPlayer;
var winner = false;

const turn = document.getElementById('who');

buttons.forEach(butt =>{
    butt.addEventListener('click', select)
})

socket.on('connect', () =>{
    socketID = socket.id;
})

socket.on('userData', (data) =>{
    console.log(data);
    if(data.id == socketID){
        switch(data.piece){
            case 'X': 
                numPlayer = 1;
                turn.innerHTML = 'Your';
                renderYourData('player1', data.piece);
                renderOppData('player2', 'O');
                break;
            case 'O':
                numPlayer = 2;
                turn.innerHTML = 'Your Opponent';
                yourTurn = false;
                allowPlay(yourTurn);
                renderYourData('player2', data.piece);
                renderOppData('player1', 'X');
                break;
            default: console.log("ERROR INCORRECT DATA OR MORE THAN 2 PLAYERS");
        }
    }
})

socket.on('winner', (winner) =>{
   switch (winner) {
       case 'X':
           displayWinner('player1');
           break;
       case 'O':
           displayWinner('player2');        
           break;
        case 'draw':
            setWinningData('draw');
            break;
       default:
           break;
   }
   setTimeout(() => {
    socket.emit('reset')
    winner = false;
    setWinningData('reset');
   }, 15000);
});

socket.on('Game', (arr) =>{
    //Transform the multidirectional array to regular array
    var index = 0;
    /**
    index + i + j = array in that index

    0 + 0 + 0 = 0
    0 + 0 + 1 = 1
    0 + 0 + 2 = 2
    2 + 1 + 0 = 3
    2 + 1 + 1 = 4
    2 + 1 + 2 = 5
    4 + 2 + 0 = 6
    4 + 2 + 1 = 7
    4 + 2 + 2 = 8
    */

    for(i = 0; i < 3; i++){
        for(j = 0; j < 3; j++){
            uniGame[index + i + j] = arr[i][j];
        }
        index = index + 2;
    }
    console.log(uniGame);
    displayGame();
});

socket.on('resetTurns', (arg) =>{
    console.log(arg);
    allowPlay(yourTurn);
    yourTurn = !yourTurn
})


function renderYourData(id, piece) {
    const parentDiv = document.getElementById(id);
    
    const h1 = document.createElement('h1');
    h1.className = 'player'
    h1.innerHTML = 'You';

    const h2 = document.createElement('h2');
    h2.className = 'piece'
    h2.innerHTML = piece;

    piece == 'X' ? h2.style.color = "#b00b69" : h2.style.color = "#69b00b"

    const div = document.createElement('div');
    div.className = 'score';

    const wins = document.createElement('h1');
    wins.id = "yourWins"
    const win = document.createElement('h1');
    win.id = "yourStatus"

    div.appendChild(wins);
    div.appendChild(win);
    
    parentDiv.appendChild(h1);
    parentDiv.appendChild(h2);
    parentDiv.appendChild(div);
}

function renderOppData(id, piece) {
    const parentDiv = document.getElementById(id);
    
    const h1 = document.createElement('h1');
    h1.className = 'player'
    h1.innerHTML = 'Your Opponent';

    const h2 = document.createElement('h2');
    h2.className = 'piece'
    h2.innerHTML = piece;
    const h3 = document.createElement('h3');
    h3.className = 'turn'
    h3.id ='oppTurn';

    piece == 'X' ? h2.style.color = "#b00b69" : h2.style.color = "#69b00b"

    const div = document.createElement('div');
    div.className = 'score';
    
    const wins = document.createElement('h1');
    wins.id = "oppWins"
    const win = document.createElement('h1');
    win.id = "oppStatus"

    div.appendChild(wins);
    div.appendChild(win);
    
    parentDiv.appendChild(h1);
    parentDiv.appendChild(h2);
    parentDiv.appendChild(div);
}

function select(e) {
    if (winner) return;
    if(!yourTurn) return;

    const button = e.target;
    position = parseInt(button.id);
    console.log(position);

    const move = {
        Player: socketID,
        Position: position
    }

    socket.emit("Move", move);
}   

function displayGame() {
    for(i = 0; i < 9; i++){
        buttons[i].innerHTML = uniGame[i];
        buttons[i].innerHTML == 'X' ? buttons[i].style.color = '#b00b69' : buttons[i].style.color = '#69b00b' 
    }
}
function displayWinner(winner) {
    const div = document.getElementById(winner);
    const who = div.firstElementChild.textContent;

    switch (who) {
        case 'You':
                const win1 = document.getElementById('yourStatus');
                const winnerWins1 = document.getElementById('yourWins');
                const lose1 = document.getElementById('oppStatus');
                const loserWins1 = document.getElementById('oppWins');
                
                yourWins++;
                winnerWins1.innerHTML = `Wins: ${yourWins}`
                loserWins1.innerHTML = `Wins: ${oppWins}`
                
                win1.innerHTML = 'YOU WON!!!!!1!'
                lose1.innerHTML = 'YOU LOST... YOU SUCK!'
                break;
                
        case 'Your Opponent':
                const win = document.getElementById('oppStatus');
                const winnerWins = document.getElementById('oppWins');
                const lose = document.getElementById('yourStatus');
                const loserWins = document.getElementById('yourWins');
                
                oppWins++;
                winnerWins.innerHTML = `Wins: ${oppWins}`
                loserWins.innerHTML = `Wins: ${yourWins}`

                win.innerHTML = 'YOU WON!!!!!1!'
                lose.innerHTML = 'YOU LOST... YOU SUCK!'
                break;
        default:
            break;
    }

}

function allowPlay(turn1) {
    if (turn1) {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].style.cursor = "not-allowed"
            buttons[i].disabled = true;
        }
        turn.innerHTML = 'Your Opponent';
    } else {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].style.cursor = "pointer"
            buttons[i].disabled = false;
        }
        turn.innerHTML = 'Your';
    }
}

function setWinningData(str) {
    const opp = document.getElementById('oppStatus');
    const opppWins = document.getElementById('oppWins');
    const you = document.getElementById('yourStatus');
    const youWins = document.getElementById('yourWins');
    switch (str) {
        case 'draw':
            opppWins.innerHTML = `Wins: ${oppWins}`
            youWins.innerHTML = `Wins: ${yourWins}`

            opp.innerHTML = 'DRAW!!'
            you.innerHTML = opp.innerHTML
            break;
        case 'reset':
            opppWins.innerHTML = ' '
            youWins.innerHTML = ' '

            opp.innerHTML = ' '
            you.innerHTML = opp.innerHTML
            break;
    
        default:
            break;
    }
}