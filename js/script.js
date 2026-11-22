import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// basic scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080508);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// fix for when the browser window gets resized
window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// temporary cube until I finish the computer model
const geometry = new THREE.BoxGeometry(2, 2, 2);

const material = new THREE.MeshBasicMaterial({
    color: 0x990033
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// temporary floor
const floorGeometry = new THREE.PlaneGeometry(20, 20);

const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a101c,
    side: THREE.DoubleSide
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2;
scene.add(floor);

// temporary walls
const wallGeometry = new THREE.PlaneGeometry(20, 10);

const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x300812,
    side: THREE.DoubleSide
});

// keeping this here for now, but using the sculpt instead
const baseBackWall = new THREE.Mesh(wallGeometry, wallMaterial);
baseBackWall.position.z = -10.5;
baseBackWall.position.y = 3;
// scene.add(baseBackWall);

// imported ZBrush wall
const loader = new GLTFLoader();

loader.load(
    "models/flesh_wall_colored.glb",
    function(model) {
        const backWall = model.scene;

        // wall was sculpted from the side in ZBrush
        backWall.rotation.y = -Math.PI / 2;

        // trying to fit the sculpt to the back of the room
        const box = new THREE.Box3().setFromObject(backWall);
        const size = new THREE.Vector3();
        box.getSize(size);

        backWall.scale.set(
            20 / size.x,
            10 / size.y,
            20 / size.x
        );

        // center the wall after resizing
        const newBox = new THREE.Box3().setFromObject(backWall);
        const center = new THREE.Vector3();
        newBox.getCenter(center);

        backWall.position.set(
            -center.x,
            3 - center.y,
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

// lighting, might change this after importing the full room
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// red light for the breathing effect
const redLight = new THREE.PointLight(0xff4466, 150, 30);
redLight.position.set(0, 3, 0);
scene.add(redLight);

// keeps track of when the angry flash ends
let flashEndTime = 0;

// mouse controls
let yaw = 0;
let pitch = 0;

// click to lock the mouse into the game
renderer.domElement.addEventListener("click", function() {
    renderer.domElement.requestPointerLock();
});

document.addEventListener("mousemove", function(event) {
    if (document.pointerLockElement === renderer.domElement) {
        yaw -= event.movementX * 0.002;
        pitch -= event.movementY * 0.002;

        // stop the camera from turning too far up/down
        pitch = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, pitch)
        );

        camera.rotation.order = "YXZ";
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
    }
});

// WASD keys
const keys = {};

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();
    keys[key] = true;

    // E to interact when close enough
    if (key === "e") {
        const dialogueOpen =
            document.getElementById("dialogueBox").style.display === "block";

        const distance = camera.position.distanceTo(cube.position);

        if (distance < 5 && !dialogueOpen) {
            document.exitPointerLock();
            document.getElementById("dialogueBox").style.display = "block";
        }
    }
});

document.addEventListener("keyup", function(event) {
    keys[event.key.toLowerCase()] = false;
});

// added this because movement keys can get stuck when switching tabs
window.addEventListener("blur", function() {
    for (const key in keys) {
        keys[key] = false;
    }
});

// movement should stay the same speed even if FPS changes
const clock = new THREE.Clock();

// temporary limits so the player can't walk out of the room
const roomLimit = 9.5;

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    const dialogueOpen =
        document.getElementById("dialogueBox").style.display === "block";

    const speed = dialogueOpen ? 0 : 6;

    // check which direction the player is moving
    let forward = 0;
    let sideways = 0;

    if (keys["w"]) forward += 1;
    if (keys["s"]) forward -= 1;
    if (keys["a"]) sideways -= 1;
    if (keys["d"]) sideways += 1;

    // fix for moving faster diagonally
    const movementLength = Math.sqrt(
        forward * forward + sideways * sideways
    );

    if (movementLength > 0) {
        forward /= movementLength;
        sideways /= movementLength;
    }

    // movement follows the direction the camera is facing
    camera.position.x += (
        -Math.sin(yaw) * forward +
        Math.cos(yaw) * sideways
    ) * speed * delta;

    camera.position.z += (
        -Math.cos(yaw) * forward -
        Math.sin(yaw) * sideways
    ) * speed * delta;

    // keep the player inside the temporary room
    camera.position.x = THREE.MathUtils.clamp(
        camera.position.x,
        -roomLimit,
        roomLimit
    );

    camera.position.z = THREE.MathUtils.clamp(
        camera.position.z,
        -roomLimit,
        roomLimit
    );

    // check distance from the computer
    const distance = camera.position.distanceTo(cube.position);
    const interactionMessage =
        document.getElementById("interactionMessage");

    // only show the prompt when close enough and not talking
    if (distance < 5 && !dialogueOpen) {
        interactionMessage.style.display = "block";
    } else {
        interactionMessage.style.display = "none";
    }

    // pulsing light
    redLight.intensity =
        120 + Math.sin(Date.now() * 0.002) * 30;

    // flash when the computer gets angry
    if (Date.now() < flashEndTime) {
        redLight.intensity = 400;
    }

    renderer.render(scene, camera);
}

animate();

// typing effect for the computer responses
let typingTimer;

function typeText(message) {
    const response =
        document.getElementById("computerResponse");

    clearInterval(typingTimer);
    response.textContent = "";

    let i = 0;

    if (message.length === 0) {
        return;
    }

    typingTimer = setInterval(function() {
        response.textContent += message[i];
        i++;

        if (i >= message.length) {
            clearInterval(typingTimer);
        }
    }, 40);
}

// computer dialogue
document.getElementById("question1").onclick = function() {
    typeText("Something far greater than you.");
};

document.getElementById("question2").onclick = function() {
    typeText("Somewhere you were never meant to find.");
};

document.getElementById("question3").onclick = function() {
    typeText("Leave? How amusing.");

    // angry flash lasts half a second
    flashEndTime = Date.now() + 500;
};

// close dialogue
document.getElementById("closeDialogue").onclick = function() {
    clearInterval(typingTimer);
    document.getElementById("dialogueBox").style.display = "none";
};
