

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


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

const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x300812,
    side: THREE.DoubleSide
});


 // Original back wall behind the sculpt
const baseBackWall = new THREE.Mesh(wallGeometry, wallMaterial);
baseBackWall.position.z = -10.5;
baseBackWall.position.y = 3;
scene.add(baseBackWall);


// Load the sculpted back wall
const loader = new GLTFLoader();

loader.load(
    "models/flesh_wall_colored.glb",
    function(model) {
        const backWall = model.scene;

        // Resize the model to fit the back wall area
        const box = new THREE.Box3().setFromObject(backWall);
        const size = new THREE.Vector3();
        box.getSize(size);

       
// Keep the model's original proportions
const scale = 10 / Math.max(size.x, size.y, size.z);
backWall.scale.set(scale, scale, scale);


        // Place the wall at the back of the room
        const newBox = new THREE.Box3().setFromObject(backWall);
        const center = new THREE.Vector3();
        newBox.getCenter(center);

        backWall.position.set(
            -center.x,
            1 - center.y,
            -10 - center.z
        );

        scene.add(backWall);
    },
    undefined,
    function(error) {
        console.error("Wall model could not load:", error);
    }
);



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

// Soft pink lighting (whole room)
const ambientLight = new THREE.AmbientLight(0xff6688, 1.5);
scene.add(ambientLight);

// Red light (center)
const redLight = new THREE.PointLight(0xff4466, 150, 30);
redLight.position.set(0, 3, 0);
scene.add(redLight);

// Time when the angry flash should end
let flashEndTime = 0;

// Mouse controls
let yaw = 0;
let pitch = 0;

// click in & out of tab for mouse cam
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

    // Press E to interact with the computer
    if (event.key.toLowerCase() === "e") {

        // Check how close the player is
        const distance = camera.position.distanceTo(cube.position);

        if (distance < 5) {
document.exitPointerLock();

document.getElementById("dialogueBox").style.display = "block";
        }
    }
});


document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});

function animate() {

 // WASD movement + camera
const dialogueOpen =
    document.getElementById("dialogueBox").style.display === "block";

const speed = dialogueOpen ? 0 : 0.1;

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

    // check player distance 
const distance = camera.position.distanceTo(cube.position);

// int msg
const interactionMessage = document.getElementById("interactionMessage");


// Show the interaction prompt only when not talking
if (distance < 5 && !dialogueOpen) {
    interactionMessage.style.display = "block";
} else {
    interactionMessage.style.display = "none";
}


    // Normal breathing light
    redLight.intensity = 120 + Math.sin(Date.now() * 0.002) * 30;

    // Flash bright red when the computer gets angry
    if (Date.now() < flashEndTime) {
        redLight.intensity = 400;
    }


    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

animate();


 // Typing animation for the flesh computer
let typingTimer;

function typeText(message) {
    const response = document.getElementById("computerResponse");

    clearInterval(typingTimer);
    response.textContent = "";

    let i = 0;

    typingTimer = setInterval(function() {
        response.textContent += message[i];
        i++;

        if (i >= message.length) {
            clearInterval(typingTimer);
        }
    }, 40);
}



/* Dialogue question responses */

document.getElementById("question1").onclick = function() {
    document.getElementById("computerResponse").textContent =
        "Something far greater than you.";
};

document.getElementById("question2").onclick = function() {
    document.getElementById("computerResponse").textContent =
        "Somewhere you were never meant to find.";
};


document.getElementById("question3").onclick = function() {
    document.getElementById("computerResponse").textContent =
        "Leave? How amusing.";

    // Trigger a bright red flash for half a second
    flashEndTime = Date.now() + 500;
};


/* Close the dialogue box */

document.getElementById("closeDialogue").onclick = function() {
    document.getElementById("dialogueBox").style.display = "none";
};


