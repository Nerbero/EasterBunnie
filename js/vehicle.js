import * as THREE from 'three';
import gameState from './gameState.js';
import * as globals from './globals.js';
import { showMessage } from './utils.js';
import { updateVehicleDashboardUI, updateUIVisibility } from './ui.js';
import { movement } from './constants.js';

export function enterVehicle() {
    if (gameState.inVehicle) return;

    gameState.inVehicle = true;
    globals.vehicleGroup.userData.occupied = true;

    globals.setOriginalCameraPosition(globals.camera.position.clone());
    globals.setVehicleLastPosition(globals.vehicleGroup.position.clone());

    gameState.weapons[gameState.currentWeapon].mesh.visible = false;

    globals.controls.unlock();

    const cockpitGroup = globals.vehicleGroup.userData.cockpitGroup;
    if (cockpitGroup) {
        cockpitGroup.add(globals.camera);
        globals.camera.position.set(0, 0.2, 0.7);
        globals.camera.rotation.set(0, 0, 0);
        globals.camera.lookAt(new THREE.Vector3(0, 0.2, -10));
    } else {
        globals.vehicleGroup.add(globals.camera);
        globals.camera.position.set(0, 5, 10);
        globals.camera.lookAt(new THREE.Vector3(0, 2, 0));
    }

    if (globals.vehicleGroup.userData.steeringWheel) globals.vehicleGroup.userData.steeringWheel.visible = true;
    if (globals.vehicleGroup.userData.steeringColumn) globals.vehicleGroup.userData.steeringColumn.visible = true;
    if (globals.vehicleGroup.userData.leftHand) globals.vehicleGroup.userData.leftHand.visible = true;
    if (globals.vehicleGroup.userData.rightHand) globals.vehicleGroup.userData.rightHand.visible = true;

    updateUIVisibility();
    globals.interactionPrompt.style.display = 'none';

    showMessage("ENTRATO NELLA MACCHINA!", 1500);
}

export function exitVehicle() {
    if (!gameState.inVehicle) return;

    gameState.inVehicle = false;
    globals.vehicleGroup.userData.occupied = false;

    if (globals.vehicleGroup.userData.steeringWheel) globals.vehicleGroup.userData.steeringWheel.visible = false;
    if (globals.vehicleGroup.userData.steeringColumn) globals.vehicleGroup.userData.steeringColumn.visible = false;
    if (globals.vehicleGroup.userData.leftHand) globals.vehicleGroup.userData.leftHand.visible = false;
    if (globals.vehicleGroup.userData.rightHand) globals.vehicleGroup.userData.rightHand.visible = false;

    globals.scene.add(globals.camera);
    globals.camera.position.copy(globals.originalCameraPosition);
    globals.camera.rotation.set(0, 0, 0);
    globals.controls.getObject().rotation.set(0, 0, 0);
    globals.controls.getObject().position.copy(globals.originalCameraPosition);

    if (!globals.isTouchDevice) {
        globals.controls.lock();
    }

    gameState.weapons[gameState.currentWeapon].mesh.visible = true;

    if (globals.vehicleLight) {
        globals.vehicleLight.visible = false;
        globals.vehicleLight.intensity = 0;
    }

    updateUIVisibility();

    showMessage("USCITO DALLA MACCHINA!", 1500);
}

export function shootVehicleMachineGun() {
    if (!gameState.inVehicle) return;

    const weaponData = gameState.vehicleWeapons.machineGun;
    const currentTime = performance.now();

    if (currentTime - weaponData.lastShotTime < weaponData.fireRate * 1000) {
        return;
    }

    if (weaponData.ammo <= 0 || weaponData.isShooting) {
        showMessage("MUNIZIONI MITRAGLIATRICE SCARICHE!", 1000);
        return;
    }

    weaponData.ammo--;
    updateVehicleDashboardUI();
    weaponData.lastShotTime = currentTime;

    if (weaponData.muzzleFlashLight && weaponData.muzzleFlashMesh) {
        weaponData.muzzleFlashLight.intensity = 5.0;
        weaponData.muzzleFlashMesh.material.opacity = 1.0;
        setTimeout(() => {
            weaponData.muzzleFlashLight.intensity = 0;
            weaponData.muzzleFlashMesh.material.opacity = 0;
        }, 50);
    }

    const numProjectiles = 5;
    const spreadAngle = 0.2;

    for (let i = 0; i < numProjectiles; i++) {
        const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

        const vehicleForward = new THREE.Vector3(0, 0, -1).applyQuaternion(globals.vehicleGroup.quaternion);
        projectile.position.copy(globals.vehicleGroup.position).add(vehicleForward.multiplyScalar(4));
        projectile.position.y += 1.5;

        const shootDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(globals.vehicleGroup.quaternion);

        const angleX = (Math.random() - 0.5) * spreadAngle;
        const angleY = (Math.random() - 0.5) * spreadAngle;

        const tempQuaternion = new THREE.Quaternion();
        tempQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleX);
        shootDirection.applyQuaternion(tempQuaternion);

        tempQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), angleY);
        shootDirection.applyQuaternion(tempQuaternion);

        projectile.userData.velocity = shootDirection.multiplyScalar(70);
        projectile.userData.damage = weaponData.damage;

        globals.scene.add(projectile);
        gameState.projectiles.push(projectile);
    }
}

export function shootVehicleCannon() {
    if (!gameState.inVehicle) return;

    const weaponData = gameState.vehicleWeapons.cannon;
    const currentTime = performance.now();

    if (currentTime - weaponData.lastShotTime < weaponData.fireRate * 1000) {
        return;
    }

    if (weaponData.ammo <= 0 || weaponData.isShooting) {
        showMessage("MUNIZIONI CANNONE SCARICHE!", 1000);
        return;
    }

    weaponData.ammo--;
    updateVehicleDashboardUI();
    weaponData.lastShotTime = currentTime;

    gameState.isDistorted = true;
    gameState.distortionTimer = 0.2;
    if (globals.distortionOverlay) {
        globals.distortionOverlay.style.display = 'block';
        globals.distortionOverlay.classList.add('active');
    }

    const projectileGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 0.8 });
    const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

    const vehicleForward = new THREE.Vector3(0, 0, -1).applyQuaternion(globals.vehicleGroup.quaternion);
    projectile.position.copy(globals.vehicleGroup.position).add(vehicleForward.multiplyScalar(4));
    projectile.position.y += 1.5;

    const shootDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(globals.vehicleGroup.quaternion);
    projectile.userData.velocity = shootDirection.multiplyScalar(40);
    projectile.userData.damage = weaponData.damage;
    projectile.userData.isCannonBall = true;

    globals.scene.add(projectile);
    gameState.projectiles.push(projectile);
}

export function toggleVehicleHeadlights() {
    if (globals.vehicleLight) {
        globals.vehicleLight.visible = !globals.vehicleLight.visible;
        globals.vehicleLight.intensity = globals.vehicleLight.visible ? 2.0 : 0;
        updateVehicleDashboardUI();
        showMessage(globals.vehicleLight.visible ? "FARI ACCESI" : "FARI SPENTI", 1000);
    }
}

export function switchVehicleWeapon() {
    if (!gameState.inVehicle) return;

    if (gameState.currentVehicleWeapon === 'machineGun') {
        gameState.currentVehicleWeapon = 'cannon';
    } else {
        gameState.currentVehicleWeapon = 'machineGun';
    }
    updateVehicleDashboardUI();
    showMessage(`ARMA: ${gameState.vehicleWeapons[gameState.currentVehicleWeapon].name}`, 1000);
}
