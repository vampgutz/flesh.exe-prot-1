
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


// Draw the scene
renderer.render(scene, camera);
