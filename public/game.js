const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const socket = io();

let role = "spectator";

socket.on("role", (assignedRole) => {
    role = assignedRole;
    console.log("Role:", role);
});

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const boatImg = new Image();
boatImg.src = "Assets/motorboat.png";

let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

let boat = {
    x: canvas.width / 2,
    y: canvas.height - 170,
    width: 95,
    height: 185,
    speed: 5
};

let left = false;
let right = false;
let explosion = false;
let gameOver = false;
let explosionSize = 10;

let riverOffset = 0;

canvas.addEventListener("touchstart",(e)=>{

    let x=e.touches[0].clientX;
if (role === "left") {
    left = true;
}

if (role === "right") {
    right = true;
}

});

canvas.addEventListener("touchend",()=>{

    left=false;
    right=false;

});

let rocks=[];

const GAP=220;

for(let i=0;i<8;i++){

    rocks.push({

        x:100+Math.random()*(canvas.width-200),
        y:-i*GAP,
        r:28

    });

}
function update() {

    if (gameOver) return;

    score += 0.03;

    boat.speed = 5 + score / 120;

    riverOffset += boat.speed;

    if (riverOffset > 40)
        riverOffset = 0;

    if (left) boat.x -= 6;
    if (right) boat.x += 6;

    // Keep boat inside river
    if (boat.x < 95) boat.x = 95;
    if (boat.x > canvas.width - 95) boat.x = canvas.width - 95;

    for (let rock of rocks) {

        rock.y += boat.speed;

        if (rock.y > canvas.height + 40) {
            rock.y = -GAP;
            rock.x = 100 + Math.random() * (canvas.width - 200);
        }

        // Rectangle collision
        const boatLeft = boat.x - boat.width / 2 + 12;
        const boatRight = boat.x + boat.width / 2 - 12;
        const boatTop = boat.y - boat.height / 2 + 20;
        const boatBottom = boat.y + boat.height / 2 - 20;

        if (
            rock.x + rock.r > boatLeft &&
            rock.x - rock.r < boatRight &&
            rock.y + rock.r > boatTop &&
            rock.y - rock.r < boatBottom
        ) {
            explosion = true;

if (score > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem("highScore", highScore);
}

gameOver = true;
        }
    }
}

function draw() {

    // Sky
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grass
    ctx.fillStyle = "#2E8B57";
    ctx.fillRect(0, 0, 50, canvas.height);
    ctx.fillRect(canvas.width - 50, 0, 50, canvas.height);

    // Trees
    ctx.fillStyle = "#1B5E20";

    for (let y = -80; y < canvas.height + 80; y += 120) {

        ctx.beginPath();
        ctx.arc(25, y + riverOffset * 0.5, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(canvas.width - 25, y + riverOffset * 0.5, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    // River
    ctx.fillStyle = "#1E90FF";
    ctx.fillRect(50, 0, canvas.width - 100, canvas.height);

    // Water lines
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;

    for (let y = -40; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, y + riverOffset);
        ctx.lineTo(canvas.width / 2, y + 20 + riverOffset);
        ctx.stroke();
    }

    // Rocks
    ctx.fillStyle = "#666";

    for (let rock of rocks) {
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, rock.r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Boat
    if (!gameOver) {
        ctx.save();

        ctx.translate(boat.x, boat.y);

        let angle = 0;
        if (left) angle = -0.2;
        if (right) angle = 0.2;

        ctx.rotate(angle);

        ctx.drawImage(
            boatImg,
            -boat.width / 2,
            -boat.height / 2,
            boat.width,
            boat.height
        );

        ctx.restore();
    }

    // Explosion
    if (explosion) {

        ctx.beginPath();
        ctx.fillStyle = "orange";
        ctx.arc(boat.x, boat.y, explosionSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(boat.x, boat.y, explosionSize * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "yellow";
        ctx.arc(boat.x, boat.y, explosionSize * 0.4, 0, Math.PI * 2);
        ctx.fill();

        explosionSize += 8;
    }

    // Score
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Distance: " + Math.floor(score) + " m", 20, 35);
    ctx.fillText("Best: " + highScore + " m", 20, 65);

if (gameOver) {

    ctx.textAlign = "center";

    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = "yellow";
    ctx.font = "30px Arial";
    ctx.fillText(
        "Distance: " + Math.floor(score) + " m",
        canvas.width / 2,
        canvas.height / 2 + 5
    );

    ctx.fillStyle = "cyan";
    ctx.font = "24px Arial";
    ctx.fillText(
        "Best: " + highScore + " m",
        canvas.width / 2,
        canvas.height / 2 + 45
    );

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.fillText(
        "Tap to Restart",
        canvas.width / 2,
        canvas.height / 2 + 90
    );
}
}

canvas.addEventListener("click", () => {
    if (gameOver) {
        location.reload();
    }
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();