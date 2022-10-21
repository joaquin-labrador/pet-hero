import Stats from "./stats.module.js";
import * as THREE from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

//let composer;
let scene, camera, stats;
let renderer, mixer, clock;
let container;
let pet, rotationDirection = 1, rotation = 0;

const MODELS_PATH = "/pet-hero/Views/models/";
let models
const userType = getUserType();
if (userType == "owner") {
    models = getOwnerModels();
} else if (userType == "keeper") {
    models = getKeeperModels();
} else {
    models = getModels();
}

const i = Math.floor(Math.random() * models.length);
const model = models[i];

const REDUCED_SIZE = 0.73;
const WIDTH = 400;
const HEIGHT = 400;
const ROTATION_VELOCITY = 0.005;

init();

function init() {
    // appending stats
    // showStats();

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.setClearColor(0x000000, 0);
    container = document.getElementById("pet-figure");
    //renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);

    // creating the scene
    scene = new THREE.Scene();
    scene.background = null;

    // creating the camera
    camera = new THREE.PerspectiveCamera(30, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(0, 0, 0);
    scene.add(camera);

    // creating the light
    scene.add(new THREE.AmbientLight(0x404040));
    const pointLight = new THREE.PointLight(0xffffff, 1);
    camera.add(pointLight);

    pet = new THREE.Object3D();
    scene.add(pet);

    // loading the model
    new GLTFLoader().load(model.file, (gltf) => {
        pet.rotation.set(0, 9.42, 0);
        pet.scale.set(model.size[0] * (1 - REDUCED_SIZE), model.size[1] * (1 - REDUCED_SIZE), model.size[2] * (1 - REDUCED_SIZE));
        pet.position.set(model.position[0], model.position[1], model.position[2]);
        pet.rotation.set(model.rotation[0], model.rotation[1], model.rotation[2]);
        pet.model = gltf.scene;
        pet.add(pet.model);

        mixer = new THREE.AnimationMixer(pet);
        const clip = gltf.animations[0];
        if (clip) mixer.clipAction(clip.optimize()).play();
        animate();
    });

    // creating lights
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(-0.75, 1, 3.8);
    light.rotation.set(0, -0.2, 0);

    scene.add(light);

    // floor grid helper
    // scene.add(new THREE.GridHelper(10, 10));

    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    const canvas = renderer.domElement;
    // look up the size the canvas is being displayed
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    if (stats) stats.update();

    //composer.render();
    renderer.render(scene, camera);

    if (rotation > 0.8) {
        if (rotationDirection == 1) rotationDirection = -1;
    } else if (rotation < -0.6) {
        if (rotationDirection == -1) rotationDirection = 1;
    }

    pet.rotation.y += rotationDirection * ROTATION_VELOCITY;
    rotation += rotationDirection * ROTATION_VELOCITY;
}

function showStats() {
    const container = document.getElementById("container");
    stats = new Stats();
    container.appendChild(stats.dom);
}

// models
function getOwnerModels() {
    // Kevin Reyna <3
    return [
        // "Just a Hungry Cat" (https://skfb.ly/oyvPQ) by Coco Jinjo
        {
            file: MODELS_PATH + "just_a_hungry_cat.glb",
            size: [2, 2, 2],
            position: [0, -0.2, -1.5],
            rotation: [0.1, -0.5, 0],
        },

        // "Kitty Cat" (https://skfb.ly/otHnL) by roto
        {
            file: MODELS_PATH + "kitty_cat.glb",
            size: [0.5, 0.5, 0.5],
            position: [0, -0.21, -1.5],
            rotation: [0.1, -0.85, 0],
        },

        // "Cute Cat" (https://skfb.ly/6SwZP) by Fayme Wong
        {
            file: MODELS_PATH + "cute_cat.glb",
            size: [0.565, 0.565, 0.565],
            position: [0.03, -0.24, -1.5],
            rotation: [0.1, -0.85, 0],
        },        
        // These models are licensed under Creative Commons Attribution
        // (http://creativecommons.org/licenses/by/4.0/).
    ];
}

function getKeeperModels() {
    return [
        // "Medieval viking house" (https://skfb.ly/oqCNs) by vlad_design228
        {
            file: MODELS_PATH + "medieval_viking_house.glb",
            size: [0.36, 0.36, 0.36],
            position: [0.06, -0.03, -1.5],
            rotation: [0.1, -0.5, 0],
        },

        // "Hotel Building" (https://skfb.ly/6XuKU) by HerbeMalveillante
        {
            file: MODELS_PATH + "hotel_building.glb",
            size: [0.05, 0.05, 0.05],
            position: [0.06, -0.17, -1.5],
            rotation: [0.1, -0.3, 0],
        },
        // These models are licensed under Creative Commons Attribution
        // (http://creativecommons.org/licenses/by/4.0/).
    ];
}

function getModels() {
    return getOwnerModels().concat(getKeeperModels());
}

function getUserType() {
    const path = window.location.pathname;
    const userType = (path.split("/")[2]).toLowerCase();
    return userType;
}