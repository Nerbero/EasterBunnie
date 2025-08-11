import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import * as globals from './globals.js';
import { createEnvironment } from './environment.js';
import { createWeapons } from './assets.js';
import { createRainParticles, createSnowParticles, createSandParticles } from './weather.js';
import { updateUIVisibility } from './ui.js';
import { setupEventListeners } from './events.js';
import { updateTimeOfDay } from './time.js';
import { radarSize } from './constants.js';

export function initScene() {
    globals.setClock(new THREE.Clock());
    globals.setScene(new THREE.Scene());
    globals.scene.background = new THREE.Color(0x0a192f);
    globals.scene.fog = new THREE.FogExp2(0x88ccff, 0.0005);

    globals.setCamera(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
    globals.camera.position.y = 1.6;

    globals.setRenderer(new THREE.WebGLRenderer({ antialias: true }));
    globals.renderer.setPixelRatio(window.devicePixelRatio);
    globals.renderer.setSize(window.innerWidth, window.innerHeight);
    globals.renderer.shadowMap.enabled = true;
    document.body.appendChild(globals.renderer.domElement);

    const sceneContainer = document.createElement('div');
    sceneContainer.id = 'scene-container';
    document.body.insertBefore(sceneContainer, document.body.firstChild);
    sceneContainer.appendChild(globals.renderer.domElement);

    globals.setAmbientLight(new THREE.AmbientLight(0x404040, 0.5));
    globals.scene.add(globals.ambientLight);

    globals.setDirectionalLight(new THREE.DirectionalLight(0xffffff, 0.8));
    globals.directionalLight.position.set(50, 100, 50);
    globals.directionalLight.castShadow = true;
    globals.scene.add(globals.directionalLight);

    createEnvironment();

    globals.setControls(new PointerLockControls(globals.camera, globals.renderer.domElement));
    globals.scene.add(globals.controls.getObject());

    createWeapons();

    createRainParticles();
    createSnowParticles();
    createSandParticles();

    globals.setRadarCanvas(document.getElementById('radarCanvas'));
    if (globals.radarCanvas) {
        globals.setRadarCtx(globals.radarCanvas.getContext('2d'));
        globals.radarCanvas.width = radarSize;
        globals.radarCanvas.height = radarSize;
    }

    setupEventListeners();

    globals.setCurrentTime(12);
    updateTimeOfDay(globals.currentTime);

    updateUIVisibility();
}
