// const socket = io.connect('http://localhost:3000');
const socket = io.connect();


const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// const form = document.getElementById('userForm');
// const gameAreaDiv = document.getElementById('gameArea');

buildStadium();
let football;
let clientBalls = {};
let selfID;

socket.on('connect', () => {
    selfID = socket.id;
})

socket.on('updateConnections', player => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    if(clientBalls[player.id] === undefined){
        if(player.no === 1){
            clientBalls[player.id] = new Ball(80, 270, 30, 4);
            clientBalls[player.id].color = "blue";
        } else if(player.no === 2){
            clientBalls[player.id] = new Ball(100, 270, 30, 4);
            clientBalls[player.id].color = "blue";
        }
        else if(player.no === 3){
            clientBalls[player.id] = new Ball(560, 270, 30, 4);
            clientBalls[player.id].color = "yellow";
        }
        else if(player.no === 4){
            clientBalls[player.id] = new Ball(560, 270, 28, 30, 4);
            clientBalls[player.id].color = "yellow";
        }
        clientBalls[player.id].maxSpeed = 2;
        clientBalls[player.id].score = 0;
        clientBalls[player.id].no = player.no;
        if(player.id === selfID){
            // document.getElementById('playerWelcome').innerHTML =
            //     `Ingresar nickname (room numero ${player.roomNo})`
            userInput(clientBalls[player.id]);
        }
    }
})

socket.on('deletePlayer', player => {
    if(clientBalls[player.id]){
        clientBalls[player.id].remove();
        delete clientBalls[player.id];
        football.remove();
        delete football;
    }
})

socket.on('playerName', data => {
    clientBalls[data.id].name = data.name;
})

socket.on('updateFootball', footballPos => {
    if(football === undefined){
        football = new Ball(footballPos.x, footballPos.y, 14, 2);
        football.color = "white";
        
    } else {
        football.setPosition(footballPos.x, footballPos.y);
    }
})

socket.on('positionUpdate', playerPos => {
    for(let id in clientBalls){
        if(clientBalls[id] !== undefined && id === playerPos.id){
            clientBalls[id].setPosition(playerPos.x, playerPos.y, playerPos.angle);
        }
    }
})

socket.on('updateScore', scorerId => {
    if (scorerId === null){
        for (let id in clientBalls){
            clientBalls[id].score = 0;
        } 
    } else {
        document.getElementById('winning').innerHTML = ``;
        for (let id in clientBalls){
            if (id === scorerId){
                if(clientBalls[id].no === 1){
                    clientBalls[id].score++;
                } else if(clientBalls[id].no === 2){
                    clientBalls[id].score++;
                }
                if(clientBalls[id].score === 3){
                    document.getElementById('winning').innerHTML = 
                    `Ganó ${clientBalls[id].name}!`
                }
            }
        }
    }
})

requestAnimationFrame(renderOnly);

function userInterface(){
    ctx.font = "30px Arial";
    for (let id in clientBalls){
        if(clientBalls[id].no === 1){
            ctx.fillStyle = "blue";
            ctx.textAlign = "left";
            ctx.fillText(clientBalls[id].score, 30, 30);
            if(clientBalls[id].name){
                ctx.fillText(clientBalls[id].name, 30, 70);
            } else {
                ctx.fillStyle = "black";
                ctx.fillText("....", 30, 70);
            }
        } else if(clientBalls[id].no === 2){
            ctx.fillStyle = "yellow";
            ctx.textAlign = "right";
            ctx.fillText(clientBalls[id].score, 600, 30);
            if(clientBalls[id].name){
                ctx.fillText(clientBalls[id].name, 600, 70);
            } else {
                ctx.fillStyle = "black";
                ctx.fillText("....", 600, 70);
            }
        }
    }
}

function buildStadium(){
    new Wall(60, 80, 580, 80);
    new Wall(60, 460, 580, 460);

    new Wall(60, 80, 60, 180);
    new Wall(60, 460, 60, 360);
    new Wall(580, 80, 580, 180);
    new Wall(580, 460, 580, 360);

    new Wall(50, 360, 10, 360);
    new Wall(0, 360, 0, 180);
    new Wall(10, 180, 50, 180);
    new Wall(590, 360, 630, 360);
    new Wall(640, 360, 640, 180);
    new Wall(630, 180, 590, 180);
}

function load() {
    canvas.focus();
    // clientBalls[selfID].name = document.getElementById('userName').value;
    // clientBalls[selfID].name = 'giovanni'
    socket.emit('clientName', 'giovanni');
    
}

window.onload = load;
