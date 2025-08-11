import * as THREE from 'three';
import gameState from './gameState.js';
import * as globals from './globals.js';
import { showMessage, updateAllInteractableMeshes, applyAOEDamage } from './utils.js';
import { updateUI, updateVehicleDashboardUI } from './ui.js';
import { createAtomicMushroom, showHitEffect } from './effects.js';
import { gameOver } from './gameLogic.js';

export function spawnPowerUp(position, type = null) {
    const randomType = Math.random();
    const powerUpType = type || (randomType < 0.3 ? 'vehicle_fuel' : (randomType < 0.6 ? 'health' : (randomType < 0.8 ? 'ammo' : 'speed_boost')));

    const spawnPosition = position || new THREE.Vector3(
      (Math.random() - 0.5) * 80,
      0.5,
      (Math.random() - 0.5) * 80
    );

    let geometry, material;
    let powerUpMesh;

    if (powerUpType === 'health') {
        const carrotBody = new THREE.Mesh(
            new THREE.ConeGeometry(0.5, 2, 16),
            new THREE.MeshBasicMaterial({ color: 0xffa500 })
        );
        carrotBody.rotation.x = Math.PI / 2;
        const carrotLeaves = new THREE.Mesh(
            new THREE.ConeGeometry(0.3, 0.8, 8),
            new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        );
        carrotLeaves.position.y = 1.2;
        powerUpMesh = new THREE.Group();
        powerUpMesh.add(carrotBody);
        powerUpMesh.add(carrotLeaves);
        powerUpMesh.rotation.z = Math.PI / 2;
        powerUpMesh.scale.set(0.8, 0.8, 0.8);
    } else if (powerUpType === 'ammo') {
        geometry = new THREE.SphereGeometry(0.8, 32, 16);
        geometry.applyMatrix4(new THREE.Matrix4().makeScale(1.0, 1.3, 1.0));
        material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
        powerUpMesh = new THREE.Mesh(geometry, material);
    } else if (powerUpType === 'damage_boost') {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0.5, 1);
        shape.lineTo(0.2, 1);
        shape.lineTo(0.7, 2);
        shape.lineTo(0.2, 1.5);
        shape.lineTo(0.7, 0.5);
        shape.lineTo(0, 0.5);
        const extrudeSettings = {
            steps: 1,
            depth: 0.2,
            bevelEnabled: false
        };
        geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        material = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.8 });
        powerUpMesh = new THREE.Mesh(geometry, material);
        powerUpMesh.scale.set(0.8, 0.8, 0.8);
        powerUpMesh.rotation.x = Math.PI / 2;
        powerUpMesh.rotation.z = Math.PI / 4;
    } else if (powerUpType === 'speed_boost') {
        const footGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        footGeometry.applyMatrix4(new THREE.Matrix4().makeScale(1.0, 0.5, 1.2));
        const footMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const foot = new THREE.Mesh(footGeometry, footMaterial);

        const toeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const toeMaterial = new THREE.MeshBasicMaterial({ color: 0xffaacc });

        const toe1 = new THREE.Mesh(toeGeometry, toeMaterial);
        toe1.position.set(-0.25, 0.2, 0.2);
        foot.add(toe1);
        const toe2 = new THREE.Mesh(toeGeometry, toeMaterial);
        toe2.position.set(0, 0.2, 0.3);
        foot.add(toe2);
        const toe3 = new THREE.Mesh(toeGeometry, toeMaterial);
        toe3.position.set(0.25, 0.2, 0.2);
        foot.add(toe3);
        const pad = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), toeMaterial);
        pad.position.set(0, 0.2, -0.1);
        foot.add(pad);

        powerUpMesh = foot;
        powerUpMesh.rotation.x = Math.PI / 2;
        powerUpMesh.scale.set(0.8, 0.8, 0.8);
    }
    else if (powerUpType === 'vehicle_fuel') {
        const barrelBodyGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 16);
        const barrelBodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
        const barrelBody = new THREE.Mesh(barrelBodyGeometry, barrelBodyMaterial);

        const ringGeometry = new THREE.TorusGeometry(0.8, 0.1, 8, 16);
        const ringMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0.5, roughness: 0.5 });

        const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
        ring1.rotation.x = Math.PI / 2;
        ring1.position.y = 0.5;

        const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
        ring2.rotation.x = Math.PI / 2;
        ring2.position.y = -0.5;

        const flameGeometry = new THREE.ConeGeometry(0.3, 0.5, 8);
        const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xff4500, emissive: 0xff4500, emissiveIntensity: 0.8 });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 1.0;

        powerUpMesh = new THREE.Group();
        powerUpMesh.add(barrelBody);
        powerUpMesh.add(ring1);
        powerUpMesh.add(ring2);
        powerUpMesh.add(flame);
    }

    powerUpMesh.position.copy(spawnPosition);
    powerUpMesh.userData.isPowerUp = true;
    powerUpMesh.userData.type = powerUpType;

    globals.scene.add(powerUpMesh);

    gameState.powerUps.push({
      mesh: powerUpMesh,
      type: powerUpType,
      collected: false
    });
}

export function checkPowerUpCollisions() {
    const playerBoundingSphere = new THREE.Sphere(globals.camera.position, 1.5);

    gameState.powerUps.forEach((powerUp, index) => {
      if (powerUp.collected) return;

      const powerUpBoundingSphere = new THREE.Sphere();
      if (powerUp.mesh.isGroup) {
          const bbox = new THREE.Box3().setFromObject(powerUp.mesh);
          bbox.getBoundingSphere(powerUpBoundingSphere);
      } else {
          powerUp.mesh.geometry.computeBoundingSphere();
          powerUpBoundingSphere.copy(powerUp.mesh.geometry.boundingSphere).applyMatrix4(powerUp.mesh.matrixWorld);
      }

      if (playerBoundingSphere.intersectsSphere(powerUpBoundingSphere) ) {
        powerUp.collected = true;

        globals.scene.remove(powerUp.mesh);

        if (powerUp.type === 'health') {
          if (gameState.playerHealth < gameState.maxHealth) {
              gameState.playerHealth = Math.min(gameState.maxHealth, gameState.playerHealth + 15);
              showMessage("SALUTE +15", 1500);
          } else {
              gameState.score += 5;
              showMessage("SALUTE MASSIMA! +5 PUNTI", 1500);
          }
        } else if (powerUp.type === 'ammo') {
          const currentWeaponData = gameState.weapons[gameState.currentWeapon];
          if (currentWeaponData.ammo < currentWeaponData.maxAmmo) {
              currentWeaponData.ammo = Math.min(currentWeaponData.maxAmmo, currentWeaponData.ammo + 15);
              showMessage("MUNIZIONI +15", 1500);
          } else {
              gameState.score += 5;
              showMessage("MUNIZIONI MASSIME! +5 PUNTI", 1500);
          }
        } else if (powerUp.type === 'vehicle_fuel') {
          if (gameState.inVehicle) {
              gameState.vehicleFuel = Math.min(gameState.maxVehicleFuel, gameState.vehicleFuel + 70);
              showMessage("BENZINA +70%", 1500);
          } else {
              gameState.playerHealth = Math.max(0, gameState.playerHealth - 10);
              showHitEffect();
              createAtomicMushroom(globals.camera.position);
              showMessage("IL CARBURANTE È ESPLOSO!", 2000);
              if (gameState.playerHealth <= 0) {
                  gameOver();
              }
          }
        }
        else if (powerUp.type === 'damage_boost') {
          gameState.isDamageBoostActive = true;
          gameState.damageBoostTimer = gameState.damageBoostDuration;
          showMessage("DANNO AUMENTATO!", 2000);
        }
        else if (powerUp.type === 'speed_boost') {
          gameState.isSpeedBoostActive = true;
          gameState.speedBoostTimer = gameState.speedBoostDuration;
          showMessage("VELOCITÀ AUMENTATA!", 2000);
        }

        updateUI();
        updateVehicleDashboardUI();
      }
    });
    gameState.powerUps = gameState.powerUps.filter(p => !p.collected);
}

export function explodeFuelBarrel(position) {
    applyAOEDamage(position, gameState.vehicleWeapons.cannon.aoeRadius, 1000);
    createAtomicMushroom(position);
    showMessage("BARILE DI CARBURANTE ESPLOSO!", 1500);
}
