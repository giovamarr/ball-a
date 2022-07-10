const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const PLAYERZ = [];
const WALLZ = [];

let LEFT, UP, RIGHT, DOWN, SHOT;
let friction = 0;

class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    unit(){
        if(this.mag() === 0){
            return new Vector(0,0);
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    
    static dot(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }
}

class Player{
    constructor(x, y, r, m, a, f){
        this.pos = new Vector(x,y);
        this.r = r;
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.elasticity = 1;
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.acceleration = a
        this.friction = f
        this.player = false;
        PLAYERZ.push(this);
    }

    drawPlayer(){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    display(){
        ctx.fillStyle = "black";
        ctx.fillText("m= "+this.m, this.pos.x-10, this.pos.y-5);
        ctx.fillText("e= "+this.elasticity, this.pos.x-10, this.pos.y+5);
    }

    reposition(){
        this.acc = this.acc.unit().mult(this.acceleration);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-this.friction);
        this.pos = this.pos.add(this.vel);
    }
}

//Walls are line segments between two points
class Wall{
    constructor(x1, y1, x2, y2){
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        WALLZ.push(this);
    }

    drawWall(){
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.closePath();
    }

    wallUnit(){
        return this.end.subtr(this.start).unit();
    }
}

function keyControl(b){
    canvas.addEventListener('keydown', function(e){
        if(e.keyCode === 37){
            LEFT = true;
        }
        if(e.keyCode === 38){
            UP = true;
        }
        if(e.keyCode === 39){
            RIGHT = true;
        }
        if(e.keyCode === 40){
            DOWN = true;
        }
        if(e.keyCode === 32){
            SHOT = true
        }
    });
    
    canvas.addEventListener('keyup', function(e){
        if(e.keyCode === 37){
            LEFT = false;
        }
        if(e.keyCode === 38){
            UP = false;
        }
        if(e.keyCode === 39){
            RIGHT = false;
        }
        if(e.keyCode === 40){
            DOWN = false;
        }
        if(e.keyCode === 32){
            SHOT = false
        }
    });
    
    if(LEFT){
        b.acc.x = -b.acceleration;
    }
    if(UP){
        b.acc.y = -b.acceleration;
    }
    if(RIGHT){
        b.acc.x = b.acceleration;
    }
    if(DOWN){
        b.acc.y = b.acceleration;
    }
    if(SHOT){
        kicking(player1);
    }
    if(!LEFT && !RIGHT){
        b.acc.x = 0;
    }
    if(!UP && !DOWN){
        b.acc.y = 0;
    }
}

function round(number, precision){
    let factor = 10**precision;
    return Math.round(number * factor) / factor;
}


//returns with the closest point on a line segment to a given point
function closestPointBW(b1, w1){
    let playerToWallStart = w1.start.subtr(b1.pos);
    if(Vector.dot(w1.wallUnit(), playerToWallStart) > 0){
        return w1.start;
    }

    let wallEndToPlayer = b1.pos.subtr(w1.end);
    if(Vector.dot(w1.wallUnit(), wallEndToPlayer) > 0){
        return w1.end;
    }

    let closestDist = Vector.dot(w1.wallUnit(), playerToWallStart);
    let closestVect = w1.wallUnit().mult(closestDist);
    return w1.start.subtr(closestVect);
}

function coll_det_bb(b1, b2){
    if(b1.r + b2.r >= b2.pos.subtr(b1.pos).mag()){
        return true;
    } else {
        return false;
    }
}

//collision detection between ball and wall
function coll_det_bw(b1, w1){
    let playerToClosest = closestPointBW(b1, w1).subtr(b1.pos);
    if (playerToClosest.mag() <= b1.r){
        return true;
    }
}

function pen_res_bb(b1, b2){
    let dist = b1.pos.subtr(b2.pos);
    let pen_depth = b1.r + b2.r - dist.mag();
    let pen_res = dist.unit().mult(pen_depth / (b1.inv_m + b2.inv_m));
    b1.pos = b1.pos.add(pen_res.mult(b1.inv_m));
    b2.pos = b2.pos.add(pen_res.mult(-b2.inv_m));
}

//penetration resolution between ball and wall
function pen_res_bw(b1, w1){
    let penVect = b1.pos.subtr(closestPointBW(b1, w1));
    b1.pos = b1.pos.add(penVect.unit().mult(b1.r-penVect.mag()));
}

function coll_res_bb(b1, b2){
    let normal = b1.pos.subtr(b2.pos).unit();
    let relVel = b1.vel.subtr(b2.vel);
    let sepVel = Vector.dot(relVel, normal);
    let new_sepVel = -sepVel * Math.min(b1.elasticity, b2.elasticity);
    
    let vsep_diff = new_sepVel - sepVel;
    let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
    let impulseVec = normal.mult(impulse);

    b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m));
    b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m));
}

function coll_res_ball(b1, b2){
    let normal = b1.pos.subtr(b2.pos).unit();
    let relVel = b1.vel.subtr(b2.vel);
    let sepVel = Vector.dot(relVel, normal);
    let new_sepVel = -sepVel * Math.min(b1.elasticity, b2.elasticity);
    
    let vsep_diff = new_sepVel - sepVel;
    let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
    let impulseVec = normal.mult(impulse);

    b1.vel = b1.vel.add(impulseVec.mult(b1.inv_m));
    if (SHOT){
        let impulse = 4;
        let impulseVec = normal.mult(impulse);
        b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m *4.5));
        SHOT = false;
    }else{
        console.log(impulse)
        b2.vel = b2.vel.add(impulseVec.mult(-b2.inv_m));
    }
}



//collision response between ball and wall
function coll_res_bw(b1, w1){
    let normal = b1.pos.subtr(closestPointBW(b1, w1)).unit();
    let sepVel = Vector.dot(b1.vel, normal);
    let new_sepVel = -sepVel * b1.elasticity;
    let vsep_diff = sepVel - new_sepVel;
    b1.vel = b1.vel.add(normal.mult(-vsep_diff));
}

function momentum_display(){
    let momentum = Player1.vel.add(Player2.vel).mag();
    ctx.fillText("Momentum: "+round(momentum, 4), 500, 330);
}


function kicking(player) {
}

function main(timestamp) {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    PLAYERZ.forEach((b, index) => {
        b.drawPlayer();
        if (b.player){
            keyControl(b);
        }
        //each ball object iterates through each wall object
        WALLZ.forEach((w) => {
            if(coll_det_bw(PLAYERZ[index], w)){
                pen_res_bw(PLAYERZ[index], w);
                coll_res_bw(PLAYERZ[index], w);
            }
        })
        for(let i = index+1; i<PLAYERZ.length; i++){
            if(coll_det_bb(PLAYERZ[index], PLAYERZ[i])){
                pen_res_bb(PLAYERZ[index], PLAYERZ[i]);
                if(PLAYERZ[i] == ball){
                    console.log('es la pelota pa')
                    coll_res_ball(PLAYERZ[index], PLAYERZ[i]);

                }else{

                    coll_res_bb(PLAYERZ[index], PLAYERZ[i]);
                }
            }
        }
        gameScore()

        b.display();
        b.reposition();
    });

    //drawing each wall on the canvas
    WALLZ.forEach((w) => {
        w.drawWall();
    })

    requestAnimationFrame(main);
}
    let player1 = new Player(100, 100, 27, 4, 0.2, 0.06);
    player1.elasticity =0.9;
    let player2 = new Player(300, 300, 27, 4, 0.2, 0.06);
    player2.elasticity =0.8;
    player1.score = 0;
    player2.score = 0;


let ball = new Player(200, 200, 10, 2, 0.5, 0.02);
ball.elasticity = 1;


function gameScore(){

    if(ball.pos.x < 45){
        player2.score ++;
        ball.pos.x = 300
        ball.pos.y = 300
        player2.pos.x=100
        player1.pos.x=400

        // scoring(player2)

    }
    if(ball.pos.x > 595){
        player1.score ++;
        ball.pos.x = 300
        player2.pos.x=100

        player1.pos.x=400
        // scoring(player1)
        
        
    }
    // if(player1.score === 3 || player2.score === 3){
    //     gameOver();
    // }
    ctx.fillText(player1.score, 20, 30);
    ctx.fillText(player2.score, 600, 30);
}

function scoring(player){
    console.log('golazo de' +player)
    
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
buildStadium()
PLAYERZ[0].player = true;


requestAnimationFrame(main);