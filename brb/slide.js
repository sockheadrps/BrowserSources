
const socket = new WebSocket('ws://0.0.0.0:8181/');
const imageNames = ['brb3.png', 'brb4.png', 'brb6.png'];
let currentImageIndex = Math.floor(Math.random() * imageNames.length);
let myImage = new Image();
myImage.src=`../assets/${imageNames[currentImageIndex]}`;





myImage.addEventListener('load', function() {
    let particlesArray = [];
    let mappedImage = [];
    const numberOfParticles = 7000;
  
    const canvas = document.getElementById('canvas1')
    const ctx = canvas.getContext('2d')
    canvas.width = 512;
    canvas.height = 512;

    ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
    let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    for (let y = 0; y < canvas.height; y++) {
        let row = [];
        for (let x = 0; x < canvas.width; x++) {
            const red = pixels.data[(y * 4 * pixels.width) + (x * 4)];
            const green = pixels.data[(y * 4 * pixels.width) + (x * 4 + 1)];
            const blue = pixels.data[(y * 4 * pixels.width) + (x * 4 + 2)];
            const brightness = calculateReletiveBrightness(red, green, blue);
            const cell = [
                cellBrightness = brightness,
                cellColor = 'rgb(' + red + ',' + green + ',' + blue + ')'
            ];
            row.push(cell);
        }
        mappedImage.push(row);
    }

    function calculateReletiveBrightness(r, g, b) {
        return Math.sqrt(
            (r * r) * 0.229 + 
            (g * g) * 0.587 + 
            (b * b) * 0.114
            ) / 100;
        }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = 0;
            this.speed = 0;
            this.velocity = Math.random() * 0.8;
            this.size = Math.random() * 1.5 + 3;
            this.position1 = Math.floor(this.y);
            this.position2 = Math.floor(this.x);
            this.angle = 0;
        }
        update() {
            this.position1 = Math.floor(this.y);
            this.position2 = Math.floor(this.x);
            if ((mappedImage[this.position1]) && (mappedImage[this.position1][this.position2])) {
                this.speed = mappedImage[this.position1][this.position2][0];
            }
            let movement = Math.floor(2.5 - this.speed) + this.velocity;
            this.angle += this.speed/20
            this.size = this.speed * 1.5

            this.y += movement + Math.sin(this.angle) * 2;
            this.x += movement + Math.cos(this.angle) * 1;
            
            if (this.y >= canvas.height) {
                this.y = 0;
                this.x = Math.random() * canvas.width;
            }

            if (this.x >= canvas.height) {
                this.x = 0;
                this.y = Math.random() * canvas.width;
            }
            

        }
        draw() {
            ctx.beginPath();
            if (mappedImage[this.position1] && mappedImage[this.position1][this.position2]) {
                ctx.fillStyle = mappedImage[this.position1][this.position2][1];
            }
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

    }

    function init() {
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle);
        }
    }
    init();

    function animate() {
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.globalAlpha = 0.1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            ctx.globalAlpha = particlesArray[i].speed * 0.5;
            particlesArray[i].draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
});


document.addEventListener('DOMContentLoaded', function () {
    console.log('loaded')
});


socket.addEventListener('open', () => {
    content = document.getElementById('display');
    content.style.opacity = '0%';
    console.log('WebSocket connection established');
    socket.send(JSON.stringify(
        {
            "event": "CONNECT",
            "client": "OBS_CLIENT_BRB"
        }
    ))
});


socket.addEventListener('message', async (event) => {
    const data = JSON.parse(event.data);
    if (!data.event) {
        return
    } else {
        switch (data.event) {
            case "START_BRB":
                username_box_div.style.display = 'block';
                username_elm.innerText = data.user
                document.body.style.backgroundImage = "url('talking.png')";
                break;

            case 'END_BRB':
                username_box_div.style.display = 'none';
                username_elm.innerText = ""
                document.body.style.backgroundImage = "url('idle.png')";
        }
    }
});

socket.addEventListener('close', () => {
    console.log('WS not connected')
});