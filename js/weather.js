import * as THREE from 'three';
import * as globals from './globals.js';
import gameState from './gameState.js';
import { showMessage } from './utils.js';
import { setObjective, clearObjective } from './objectives.js';
import { updateTimeOfDay } from './time.js';
import { createZombies } from './zombies.js';

export function createRainParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = Math.random() * 1000 - 500;
        const y = Math.random() * 500 + 100;
        const z = Math.random() * 1000 - 500;
        vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });
    globals.setRainParticles(new THREE.Points(geometry, material));
    globals.rainParticles.visible = false;
    globals.scene.add(globals.rainParticles);
}

export function createSnowParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * 1000 - 500;
        const y = Math.random() * 500 + 100;
        const z = Math.random() * 1000 - 500;
        vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.2,
        transparent: true,
        opacity: 0.9
    });
    globals.setSnowParticles(new THREE.Points(geometry, material));
    globals.snowParticles.visible = false;
    globals.scene.add(globals.snowParticles);
}

export function createSandParticles() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 30000; i++) {
        const x = Math.random() * 1000 - 500;
        const y = Math.random() * 200 + 50;
        const z = Math.random() * 1000 - 500;
        vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0xd2b48c,
        size: 0.8,
        transparent: true,
        opacity: 0.8
    });
    globals.setSandParticles(new THREE.Points(geometry, material));
    globals.sandParticles.visible = false;
    globals.scene.add(globals.sandParticles);
}

export function updateParticles(particles, speed, delta) {
    if (!particles || !particles.visible) return;

    const positions = particles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= speed * delta;

        if (positions[i] < 0) {
            positions[i] = Math.random() * 500 + 100;
            positions[i-1] = Math.random() * 1000 - 500;
            positions[i+1] = Math.random() * 1000 - 500;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
}

export function applyWeather(type) {
    globals.rainParticles.visible = false;
    globals.snowParticles.visible = false;
    globals.sandParticles.visible = false;
    gameState.isLightningActive = false;

    gameState.currentWeather = type;
    gameState.weatherTimer = gameState.weatherEffectDuration;

    switch (type) {
        case 'thunderstorm':
            globals.ambientLight.intensity = 0.2;
            globals.directionalLight.intensity = 0.1;
            globals.directionalLight.color.set(0x888888);
            globals.scene.fog.color.set(0x555555);
            globals.scene.fog.density = 0.001;
            globals.rainParticles.visible = true;
            break;
        case 'snowstorm':
            globals.ambientLight.intensity = 0.7;
            globals.directionalLight.intensity = 0.05;
            globals.directionalLight.color.set(0xeeeeff);
            globals.scene.fog.color.set(0xcccccc);
            globals.scene.fog.density = 0.003;
            globals.snowParticles.visible = true;
            break;
        case 'sandstorm':
            globals.ambientLight.intensity = 0.3;
            globals.directionalLight.intensity = 0.1;
            globals.directionalLight.color.set(0xffaa00);
            globals.scene.fog.color.set(0xd2b48c);
            globals.scene.fog.density = 0.002;
            globals.sandParticles.visible = true;
            break;
        default:
            globals.ambientLight.intensity = 0.5;
            globals.directionalLight.intensity = 0.8;
            globals.directionalLight.color.set(0xffffff);
            globals.scene.fog.color.set(0x88ccff);
            globals.scene.fog.density = 0.0005;
            break;
    }
}

export function updateWeatherLogic(currentDay) {
    if (gameState.isCloudStormActive) return;

    if (currentDay > gameState.lastWeatherChangeDay) {
        if (currentDay % 30 === 0) {
            if (((currentDay / 30) % 2) === 1) {
                applyWeather('snowstorm');
                showMessage("UNA TEMPESTA DI NEVE SI STA AVVICINANDO!", 3000);
                setObjective("Raggiungi il rifugio prima della tempesta!", "reach_shelter");
            } else {
                applyWeather('sandstorm');
                showMessage("UNA TEMPESTA DI SABBIA SI STA AVVICINANDO!", 3000);
                setObjective("Raggiungi il rifugio prima della tempesta!", "reach_shelter");
            }
        } else if (currentDay % 10 === 0) {
            applyWeather('thunderstorm');
            showMessage("UN TEMPORALE SI STA AVVICINANDO!", 3000);
            setObjective("Attiva il Faro per disperdere la tempesta!", "activate_lighthouse");
        } else {
            if (gameState.currentWeather !== 'clear' && gameState.weatherTimer <= 0) {
                 applyWeather('clear');
                 showMessage("IL TEMPO E' MIGLIORATO!", 2000);
                 clearObjective();
            }
        }
        gameState.lastWeatherChangeDay = currentDay;
    }
}

export function triggerRandomLightning(delta) {
    if (gameState.isCloudStormActive) return;

    const lightningZombieSpawnChance = 0.05;
    const actualLightningZombieMinInterval = 90;
    const actualLightningZombieMaxInterval = 270;

    if (gameState.currentWeather === 'clear' && !gameState.isLightningActive) {
        gameState.lightningStrikeRandomTimer -= delta;
        if (gameState.lightningStrikeRandomTimer <= 0) {
            globals.directionalLight.intensity = 2.0;
            globals.scene.background.setRGB(0.8, 0.8, 0.9);
            gameState.isLightningActive = true;
            gameState.lightningFlickerTimer = gameState.lightningDuration;

            if (!gameState.lightningZombieExists && Math.random() < lightningZombieSpawnChance) {
                createZombies(1, true);
                gameState.lightningZombieExists = true;
                showMessage("UN ENORME ZOMBIE FULMINE E' APPARSO!", 3000);
            }

            gameState.lightningStrikeRandomTimer = Math.random() * (actualLightningZombieMaxInterval - actualLightningZombieMinInterval) + actualLightningZombieMinInterval;
        }
    }

    if (gameState.isLightningActive) {
        gameState.lightningFlickerTimer -= delta;
        if (gameState.lightningFlickerTimer <= 0) {
            globals.directionalLight.intensity = 0.8;
            updateTimeOfDay(globals.currentTime % 24);
            globals.scene.fog.color.set(0x88ccff);
            globals.scene.fog.density = 0.0005;
            gameState.isLightningActive = false;
        }
    }
}

export function addClouds(count) {
    const cloudGroup = new THREE.Group();

    for (let i = 0; i < count; i++) {
        const cloudGeometry = new THREE.SphereGeometry(Math.random() * 10 + 5, 8, 8);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

        cloud.position.set(
            (Math.random() - 0.5) * 800,
            50 + Math.random() * 30,
            (Math.random() - 0.5) * 800
        );

        cloud.userData.isCloud = true;
        cloud.userData.health = 1;

        cloudGroup.add(cloud);
    }

    globals.scene.add(cloudGroup);
    cloudGroup.children.forEach(cloud => globals.allInteractableMeshes.push(cloud));
    return cloudGroup;
}

export function triggerCloudStorm(cloudMesh) {
    const originalCloudMaterial = cloudMesh.material.clone();
    cloudMesh.material.color.set(0x00ffff);
    cloudMesh.material.emissive.set(0x00ffff);
    cloudMesh.material.emissiveIntensity = 0.8;
    cloudMesh.material.transparent = true;

    const scaleDownDuration = 0.5;
    let elapsedScaleTime = 0;
    const initialScale = cloudMesh.scale.clone();

    const animateCloudDissolution = () => {
        if (elapsedScaleTime < scaleDownDuration) {
            const progress = elapsedScaleTime / scaleDownDuration;
            cloudMesh.scale.lerpVectors(initialScale, new THREE.Vector3(0.01, 0.01, 0.01), progress);
            cloudMesh.material.opacity = 1 - progress;
            elapsedScaleTime += globals.clock.getDelta();
            requestAnimationFrame(animateCloudDissolution);
        } else {
            globals.scene.remove(cloudMesh);
            globals.allInteractableMeshes = globals.allInteractableMeshes.filter(m => m.uuid !== cloudMesh.uuid);
        }
    };
    animateCloudDissolution();

    gameState.isCloudStormActive = true;
    gameState.cloudStormTimer = gameState.triggeredRainDuration;
    gameState.cloudStormLightningTimer = 0;

    globals.scene.background.set(0x000000);
    globals.scene.fog.color.set(0x000000);
    globals.scene.fog.density = 0.01;
    globals.ambientLight.intensity = 0.05;
    globals.directionalLight.intensity = 0;

    globals.rainParticles.visible = true;

    if (globals.cloudsGroup) {
        globals.cloudsGroup.remove(cloudMesh);
    }
    addClouds(1);

    showMessage("TEMPESTA ELETTRICA SCATENATA!", 3000);
    setObjective("Attiva il Faro per disperdere la tempesta!", "activate_lighthouse");
}
