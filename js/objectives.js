import * as THREE from 'three';
import gameState from './gameState.js';
import * as globals from './globals.js';
import { showMessage, updateAllInteractableMeshes } from './utils.js';
import { zombieHit } from './zombies.js';
import { createElectricChain } from './effects.js';
import { spawnPowerUp } from './powerups.js';

export function setObjective(text, type) {
    gameState.currentObjective = { text: text, type: type };
    globals.objectiveDisplay.textContent = `OBIETTIVO: ${text}`;
    globals.objectiveDisplay.style.display = 'block';
    gameState.objectiveTimer = gameState.objectiveDuration;
}

export function clearObjective() {
    gameState.currentObjective = null;
    globals.objectiveDisplay.style.display = 'none';
}

export function updateObjective(delta) {
    if (gameState.currentObjective) {
        gameState.objectiveTimer -= delta;
        if (gameState.objectiveTimer <= 0) {
            showMessage("OBIETTIVO FALLITO!", 2000);
            clearObjective();
        }
        if (gameState.currentObjective.type === 'activate_lighthouse' && gameState.lighthouseMesh.userData.isActive) {
            showMessage("OBIETTIVO COMPLETATO: Faro Attivato!", 2000);
            clearObjective();
        }
    }
}

export function createLighthouse() {
    const lighthouseGroup = new THREE.Group();

    const baseGeometry = new THREE.CylinderGeometry(5, 6, 8, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 4;
    lighthouseGroup.add(base);

    const towerGeometry = new THREE.CylinderGeometry(3, 4, 25, 16);
    const towerMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 8 + 12.5;
    lighthouseGroup.add(tower);

    const lanternRoomGeometry = new THREE.CylinderGeometry(3.5, 3.5, 5, 16);
    const lanternRoomMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lanternRoom = new THREE.Mesh(lanternRoomGeometry, lanternRoomMaterial);
    lanternRoom.position.y = 8 + 25 + 2.5;
    lighthouseGroup.add(lanternRoom);

    const lanternGlassGeometry = new THREE.CylinderGeometry(3, 3, 4, 16);
    const lanternGlassMaterial = new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.6 });
    const lanternGlass = new THREE.Mesh(lanternGlassGeometry, lanternGlassMaterial);
    lanternGlass.position.y = 8 + 25 + 2.5;
    lighthouseGroup.add(lanternGlass);

    const lightSourceGeometry = new THREE.SphereGeometry(1, 8, 8);
    const lightSourceMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5 });
    const lightSource = new THREE.Mesh(lightSourceGeometry, lightSourceMaterial);
    lightSource.position.y = 8 + 25 + 2.5;
    lighthouseGroup.add(lightSource);

    const beaconLight = new THREE.SpotLight(0xffffff, 0, 200, Math.PI / 6, 0.5, 2);
    beaconLight.position.set(0, 8 + 25 + 2.5, 0);
    beaconLight.target.position.set(0, 8 + 25 + 2.5, -1);
    beaconLight.castShadow = true;
    lighthouseGroup.add(beaconLight);
    lighthouseGroup.add(beaconLight.target);
    beaconLight.visible = false;

    lighthouseGroup.position.set(150, 0, -150);
    lighthouseGroup.userData.isLighthouse = true;
    lighthouseGroup.userData.isActive = false;
    lighthouseGroup.userData.beaconLight = beaconLight;

    globals.scene.add(lighthouseGroup);
    gameState.lighthouseMesh = lighthouseGroup;
    updateAllInteractableMeshes();
}

export function toggleLighthouse() {
    if (gameState.lighthouseMesh) {
        const lighthouse = gameState.lighthouseMesh;
        lighthouse.userData.isActive = !lighthouse.userData.isActive;
        lighthouse.userData.beaconLight.visible = lighthouse.userData.isActive;
        lighthouse.userData.beaconLight.intensity = lighthouse.userData.isActive ? 5.0 : 0;
        showMessage(lighthouse.userData.isActive ? "BOBINA DI TESLA ATTIVATA!" : "BOBINA DI TESLA DISATTIVATA!", 2000);

        if (lighthouse.userData.isActive) {
            gameState.zombies.forEach(zombie => {
                if (zombie.mesh.position.distanceTo(lighthouse.position) < 100 && !zombie.mesh.userData.isKamikazeBunny) {
                    zombieHit(zombie, 50);
                    createElectricChain(lighthouse.position, zombie.mesh.position);
                } else if (zombie.mesh.userData.isKamikazeBunny) {
                    spawnPowerUp(zombie.mesh.position, 'random');
                    zombieHit(zombie, zombie.health);
               }
            });
        }
    }
}

export function enterSpaceship() {
    showMessage("Entrato nella navicella! Navigando verso nuovi mondi psicodidattici...", 3000);
    setTimeout(() => window.location.href = "https://tuo-altrogame.com", 3000);
}
