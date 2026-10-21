
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080508);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);


camera.position.z = 8;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// cube stsnd in
const geometry = new THREE.BoxGeometry(2, 2, 2);

const material = new THREE.MeshBasicMaterial({
    color: 0x990033
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// floor
const floorGeometry = new THREE.PlaneGeometry(20, 20);

const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a101c,
    side: THREE.DoubleSide
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);


// back wall
const wallGeometry = new THREE.PlaneGeometry(20, 10);

const wallMaterial = new THREE.MeshBasicMaterial({
    color: 0x300812,
    side: THREE.DoubleSide
});

const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
backWall.position.z = -10;
backWall.position.y = 3;
scene.add(backWall);

// left wall
const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2;
leftWall.position.x = -10;
leftWall.position.y = 3;

scene.add(leftWall);


// right wall
const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.rotation.y = Math.PI / 2;
rightWall.position.x = 10;
rightWall.position.y = 3;

scene.add(rightWall);

// Mouse controls
let yaw = 0;
let pitch = 0;

// Click the game to control the mouse
renderer.domElement.addEventListener("click", function() {
    renderer.domElement.requestPointerLock();
});

// Move the camera with the mouse
document.addEventListener("mousemove", function(event) {

    if (document.pointerLockElement === renderer.domElement) {

        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;

        // Stop the camera from looking too far up or down
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

        camera.rotation.order = "YXZ";
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
    }
});

// WASD movement
const keys = {};

document.addEventListener("keydown", function(event) {
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});

function animate() {

 // WASD movement based on camera direction
const speed = 0.1;

// Forward
if (keys["w"]) {
    camera.position.x -= Math.sin(yaw) * speed;
    camera.position.z -= Math.cos(yaw) * speed;
}

// Backward
if (keys["s"]) {
    camera.position.x += Math.sin(yaw) * speed;
    camera.position.z += Math.cos(yaw) * speed;
}

// Left
if (keys["a"]) {
    camera.position.x -= Math.cos(yaw) * speed;
    camera.position.z += Math.sin(yaw) * speed;
}

// Right
if (keys["d"]) {
    camera.position.x += Math.cos(yaw) * speed;
    camera.position.z -= Math.sin(yaw) * speed;
}

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

animate();

