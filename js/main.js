import * as THREE from 'three';
import gameState from './gameState.js';
import * as globals from './globals.js';
import * as constants from './constants.js';
import { initScene } from './scene.js';
import { updateUI, updateUIVisibility, updateVehicleDashboardUI } from './ui.js';
import { updateTimeOfDay } from './time.js';
import { updateWeatherLogic, triggerRandomLightning, updateParticles, applyWeather } from './weather.js';
import { checkPowerUpCollisions } from './powerups.js';
import { updateObjective, clearObjective } from './objectives.js';
import { drawRadar } from './radar.js';
import { animateZombies, zombieHit } from './zombies.js';
import { showMessage, applyAOEDamage, updateAllInteractableMeshes } from './utils.js';
import { createZombies } from './zombies.js';
import { spawnPowerUp } from './powerups.js';
import { createDestructibleRock, rockHit } from './assets.js';
import { addClouds, triggerCloudStorm } from './weather.js';
import { exitVehicle } from './vehicle.js';
import { showHitEffect, createAtomicMushroom, applyGelatinousEffect } from './effects.js';
import { resetGame, gameOver, nextLevel } from './gameLogic.js';

function initGame() {
    globals.setIsTouchDevice(('ontouchstart' in window) ||
                      (navigator.maxTouchPoints > 0) ||
                      (navigator.msMaxTouchPoints > 0));
    initScene();
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (gameState.gameOver) return;

    const delta = globals.clock.getDelta();

    if (constants.startScreen.style.display === 'none' && !gameState.isCraftingMenuOpen) {
      globals.currentTime += constants.timeOfDaySpeed * delta;
      const currentHour = globals.currentTime % 24;
      updateTimeOfDay(currentHour);

      const currentDay = Math.floor(globals.currentTime / 24) + 1;
      if (currentDay !== gameState.gameDay) {
          gameState.gameDay = currentDay;
          updateWeatherLogic(gameState.gameDay);
      }

      if (gameState.weatherTimer > 0 && !gameState.isCloudStormActive) {
          gameState.weatherTimer -= delta;
          if (gameState.weatherTimer <= 0) {
              applyWeather('clear');
              showMessage("IL TEMPO E' MIGLIORATO!", 2000);
              clearObjective();
          }
      }

      if (gameState.currentWeather === 'thunderstorm' && !gameState.isCloudStormActive) {
          gameState.lightningFlickerTimer -= delta;
          if (gameState.lightningFlickerTimer <= 0) {
              if (!gameState.isLightningActive) {
                  globals.directionalLight.intensity = 2.0;
                  globals.scene.background.setRGB(0.8, 0.8, 0.9);
                  gameState.isLightningActive = true;
                  gameState.lightningFlickerTimer = gameState.lightningDuration;
              } else {
                  globals.directionalLight.intensity = 0.1;
                  updateTimeOfDay(currentHour);
                  globals.scene.fog.color.set(0x555555);
                  globals.scene.fog.density = 0.001;
                  gameState.isLightningActive = false;
                  gameState.lightningFlickerTimer = Math.random() * gameState.lightningInterval;
              }
          }
      } else if (!gameState.isCloudStormActive) {
          gameState.isLightningActive = false;
      }

      triggerRandomLightning(delta);

      if (gameState.isCloudStormActive) {
          gameState.cloudStormTimer -= delta;
          gameState.cloudStormLightningTimer -= delta;

          if (gameState.cloudStormTimer > gameState.triggeredRainDuration - gameState.atmosphericExplosionDuration) {
              if (gameState.cloudStormLightningTimer <= 0) {
                  globals.directionalLight.intensity = 3.0;
                  globals.ambientLight.intensity = 0.5;
                  globals.scene.background.set(0x444455);
                  setTimeout(() => {
                      globals.directionalLight.intensity = 0;
                      globals.ambientLight.intensity = 0.05;
                      globals.scene.background.set(0x000000);
                  }, 100);
                  gameState.cloudStormLightningTimer = 0.1 + Math.random() * 0.2;
              }
          } else {
              globals.directionalLight.intensity = 0;
              globals.ambientLight.intensity = 0.05;
          }

          gameState.zombies.forEach(zombie => {
              let zombieSpeed = zombie.mesh.userData.originalSpeed * 1.5;
              const lateralDrift = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(0.5);
              let targetPos = gameState.inVehicle ? globals.vehicleGroup.position : globals.camera.position;
              const zombieDirection = new THREE.Vector3().subVectors(targetPos, zombie.mesh.position).normalize();
              zombie.mesh.position.add(zombieDirection.multiplyScalar(zombieSpeed * delta));
              zombie.mesh.position.add(lateralDrift.multiplyScalar(zombieSpeed * delta * 0.2));
          });

          if (gameState.cloudStormTimer <= 0) {
              gameState.isCloudStormActive = false;
              applyWeather('clear');
              showMessage("LA TEMPESTA SI E' PLACATA!", 2000);
              clearObjective();
          }
      }

      if (globals.rainParticles.visible) updateParticles(globals.rainParticles, 50, delta);
      if (globals.snowParticles.visible) updateParticles(globals.snowParticles, 10, delta);
      if (globals.sandParticles.visible) updateParticles(globals.sandParticles, 20, delta);

      if (!gameState.inVehicle) {
          constants.movement.velocity.y -= constants.movement.gravity * delta;

          const currentSpeed = (constants.movement.sprint ? constants.movement.playerSpeed * 1.8 : constants.movement.playerSpeed) * (gameState.isDistorted ? 0.5 : 1.0) * (gameState.isSpeedBoostActive ? gameState.speedBoostMultiplier : 1.0);
          const moveDistance = currentSpeed * delta;

          if (constants.movement.forward) globals.controls.moveForward(moveDistance);
          if (constants.movement.backward) globals.controls.moveForward(-moveDistance);
          if (constants.movement.left) globals.controls.moveRight(-moveDistance);
          if (constants.movement.right) globals.controls.moveRight(moveDistance);

          globals.camera.position.y += constants.movement.velocity.y * delta;

          if (globals.camera.position.y < constants.movement.playerHeightOffset) {
            constants.movement.velocity.y = 0;
            globals.camera.position.y = constants.movement.playerHeightOffset;
            constants.movement.canJump = true;
          }

          const distanceToVehicle = globals.camera.position.distanceTo(globals.vehicleGroup.position);
          if (distanceToVehicle < 10 && !globals.vehicleGroup.userData.occupied) {
              constants.enterExitVehicleButton.style.display = 'flex';
              constants.interactionPrompt.textContent = "Premi E per salire sulla macchina";
              constants.interactionPrompt.style.display = 'block';
          } else {
              constants.enterExitVehicleButton.style.display = 'none';
              if (constants.interactionPrompt.textContent.includes("macchina")) {
                constants.interactionPrompt.style.display = 'none';
              }
          }

          if (gameState.currentObjective && gameState.currentObjective.type === 'activate_lighthouse' && gameState.lighthouseMesh) {
              const distanceToLighthouse = globals.camera.position.distanceTo(gameState.lighthouseMesh.position);
              if (distanceToLighthouse < 15) {
                  constants.interactionPrompt.textContent = "Premi E per attivare il Faro";
                  constants.interactionPrompt.style.display = 'block';
              } else if (distanceToVehicle >= 10 || globals.vehicleGroup.userData.occupied) {
                  if (!constants.interactionPrompt.textContent.includes("macchina")) {
                      constants.interactionPrompt.style.display = 'none';
                  }
              }
          }


      } else {
          const previousVehiclePosition = globals.vehicleGroup.position.clone();

          let currentVehicleSpeed = gameState.vehicleSpeed;
          if (gameState.vehicleFuel <= 0) {
              currentVehicleSpeed = 0;
          }

          const vehicleMoveDirection = new THREE.Vector3(0, 0, 0);
          if (constants.movement.vehicleForward) vehicleMoveDirection.z -= 1;
          if (constants.movement.vehicleBackward) vehicleMoveDirection.z += 1;

          vehicleMoveDirection.normalize();

          const targetSpeed = vehicleMoveDirection.z * currentVehicleSpeed;
          constants.movement.vehicleCurrentSpeed += (targetSpeed - constants.movement.vehicleCurrentSpeed) * 0.1;

          globals.vehicleGroup.translateZ(constants.movement.vehicleCurrentSpeed * delta);

          if (constants.movement.vehicleTurnLeft) globals.vehicleGroup.rotation.y += gameState.vehicleRotationSpeed;
          if (constants.movement.vehicleTurnRight) globals.vehicleGroup.rotation.y -= gameState.vehicleRotationSpeed;

          globals.vehicleGroup.position.y = 2.5;

          const vehicleMoveDelta = new THREE.Vector3().subVectors(globals.vehicleGroup.position, previousVehiclePosition).length();
          gameState.vehicleDistanceTraveled += vehicleMoveDelta;

          const fuelConsumed = vehicleMoveDelta * gameState.vehicleFuelConsumptionRate;
          gameState.vehicleFuel = Math.max(0, gameState.vehicleFuel - fuelConsumed);

          if (gameState.vehicleFuel <= 0 && !gameState.vehicleIsVulnerable && !gameState.gameOver) {
              gameState.vehicleIsVulnerable = true;
              gameState.vehicleVulnerabilityTimer = gameState.vehicleVulnerabilityDuration;
              applyGelatinousEffect(globals.vehicleGroup.children[0]);
              showMessage("BENZINA FINITA! LA MACCHINA È VULNERABILE!", 3000);
          }

          if (gameState.vehicleIsVulnerable) {
              gameState.vehicleVulnerabilityTimer -= delta;
              if (gameState.vehicleVulnerabilityTimer <= 0 && !gameState.gameOver) {
                  gameOver();
              }
          }

          updateVehicleDashboardUI();
      }

      for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
          const p = gameState.projectiles[i];
          p.position.add(p.userData.velocity.clone().multiplyScalar(delta));

          const projectileRaycaster = new THREE.Raycaster(p.position, p.userData.velocity.clone().normalize());
          const intersects = projectileRaycaster.intersectObjects(globals.allInteractableMeshes, true);

          if (intersects.length > 0 && intersects[0].distance < 0.5) {
              const hitObject = intersects[0].object;
              let parentObject = hitObject;
              while (parentObject && !parentObject.userData.isZombie && !parentObject.userData.isDestructibleRock && !parentObject.userData.isCloud && !parentObject.userData.isPowerUp && !parentObject.userData.isLighthouse && parentObject.parent) {
                  parentObject = parentObject.parent;
              }

              if (parentObject && parentObject.userData.isZombie) {
                  if (p.userData.isElectricityBall) {
                      globals.scene.remove(p);
                      gameState.projectiles.splice(i, 1);
                      continue;
                  }
                  const zombie = gameState.zombies.find(z => z.mesh.uuid === parentObject.userData.zombieId);
                  if (zombie) {
                      if (p.userData.isCannonBall) {
                          applyAOEDamage(p.position, gameState.vehicleWeapons.cannon.aoeRadius, p.userData.damage);
                          createAtomicMushroom(p.position);
                      } else {
                          zombieHit(zombie, p.userData.damage);
                      }
                  }
              } else if (parentObject && parentObject.userData.isDestructibleRock) {
                  if (p.userData.isElectricityBall) {
                      globals.scene.remove(p);
                      gameState.projectiles.splice(i, 1);
                      continue;
                  }
                  rockHit(parentObject, p.userData.damage);
              } else if (parentObject && parentObject.userData.isCloud) {
                  triggerCloudStorm(parentObject);
              } else if (parentObject && parentObject.userData.isPowerUp && parentObject.userData.type === 'vehicle_fuel') {
                  explodeFuelBarrel(parentObject.position);
                  globals.scene.remove(parentObject);
                  gameState.powerUps = gameState.powerUps.filter(p => p.mesh.uuid !== parentObject.uuid);
                  updateAllInteractableMeshes();
              }
              globals.scene.remove(p);
              gameState.projectiles.splice(i, 1);
          }

          if (p.userData.isElectricityBall) {
              const distanceToPlayer = p.position.distanceTo(globals.camera.position);
              if (distanceToPlayer < 1.5) {
                  gameState.playerHealth = Math.max(0, gameState.playerHealth - p.userData.damage);
                  updateUI();
                  showHitEffect();
                  showMessage("SCARICA ELETTRICA!", 500);

                  gameState.isDistorted = true;
                  gameState.distortionTimer = gameState.distortionDuration;
                  if (globals.distortionOverlay) {
                      globals.distortionOverlay.style.display = 'block';
                      globals.distortionOverlay.classList.add('active');
                  }

                  if (gameState.playerHealth <= 0) {
                      gameOver();
                  }
                  globals.scene.remove(p);
                  gameState.projectiles.splice(i, 1);
                  continue;
              }
          }

          if (p.position.distanceTo(globals.camera.position) > 100) {
              globals.scene.remove(p);
              gameState.projectiles.splice(i, 1);
          }
      }

      gameState.zombies.forEach(zombie => {
          if (!zombie || !zombie.mesh || !zombie.mesh.userData) {
              return;
          }

          let zombieSpeed = zombie.mesh.userData.originalSpeed;
          let targetPosition = gameState.inVehicle ? globals.vehicleGroup.position : globals.camera.position;

          if (gameState.vehicleIsVulnerable) {
              targetPosition = globals.vehicleGroup.position;
              zombieSpeed *= 1.5;
          } else if (gameState.lastShotPosition && !zombie.mesh.userData.chasingPlayer) {
            const distanceToShot = zombie.mesh.position.distanceTo(gameState.lastShotPosition);
            if (distanceToShot < gameState.shotNoiseRadius) {
              zombie.mesh.userData.chasingPlayer = true;
              zombie.mesh.userData.chaseTimer = gameState.zombieChaseDuration;
            }
          }

          if (zombie.mesh.userData.chasingPlayer) {
            zombieSpeed *= gameState.zombieChaseSpeedBoost;
            zombie.mesh.userData.chaseTimer -= delta;
            if (zombie.mesh.userData.chaseTimer <= 0) {
              zombie.mesh.userData.chasingPlayer = false;
            }
          }

          const zombieDirection = new THREE.Vector3().subVectors(targetPosition, zombie.mesh.position).normalize();
          zombie.mesh.position.add(zombieDirection.multiplyScalar(zombieSpeed * delta));

          zombie.mesh.lookAt(targetPosition);

          const distanceToTarget = zombie.mesh.position.distanceTo(targetPosition);

          if (zombie.mesh.userData.isKamikazeBunny) {
              const explodeRange = 3;
              if (distanceToTarget < explodeRange && zombie.attackCooldown <= 0) {
                  applyAOEDamage(zombie.mesh.position, zombie.mesh.userData.explosionRadius, zombie.mesh.userData.explosionDamage);
                  createAtomicMushroom(zombie.mesh.position);
                  showMessage("CONIGLIO KAMIKAZE ESPLOSO!", 1000);
                  zombieHit(zombie, zombie.health);
              }
              zombie.attackCooldown -= delta;
          } else if (zombie.mesh.userData.isWerewolfRabbit) {
              const attackRange = 2.5;
              if (distanceToTarget < attackRange && zombie.attackCooldown <= 0) {
                  gameState.isSpeedBoostActive = false;
                  constants.movement.playerSpeed = 2.0;
                  setTimeout(() => constants.movement.playerSpeed = 5.0, zombie.mesh.userData.slowDuration * 1000);

                  let poisonTimer = zombie.mesh.userData.poisonDuration;
                  const poisonInterval = setInterval(() => {
                      if (poisonTimer <= 0) clearInterval(poisonInterval);
                      gameState.playerHealth -= zombie.mesh.userData.poisonDamage;
                      updateUI();
                      showHitEffect();
                      poisonTimer -= 1;
                  }, 1000);

                  gameState.isDistorted = true;
                  gameState.distortionTimer = zombie.mesh.userData.visionDistortDuration;
                  if (globals.distortionOverlay) globals.distortionOverlay.classList.add('active');

                  zombie.attackCooldown = 1.0;
              }
              zombie.attackCooldown -= delta;
          } else {
              const attackRange = zombie.mesh.userData.isLightningZombie ? 5 : 2.5;
              const attackDamage = zombie.mesh.userData.isLightningZombie ? 30 : 10;

              if (distanceToTarget < attackRange && zombie.attackCooldown <= 0) {
                if (gameState.inVehicle && gameState.vehicleIsVulnerable) {
                    gameState.vehicleFuel = Math.max(0, gameState.vehicleFuel - attackDamage / 5);
                    updateVehicleDashboardUI();
                    showMessage("MACCHINA SOTTO ATTACCO!", 500);
                } else if (!gameState.inVehicle) {
                    gameState.playerHealth = Math.max(0, gameState.playerHealth - attackDamage);
                    updateUI();
                    showHitEffect();
                    showMessage("SEI STATO COLPITO!", 500);
                }
                zombie.attackCooldown = 1.5;

                if (gameState.playerHealth <= 0) {
                  gameOver();
                }
              }
              zombie.attackCooldown -= delta;

              if (zombie.mesh.userData.isRockSpawned && zombie.mesh.userData.canShootElectricity) {
                  zombie.mesh.userData.electricityCooldown -= delta;
                  if (zombie.mesh.userData.electricityCooldown <= 0) {
                      const mouthWorldPosition = new THREE.Vector3();
                      if (zombie.mesh.userData.mouthMesh) {
                          zombie.mesh.userData.mouthMesh.getWorldPosition(mouthWorldPosition);
                      } else {
                          const headMesh = zombie.mesh.children.find(child => child.geometry instanceof THREE.SphereGeometry && child.position.y > 1);
                          if (headMesh) headMesh.getWorldPosition(mouthWorldPosition);
                          else zombie.mesh.getWorldPosition(mouthWorldPosition);
                      }

                      const targetToShoot = gameState.inVehicle ? globals.vehicleGroup.position : globals.camera.position;
                      const electricityDirection = new THREE.Vector3().subVectors(targetToShoot, mouthWorldPosition).normalize();

                      const electricityGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                      const electricityMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.5 });
                      const electricityBall = new THREE.Mesh(electricityGeometry, electricityMaterial);

                      electricityBall.position.copy(mouthWorldPosition);
                      electricityBall.userData.velocity = electricityDirection.multiplyScalar(20);
                      electricityBall.userData.damage = zombie.mesh.userData.electricityDamage;
                      electricityBall.userData.isElectricityBall = true;

                      globals.scene.add(electricityBall);
                      gameState.projectiles.push(electricityBall);

                      zombie.mesh.userData.electricityCooldown = 3 + Math.random() * 2;
                  }
              }
          }
      });

      animateZombies(delta);

      checkPowerUpCollisions();

      gameState.powerUpSpawnTimer -= delta;
      if (gameState.powerUpSpawnTimer <= 0) {
          spawnPowerUp();
          gameState.powerUpSpawnTimer = gameState.powerUpSpawnInterval;
      }

      gameState.rockSpawnTimer -= delta;
      if (gameState.rockSpawnTimer <= 0 && gameState.destructibleRocks.length < gameState.maxDestructibleRocks) {
          createDestructibleRock();
          gameState.rockSpawnTimer = gameState.rockSpawnInterval;
      }

      if (gameState.isDamageBoostActive) {
          gameState.damageBoostTimer -= delta;
          if (gameState.damageBoostTimer <= 0) {
              gameState.isDamageBoostActive = false;
              showMessage("DANNO NORMALE", 1500);
          }
      }

      if (gameState.isSpeedBoostActive) {
          gameState.speedBoostTimer -= delta;
          if (gameState.speedBoostTimer <= 0) {
              gameState.isSpeedBoostActive = false;
              showMessage("VELOCITÀ NORMALE", 1500);
          }
      }

      if (gameState.isDistorted) {
          gameState.distortionTimer -= delta;
          if (gameState.distortionTimer <= 0) {
              gameState.isDistorted = false;
              if (globals.distortionOverlay) {
                  globals.distortionOverlay.classList.remove('active');
                  setTimeout(() => {
                      globals.distortionOverlay.style.display = 'none';
                  }, 200);
              }
              showMessage("PERCEZIONE NORMALE", 1000);
          }
      }

      if (!gameState.inVehicle) {
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(new THREE.Vector2(0, 0), globals.camera);
          const intersects = raycaster.intersectObjects(globals.allInteractableMeshes, true);

          if (intersects.length > 0) {
              constants.crosshair.classList.add('target-locked');
          } else {
              constants.crosshair.classList.remove('target-locked');
          }
      } else {
          constants.crosshair.style.display = 'block';
          if (gameState.currentVehicleWeapon === 'cannon') {
              constants.crosshair.style.borderColor = 'purple';
          } else {
              constants.crosshair.style.borderColor = 'rgba(255, 255, 255, 0.8)';
          }
      }

      updateObjective(delta);

      if (globals.cloudsGroup) {
          globals.cloudsGroup.rotation.y += 0.0002;
          globals.cloudsGroup.position.x += 0.05;
      }

      drawRadar();
    }

    globals.renderer.render(globals.scene, globals.camera);
}

initGame();
