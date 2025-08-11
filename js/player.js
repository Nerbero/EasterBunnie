import * as THREE from 'three';
import gameState from './gameState.js';
import * as globals from './globals.js';
import { showMessage } from './utils.js';
import { updateUI } from './ui.js';
import { rockHit } from './assets.js';
import { triggerCloudStorm } from './weather.js';
import { explodeFuelBarrel } from './powerups.js';
import { updateAllInteractableMeshes } from './utils.js';

export function shoot() {
    if (gameState.inVehicle) return;

    const currentWeaponData = gameState.weapons[gameState.currentWeapon];
    const currentTime = performance.now();

    if (currentTime - currentWeaponData.lastShotTime < currentWeaponData.fireRate * 1000) {
        return;
    }

    if (currentWeaponData.ammo <= 0 || gameState.isReloading || currentWeaponData.isShooting) return;

    currentWeaponData.ammo--;
    updateUI();
    currentWeaponData.lastShotTime = currentTime;

    currentWeaponData.isShooting = true;
    const weaponMesh = currentWeaponData.mesh;
    const originalWeaponPosition = weaponMesh.position.clone();
    const recoilAmount = currentWeaponData.recoilAmount;
    const recoilDuration = currentWeaponData.recoilDuration;

    weaponMesh.position.z += recoilAmount;
    setTimeout(() => {
      weaponMesh.position.z = originalWeaponPosition.z;
      currentWeaponData.isShooting = false;
    }, recoilDuration);

    gameState.lastShotPosition = globals.camera.position.clone();

    const actualDamage = gameState.isDamageBoostActive ? currentWeaponData.damage * gameState.damageBoostMultiplier : currentWeaponData.damage;

    if (gameState.currentWeapon === 'rifle') {
      const projectileGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

      projectile.position.copy(globals.camera.position);
      const shootDirection = new THREE.Vector3();
      globals.camera.getWorldDirection(shootDirection);
      projectile.userData.velocity = shootDirection.multiplyScalar(50);
      projectile.userData.damage = actualDamage;

      globals.scene.add(projectile);
      gameState.projectiles.push(projectile);
    } else if (gameState.currentWeapon === 'shotgun') {
      for (let i = 0; i < currentWeaponData.pellets; i++) {
          const projectileGeometry = new THREE.SphereGeometry(0.03, 8, 8);
          const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
          const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

          projectile.position.copy(globals.camera.position);
          const shootDirection = new THREE.Vector3();
          globals.camera.getWorldDirection(shootDirection);

          const angleX = (Math.random() - 0.5) * currentWeaponData.spreadAngle;
          const angleY = (Math.random() - 0.5) * currentWeaponData.spreadAngle;

          const tempQuaternion = new THREE.Quaternion();
          tempQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angleX);
          shootDirection.applyQuaternion(tempQuaternion);

          tempQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), angleY);
          shootDirection.applyQuaternion(tempQuaternion);

          projectile.userData.velocity = shootDirection.multiplyScalar(50);
          projectile.userData.damage = actualDamage;

          globals.scene.add(projectile);
          gameState.projectiles.push(projectile);
      }
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), globals.camera);
    const intersects = raycaster.intersectObjects(globals.allInteractableMeshes, true);

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      let parentObject = hitObject;
      while (parentObject && !parentObject.userData.isZombie && !parentObject.userData.isDestructibleRock && !parentObject.userData.isCloud && !parentObject.userData.isPowerUp && !parentObject.userData.isLighthouse && parentObject.parent) {
          parentObject = parentObject.parent;
      }

      if (parentObject && parentObject.userData.isZombie) {
          const zombie = gameState.zombies.find(z => z.mesh.uuid === parentObject.userData.zombieId);
          if (zombie) {
          }
      } else if (parentObject && parentObject.userData.isDestructibleRock) {
          rockHit(parentObject, actualDamage);
      } else if (parentObject && parentObject.userData.isCloud) {
          triggerCloudStorm(parentObject);
      } else if (parentObject && parentObject.userData.isPowerUp && parentObject.userData.type === 'vehicle_fuel') {
          explodeFuelBarrel(parentObject.position);
          globals.scene.remove(parentObject);
          gameState.powerUps = gameState.powerUps.filter(p => p.mesh.uuid !== parentObject.uuid);
          updateAllInteractableMeshes();
      }
    }

    if (currentWeaponData.ammo === 0) {
      showMessage("RICARICA!", 1000);
      reload();
    }
}

export function reload() {
    if (gameState.inVehicle) return;

    const currentWeaponData = gameState.weapons[gameState.currentWeapon];
    if (gameState.isReloading || currentWeaponData.ammo === currentWeaponData.clipSize) return;

    gameState.isReloading = true;
    showMessage("RICARICA IN CORSO...", 2000);

    setTimeout(() => {
      currentWeaponData.ammo = currentWeaponData.clipSize;
      gameState.isReloading = false;
      updateUI();
      showMessage("PRONTO!", 1000);
    }, 2000);
}

export function switchWeapon() {
    if (gameState.inVehicle) return;

    gameState.weapons[gameState.currentWeapon].mesh.visible = false;

    if (gameState.currentWeapon === 'rifle') {
        gameState.currentWeapon = 'shotgun';
    } else {
        gameState.currentWeapon = 'rifle';
    }

    gameState.weapons[gameState.currentWeapon].mesh.visible = true;
    updateUI();
    showMessage(`ARMA: ${gameState.weapons[gameState.currentWeapon].name}`, 1000);
}

export function toggleNightVision() {
    gameState.nightVision = !gameState.nightVision;
    globals.nightVisionOverlay.style.display = gameState.nightVision ? 'block' : 'none';
}
