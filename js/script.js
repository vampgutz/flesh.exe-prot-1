
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// Create the scene
const scene = new THREE.Scene();

// Set the background color
scene.background = new THREE.Color(0x080508);

// Create the camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Move the camera backward
camera.position.z = 8;

// Create the renderer
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer to the page
document.body.appendChild(renderer.domElement);

// Create a red cube
const geometry = new THREE.BoxGeometry(2, 2, 2);

const material = new THREE.MeshBasicMaterial({
    color: 0x990033
});

const cube = new THREE.Mesh(geometry, material);

// Add the cube to the scene
scene.add(cube);


// Create the floor
const floorGeometry = new THREE.PlaneGeometry(20, 20);

const floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x4a101c,
    side: THREE.DoubleSide
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);

// Lay the floor flat
floor.rotation.x = -Math.PI / 2;

// Move the floor below the cube
floor.position.y = -2;

// Add the floor to the scene
scene.add(floor);


// Create the back wall
const wallGeometry = new THREE.PlaneGeometry(20, 10);

const wallMaterial = new THREE.MeshBasicMaterial({
    color: 0x300812,
    side: THREE.DoubleSide
});

const backWall = new THREE.Mesh(wallGeometry, wallMaterial);

// Position the wall behind the cube
backWall.position.z = -10;
backWall.position.y = 3;

// Add the wall to the scene
scene.add(backWall);

// Draw the scene
renderer.render(scene, camera);
