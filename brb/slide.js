const socket = new WebSocket("ws://0.0.0.0:8181/");
let myImage = new Image();
let uniqueParam = new Date().getTime();
myImage.src = "../assets/bg1.png";
let fillStyleAlpha = 0.05;
let changes = 0;
textImage = new Image()
textImage.src = `../assets/text/brb2.svg`;



function changeBackgroundImage() {
  const imageNames = ["bg1.png", "bg2.png", "bg3.png", "bg4.png", "bg5.png"];
  const randomIndex = Math.floor(Math.random() * imageNames.length);
  const randomImageName = imageNames[randomIndex];
  const imagePath = `../assets/${randomImageName}`;

  myImage.src = `${imagePath}`;
}
  changeBackgroundImage();


function changeFillAlpha() {
  const amt = 0.02;

  if (changes < 40) {
    fillStyleAlpha += amt;
  } else if (changes >= 40) {
    fillStyleAlpha -= amt;
  }

  changes += 1;

  if (changes === 80) {
    changes = 0;
    fillStyleAlpha = 0.05;
  }
}

const intervalId = setInterval(changeFillAlpha, 250);

let textReady = false
textImage.addEventListener("load", function () {
  textReady = true;
});


myImage.addEventListener("load", function () {
  // Call the function initially to set the initial background image

  // Set an interval to call the function every 5 seconds
  // setInterval(changeBackgroundImage, 5000);
  let particlesArray = [];
  let mappedImage = [];
  const numberOfParticles = 7000;
  let startTime = new Date();
  let endTime

  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");


  canvas.width = 900;
  canvas.height = 900;
  ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
  const randomQuadrant = Math.floor(Math.random() * 4) + 1;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  let offsetX, offsetY;

  switch (randomQuadrant) {
    case 1:
      offsetX = 100;
      offsetY = 100;
      break;
    case 2:
      offsetX = canvas.width - 600;
      offsetY = canvas.height - 400;
      break;
    case 3:
      offsetX = canvas.width - 700;
      offsetY = canvas.height - 600;

      break;
    case 4:
      offsetX = canvas.width - 800;
      offsetY = canvas.height - 800;
    default:
      offsetX = canvas.width - 550;
      offsetY = canvas.height - 800;
  }

  // Draw the image at the calculated coordinates
  
  ctx.drawImage(textImage, offsetX, offsetY);

  let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  function calculateReletiveBrightness(r, g, b) {
    return Math.sqrt(r * r * 0.229 + g * g * 0.587 + b * b * 0.114) / 100;
  }
  function mapImageDataToMatrix(britFunc) {
    for (let y = 0; y < canvas.height; y++) {
      let row = [];

      for (let x = 0; x < canvas.width; x++) {
        const red = pixels.data[y * 4 * pixels.width + x * 4];
        const green = pixels.data[y * 4 * pixels.width + (x * 4 + 1)];
        const blue = pixels.data[y * 4 * pixels.width + (x * 4 + 2)];
        const brightness = britFunc(red, green, blue);
        const cell = [
          (cellBrightness = brightness),
          (cellColor = "rgb(" + red + "," + green + "," + blue + ")"),
        ];
        row.push(cell);
      }

      mappedImage.push(row);
    }
  }

  mapImageDataToMatrix(calculateReletiveBrightness);

  

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
      if (
        mappedImage[this.position1] &&
        mappedImage[this.position1][this.position2]
      ) {
        this.speed = mappedImage[this.position1][this.position2][0];
      }
      let movement = Math.floor(2.5 - this.speed) + this.velocity;
      this.angle += this.speed / 20;
      this.size = this.speed * 1.5;

      this.y += movement + Math.sin(this.angle) * 2;
      this.x += movement + Math.cos(this.angle) * 1;

      if (this.y >= canvas.height) {
        if (Math.random() < 0.5) {
          this.y = Math.random() * canvas.height;
          this.x = 0;
        } else {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }
      }

      if (this.x >= canvas.height) {
        if (Math.random() < 0.5) {
          this.y = Math.random() * canvas.height;
          this.x = 0;
        } else {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }
      }
    }
    draw() {
      ctx.beginPath();
      if (
        mappedImage[this.position1] &&
        mappedImage[this.position1][this.position2]
      ) {
        ctx.fillStyle = mappedImage[this.position1][this.position2][1];
      }
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  init();

  function animate() {
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = `rgba(0, 0, 0, ${fillStyleAlpha})`;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      ctx.globalAlpha = particlesArray[i].speed * 0.5;
      particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
    endTime = new Date();
    let timeDelta = endTime - startTime;

    if (timeDelta > 30000) {
      location.reload(true);
    }

  }
  

  animate();
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("loaded");
});

socket.addEventListener("open", () => {
  content = document.getElementById("display");
  content.style.opacity = "0%";
  console.log("WebSocket connection established");
  socket.send(
    JSON.stringify({
      event: "CONNECT",
      client: "OBS_CLIENT_BRB",
    })
  );
});

socket.addEventListener("message", async (event) => {
  const data = JSON.parse(event.data);
  if (!data.event) {
    return;
  } else {
    switch (data.event) {
      case "START_BRB":
        username_box_div.style.display = "block";
        username_elm.innerText = data.user;
        document.body.style.backgroundImage = "url('talking.png')";
        break;

      case "END_BRB":
        username_box_div.style.display = "none";
        username_elm.innerText = "";
        document.body.style.backgroundImage = "url('idle.png')";
    }
  }
});

socket.addEventListener("close", () => {
  console.log("WS not connected");
});
