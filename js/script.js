//Collision setup
const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let timeToNextRaven = 0;
let ravenInterval = 1200; 
//every 500 millisec new raven and set timeToNextRaven to zero again
let lastTime = 0; 

//Scoring
let score = 0;

//Game over
let gameOver = false;

//Global canvas fort font
ctx.font = '50px Impact';

//Array ravens
let ravens = [];

class Raven{
    //Format of Raven class
    constructor(){
        //Lets use our image or sprite instead of rectangles
        this.image = new Image();
        //Get the image location.
        this.image.src = './assets/raven.png';
        this.spriteWidth = 270;
        this.spriteHeight = 194;

        //Random size modifier. between 0.4 and 1
        this.sizeModifier = Math.random() * .5 + .2;

        //RAVEN SIZE Set the dimension of ravens.
        this.width =  this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;

        //COORDS x coord and ycoord of raven
        this.x = canvas.width;
        //Y coord must be random vertical height to allow up and down movement.
        //We need to minus the height of raven always.
        this.y = Math.random() * (canvas.height - this.height);

        //SPEED X is horizontal speed and Y is vertical speed.
        this.directionX = Math.random() * 5 + 3;
        //Bounce up and down.
        this.directionY = Math.random() * 5 - 2.5;

        //Frame
        this.frame = 0;
        this.maxFrame = 4;

        //DELETION Create a deletion for objects moved behind 0.
        this.markedForDeletion = false;

        //Flapping speed for wings. Also make a random between 30 and 70
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 40 + 90;

        //Random colors
        this.randomColors = [Math.floor(Math.random() * 255),
                            Math.floor(Math.random() * 255),
                            Math.floor(Math.random() * 255),];
        this.color = 'rgb('+ this.randomColors[0] + ',' + this.randomColors[1]+ ',' + this.randomColors[2] + ')';

        this.hasTrail = Math.random() > .5;
    }

    //Loop method
    update(deltaTime){

        //Bounce ravens when they hit the upper and lower part of the screen.
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1;
        }

        //raven move to the left.
        this.x -= this.directionX;
        //Make random direction eithr up or down
        this.y += this.directionY;

        //If raven object passed coordY = 0; set to be deleted.
        if(this.x < 0 - this.width ) this.markedForDeletion = true;
        
        //Setting its wing flap speed.
        this.timeSinceFlap += deltaTime;
        if(this.timeSinceFlap > this.flapInterval){

            //whenever frame gets larger than maxFrame then  set back to zero.
            if(this.frame > this.maxFrame) this.frame = 0;
            //When frame = 0 then add 1 for every loop.
            else this.frame++;
            this.timeSinceFlap = 0;
            //particles
            if(this.hasTrail){
                for(let i =0; i <5; i++){
                    particles.push(new Particles(this.x, this.y, this.width, this.color));
                }
            }
        }
        //Game over if raven passes X=0
        if(this.x < 0 - this.width) gameOver = true;
    }

    //Display method
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        //this would represent every single raven object.
        //Built fillRect method.
        
        //replacing fillRect with strokeRect
        //ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        /**
         * using drawImage builtin
         * image, image.coord.x, image.coord.y OPTION1
         * image, image.coord.x, image.coord.y, image.w, image.h OPTION2
         *      img, img.coord.x, img.coord.y, 
         *      img.w, img.h, 
         *      destination.coord.x, destination.coord.y
         *      img.destination.w, img.destination.h
         */
        ctx.drawImage(this.image, 
                     (this.frame * this.spriteWidth), 0, 
                      this.spriteWidth, this.spriteHeight,
                      this.x, this.y,
                      this.width, this.height);
    }
} //End of class

let explosions = [];
class Explosions{
    constructor(x,y,size){
        this.image = new Image();
        //Get the image location.
        this.image.src = './assets/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y =y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = './assets/boom.wav';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 500;
        this.markedForDeletion = false;
    }

    update(deltaTime){
        this.timeSinceLastFrame += deltaTime;

        if(this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            if(this.frame > 5){
                this.markedForDeletion = true;
            }
        }
    }

    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0,
                      this.spriteWidth, this.spriteHeight, 
                      this.x, this.y - this.size/4, 
                      this.size, this.size);
    }
}

//Particles
let particles = [];
class Particles{
    constructor(x,y,size,color){
        this.size = size;
        this.x=x + this.size/2;
        this.y=y + this.size/3;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * .6 + 0.4;
        this.color = color;
    }

    //update
    update(){
        this.x += this.speedX;
        this.radius +=  .5;
        if(this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }
    //draw()
    draw(){
        //draw circle
        ctx.save(); //Affect particles only by creating a global snapshot setting
        ctx.globalAlpha = 1 - this.radius/this.maxRadius; //Set opacity
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore(); //then restore to revert canvas settings before it started.
    }
}

//Score Function
function drawScore(){
    textStyle(50,75,score,"black","Score: ");
    textStyle(55,80,score,"white","Score: ");
}

textStyle = (x, y, param, color, value) => {
    //Set color.
    ctx.fillStyle = color;
    //Set text and position.
    ctx.fillText(value + param, x, y);
}

//Draw Game Over
function drawGameOver(){
    ctx.textAlign = 'center';
    textStyle(canvas.width/2,canvas.height/2,score,"black","GAME OVER, your score is ");
    textStyle(canvas.width/2 + 2,canvas.height/2 + 5,score,"white","GAME OVER, your score is ");
}


//Make a click action.
window.addEventListener('click', (e) => {
    //coord.x top-left, coordy.top-left, img.w, img.h : total of 1px
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    //console.log(detectPixelColor);

    //Holds data array for color of box
    const pc = detectPixelColor.data;

    ravens.forEach((raven) => {
        if(raven.randomColors[0] === pc[0] &&
           raven.randomColors[1] === pc[1] &&
           raven.randomColors[2] === pc[2]){
               //If the match then we have collision
               raven.markedForDeletion = true;
               score++;
               explosions.push(new Explosions(raven.x,raven.y,raven.width));
               //console.log(explosions);
           }
    });
});

//1 sec === 1000 millisec
//timestamp is a numeric value in millisec
//Also timestamp is used to sync within the device ability to animate.
function animate(timestamp){
    //Clear first all drawings.
    ctx.clearRect(0,0,canvas.width, canvas.height);
    collisionCtx.clearRect(0,0,canvas.width, canvas.height);
    
    //Compute time change in milli sec
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    //start to zero
    timeToNextRaven += deltaTime;

    //when timetonextraven reaches raveninterval
    //create new raven using push in our array.
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        //console.log(ravens);
        //Sort order by size of raven
        ravens.sort( (a, b) => {
            return a.width - b.width;
        });
    }
    
    drawScore();
    //call new raven here inside this animation loop.
    //using spread operator inside an array literal.
    //apply foreach loop and use object as variable which represents raven objects
    // for each raven object in ravens array call their associated method 
    //which will trigger update on all of them.
    [...ravens, ...explosions, ...particles].forEach(raven => raven.update(deltaTime));
    // ravens.forEach((raven) => {
    //     raven.update();
    // });

    //same with draw method.
    [...ravens, ...explosions, ...particles].forEach(raven => raven.draw());
    
    //filter out ravens that passes x.coord = 0
    ravens = ravens.filter(raven => !raven.markedForDeletion);
    explosions = explosions.filter(explode => !explode.markedForDeletion);
    particles = particles.filter(particle => !particle.markedForDeletion);
    //console.log(ravens);

    //Call animate again to allow endless animation. javascript builtin function
    if(!gameOver){
         requestAnimationFrame(animate)
    }else{ 
        drawGameOver();
    }
}

//Trigger the first loop.
animate(0);