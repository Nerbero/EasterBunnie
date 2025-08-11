import { message, hitEffect } from './constants.js';
import * as globals from './globals.js';
import gameState from './gameState.js';
import { updateUI, updateVehicleDashboardUI } from './ui.js';
import { showHitEffect as showHitEffectFromEffects, applyGelatinousEffect } from './effects.js';
import { gameOver } from './gameLogic.js';
import { zombieHit } from './zombies.js';

export function showMessage(text, duration = 2000) {
  message.textContent = text;
  message.style.display = 'block';
  setTimeout(() => {
    message.style.display = 'none';
  }, duration);
}

export function showHitEffect() {
  hitEffect.classList.remove('hit-animation');
  void hitEffect.offsetWidth;
  hitEffect.classList.add('hit-animation');

  const blood = document.createElement('div');
  blood.className = 'blood-splatter blood-animation';
  blood.style.left = `${Math.random() * 100}%`;
  blood.style.top = `${Math.random() * 100}%`;
  document.body.appendChild(blood);

  setTimeout(() => {
    blood.remove();
  }, 500);
}

export function applyAOEDamage(center, radius, damage) {
    if (!gameState.inVehicle) {
        if (globals.camera.position.distanceTo(center) < radius) {
            gameState.playerHealth = Math.max(0, gameState.playerHealth - damage);
            updateUI();
            showHitEffectFromEffects();
            if (gameState.playerHealth <= 0) {
                gameOver();
            }
        }
    } else {
        if (globals.vehicleGroup.position.distanceTo(center) < radius) {
            gameState.vehicleFuel = Math.max(0, gameState.vehicleFuel - damage / 5);
            updateVehicleDashboardUI();
            showMessage("MACCHINA COLPITA DALL'ESPLOSIONE!", 500);
            if (gameState.vehicleFuel <= 0 && !gameState.vehicleIsVulnerable) {
                gameState.vehicleIsVulnerable = true;
                gameState.vehicleVulnerabilityTimer= gameState.vehicleVulnerabilityDuration;
                applyGelatinousEffect(globals.vehicleGroup.children[0]);
                showMessage("BENZINA FINITA! LA MACCHINA È VULNERABILE!", 3000);
            }
        }
    }

    gameState.zombies.forEach(zombie => {
        if (zombie.mesh.position.distanceTo(center) < radius) {
            zombieHit(zombie, damage);
        }
    });
}

export function updateAllInteractableMeshes() {
    globals.allInteractableMeshes = [];
    gameState.zombies.forEach(z => z.mesh.traverse(child => {
        if (child.isMesh) globals.allInteractableMeshes.push(child);
    }));
    gameState.destructibleRocks.forEach(r => r.traverse(child => {
        if (child.isMesh) globals.allInteractableMeshes.push(child);
    }));
    if (globals.cloudsGroup) {
        globals.cloudsGroup.children.forEach(cloud => {
            if (cloud.isMesh) globals.allInteractableMeshes.push(cloud);
        });
    }
    if (globals.vehicleGroup && !globals.vehicleGroup.userData.occupied && !gameState.vehicleIsVulnerable) {
        globals.vehicleGroup.traverse(child => {
            if (child.isMesh) globals.allInteractableMeshes.push(child);
        });
    }
    if (gameState.lighthouseMesh) {
        gameState.lighthouseMesh.traverse(child => {
            if (child.isMesh) globals.allInteractableMeshes.push(child);
        });
    }
    gameState.powerUps.forEach(p => {
      if (p.mesh) {
          if (p.mesh.isGroup) {
              p.mesh.children.forEach(child => globals.allInteractableMeshes.push(child));
          } else {
              globals.allInteractableMeshes.push(p.mesh);
          }
      }
    });
}
