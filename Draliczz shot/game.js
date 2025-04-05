const canvas = document.getElementById('gameCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the camera and movement parameters
let player = {
    x: 0,
    y: 2,
    z: 0,
    speed: 0.1,
    yaw: 0,
    pitch: 0,
    sensitivity: 0.002
};

let isMouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;
const keys = {};

// Set up the ground (for visualization)
const geometry = new THREE.PlaneGeometry(100, 100);
const material = new THREE.MeshBasicMaterial({ color: 0x008000, side: THREE.DoubleSide });
const ground = new THREE.Mesh(geometry, material);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// WebSocket setup for multiplayer
const socket = io.connect('http://localhost:3000');
let otherPlayers = {};

// Handle mouse look
canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        player.yaw += deltaX * player.sensitivity;
        player.pitch -= deltaY * player.sensitivity;

        player.pitch = Math.max(Math.min(player.pitch, Math.PI / 2), -Math.PI / 2); // Limit pitch

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

// Lock the mouse and track its movement
canvas.addEventListener('mousedown', (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    canvas.requestPointerLock();
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
    document.exitPointerLock();
});

// Handle keyboard movement
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

function update() {
    // Update player position based on keyboard input
    if (keys['ArrowUp'] || keys['KeyW']) {
        player.x += Math.sin(player.yaw) * player.speed;
        player.z -= Math.cos(player.yaw) * player.speed;
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        player.x -= Math.sin(player.yaw) * player.speed;
        player.z += Math.cos(player.yaw) * player.speed;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= Math.cos(player.yaw) * player.speed;
        player.z -= Math.sin(player.yaw) * player.speed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += Math.cos(player.yaw) * player.speed;
        player.z += Math.sin(player.yaw) * player.speed;
    }

    // Send player's position to the server
    socket.emit('playerMove', {
        x: player.x,
        y: player.y,
        z: player.z,
        yaw: player.yaw,
        pitch: player.pitch
    });

    // Render scene
    camera.position.set(player.x, player.y, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}

update();
