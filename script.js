const canvas = document.getElementById('game-canvas');
let platformGap = 0;
let score = 0;
let highscore = 0;

class Doodler {
    constructor() {
        this.context = canvas.getContext('2d');
        this.x = canvas.width / 2;
        this.y = canvas.height - 200;
        this.image = new Image();
        this.image.src = 'assets/doodler-right.png'
        this.prevY = this.y;
        this.width = 50;
        this.height = 50; 
        this.vx = 0; 
        this.vy = 0; 
        this.gravity = 0.3;
        this.jumpStrength = -7.5;
    }

    updatePosition() {
        this.prevY = this.y;
        this.x += this.vx;
        this.y += this.vy;
        if (this.vy > 3.5) {
            this.vy = 3.5;
        } else {
            this.vy += this.gravity;
        }
        this.checkForWrapDoodler();
        this.checkCollisionWithPlatform();
    }

    checkForWrapDoodler() {
        if (this.x + this.width < 0) {
            this.x = canvas.width;
        } else if (this.x > canvas.width){
            this.x = 0 - this.width;
        }
    }

    checkCollisionWithPlatform() {
        if (this.vy <=0) {
            return
        }
        for (let i=0; i <platforms.length; i++) {
            let platform = platforms[i];
            if (
                (this.prevY + this.height + 20) >= platform.y &&
                this.x + this.width > platform.x && 
                this.x < platform.x + platform.width &&
                this.y  + this.height > platform.y && 
                this.y < platform.y + platform.height &&
                this.prevY < platform.y 
            ) {
                this.jump(platform)
            }
        }
    }

    jump(platform) {
        let newHeight = platform.y - this.height;
        if (newHeight > (canvas.height / 2 - 120)) {
            this.y = platform.y - this.height;
            this.vy = this.jumpStrength
        }
    }

    moveRight() {
        this.vx +=4;
        this.image.src = 'assets/doodler-right.png'
    }

    moveLeft() {
        this.vx -=4;
        this.image.src = 'assets/doodler-left.png'
    }

    draw() {
        this.context.drawImage(this.image,this.x,this.y,this.width,this.height)
    }

}

class Platform {
    constructor(x,y) {
        this.context = canvas.getContext('2d');
        this.image = new Image();
        this.image.src = 'assets/platform.png';
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 20;
    }


    draw() {
        this.context.drawImage(this.image,this.x,this.y,this.width,this.height)
    }

}

let platforms = [];
const doodler = new Doodler();

function randomInteger(min,max) {
    return Math.floor(Math.random()*(max-min +1))+min
}

function showEndMenu () {
    document.getElementById('end-game-menu').style.display = 'block';
    document.getElementById('end-game-score').innerHTML = score;
    if (highscore < score) {
        highscore = score
    }
    document.getElementById('high-score').innerHTML = highscore;
}

function hideEndMenu() {
    document.getElementById('end-game-menu').style.display = 'none';
}

function addListeners() {
    document.addEventListener('keydown',function(event){
        if (event.code === 'ArrowLeft') {
            doodler.moveLeft();

        } else {
            doodler.moveRight();
        }
    })

    document.addEventListener('keyup',function(event){
        if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
            doodler.vx = 0;
        }
    })

    document.getElementById('retry').addEventListener('click',function() {
        hideEndMenu();
        resetGame();
        loop();
    })


}

function createPlatforms(platformCount) {
    platformGap = Math.round(canvas.height / platformCount);
    for (let i = 0; i < platformCount; i++) {
        let xpos = 0;
        do {
            xpos = randomInteger(25, canvas.width - 25 -100)
        } while (
            xpos > canvas.width / 2 -100*1.5 &&
            xpos < canvas.width / 2 +100 /2
        )
        let y = (canvas.height / 1.5) - i*platformGap;
        platforms.push(new Platform(xpos, y))
    }
}

function setup() {
    platforms.push(new Platform(doodler.x, (doodler.y+80)))
    createPlatforms(6)
}

function resetGame() {
    doodler.x = canvas.width / 2;
    doodler.y = canvas.height - 100;
    doodler.vx = 0;
    doodler.vy = 0;
    score = 0;
    platforms = [];
    setup();
}

function scoreText() {
    doodler.context.font = '20px Arial';
    doodler.context.fillStyle = 'black';
    doodler.context.textAlign = 'center';
    doodler.context.fillText(`Score: ${Math.round(score)}`,canvas.width / 2, 50)

}

function updatePlatformsAndScore() {
    let platformCpy = [...platforms];
    platforms = platforms.filter(platform_ => platform_.y < canvas.height)
    score+= platformCpy.length - platforms.length;
}

function loop() {
    doodler.context.clearRect(0,0,canvas.width,canvas.height)
    if (doodler.y < canvas.height / 2 && doodler.vy < 0) {
        platforms.forEach(platform => {
            platform.y += -doodler.vy*2;
        })
        platforms.push(new Platform(randomInteger(25,canvas.width - 25 - 100), platforms[platforms.length - 1].y - platformGap*2))
    }
    doodler.draw();
    doodler.updatePosition();

    platforms.forEach(platform => {
        platform.draw();
    });

    scoreText();

    if (doodler.y > canvas.height) {
        showEndMenu();
        return
    }

    updatePlatformsAndScore();

    requestAnimationFrame(loop)
}

addListeners();
setup();
loop();