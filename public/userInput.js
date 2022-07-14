let justPressed = false;

//Event listeners for the arrow keys
function userInput(obj){
    canvas.addEventListener('keydown', function(e){
        if(e.keyCode === 37  || e.keyCode === 65){
            if(obj.left === false){
                justPressed = true;
            }
            obj.left = true;
        }
        if(e.keyCode === 38  || e.keyCode === 87){
            if(obj.up === false){
                justPressed = true;
            }
            obj.up = true;
        }
        if(e.keyCode === 39 || e.keyCode === 68){
            if(obj.right === false){
                justPressed = true;
            }
            obj.right = true;
        }
        if(e.keyCode === 40 || e.keyCode === 83){
            if(obj.down === false){
                justPressed = true;
            }
            obj.down = true;
        }
        if(e.keyCode === 32|| e.keyCode === 88){
            if(obj.action === false){
                justPressed = true;
            }
            obj.action = true;
        }
        if (justPressed === true){
            emitUserCommands(obj);
            justPressed = false;
        }
    });
    
    canvas.addEventListener('keyup', function(e){
        if(e.keyCode === 37 || e.keyCode === 65){
            obj.left = false;
        }
        if(e.keyCode === 38 || e.keyCode === 87){
            obj.up = false;
        }
        if(e.keyCode === 39 || e.keyCode === 68){
            obj.right = false;
        }
        if(e.keyCode === 40 || e.keyCode === 83){
            obj.down = false;
        }
        if(e.keyCode === 32 || e.keyCode === 88){
            obj.action = false;
        }
        emitUserCommands(obj);
    });    
}

function emitUserCommands(obj){
    let userCommands = {
        left: obj.left,
        up: obj.up,
        right: obj.right,
        down: obj.down,
        action: obj.action
    }
    socket.emit('userCommands', userCommands);
}