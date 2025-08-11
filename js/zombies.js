import * as THREE from 'three';
import gameState from './gameState.js';
import * as globals from './globals.js';
import { updateUI, updateZombieCounter } from './ui.js';
import { updateAllInteractableMeshes, showMessage } from './utils.js';
import { spawnPowerUp } from './powerups.js';
import { nextLevel } from './main.js';

export function createZombies(count, isLightningZombie = false, position = null, isRockSpawned = false, isKamikazeBunny = false, isWerewolfRabbit = false) {
    for (let i = 0; i < count; i++) {
        let zombie;
        let health;
        let originalSpeed;

        if (isWerewolfRabbit) {
            const bodyGeometry = new THREE.SphereGeometry(1.0, 16, 16);
            bodyGeometry.applyMatrix4(new THREE.Matrix4().makeScale(1.0, 0.8, 1.0));
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 1.0;

            const earGeometry = new THREE.BoxGeometry(0.25, 1.8, 0.15);
            const earMaterial = new THREE.MeshLambertMaterial({ color: 0x606060 });
            const ear1 = new THREE.Mesh(earGeometry, earMaterial);
            ear1.position.set(0.35, 1.8, 0);
            ear1.rotation.z = Math.PI / 8;
            const ear2 = new THREE.Mesh(earGeometry, earMaterial);
            ear2.position.set(-0.35, 1.8, 0);
            ear2.rotation.z = -Math.PI / 8;

            const eyeGeometry = new THREE.SphereGeometry(0.12, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(0.35, 1.0, 0.8);
            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(-0.35, 1.0, 0.8);

            zombie = new THREE.Group();
            zombie.add(body);
            zombie.add(ear1);
            zombie.add(ear2);
            zombie.add(eye1);
            zombie.add(eye2);

            zombie.userData.isWerewolfRabbit = true;
            originalSpeed = 3.5;
            health = 20;
            zombie.userData.slowDuration = 5;
            zombie.userData.poisonDuration = 10;
            zombie.userData.poisonDamage = 2;
            zombie.userData.visionDistortDuration = 5;
            zombie.userData.attackCooldown = 1.0;

        } else if (isKamikazeBunny) {
            const bodyGeometry = new THREE.SphereGeometry(0.8, 16, 16);
            bodyGeometry.applyMatrix4(new THREE.Matrix4().makeScale(1.0, 0.8, 1.0));
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.8;

            const earGeometry = new THREE.BoxGeometry(0.2, 1.5, 0.1);
            const earMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
            const ear1 = new THREE.Mesh(earGeometry, earMaterial);
            ear1.position.set(0.3, 1.5, 0);
            ear1.rotation.z = Math.PI / 8;
            const ear2 = new THREE.Mesh(earGeometry, earMaterial);
            ear2.position.set(-0.3, 1.5, 0);
            ear2.rotation.z = -Math.PI / 8;

            const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const eye1 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye1.position.set(0.3, 0.9, 0.7);
            const eye2 = new THREE.Mesh(eyeGeometry, eyeMaterial);
            eye2.position.set(-0.3, 0.9, 0.7);

            zombie = new THREE.Group();
            zombie.add(body);
            zombie.add(ear1);
            zombie.add(ear2);
            zombie.add(eye1);
            zombie.add(eye2);

            zombie.userData.isKamikazeBunny = true;
            originalSpeed = 4.0;
            health = 10;
            zombie.userData.explosionRadius = 5;
            zombie.userData.explosionDamage = 50;
            zombie.userData.attackCooldown = 0.5;

        } else {
            const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: isLightningZombie ? 0x000000 : 0x990000 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.75;

            const headGeometry = new THREE.SphereGeometry(0.5, 8, 8);
            const headMaterial = new THREE.MeshLambertMaterial({ color: isLightningZombie ? 0x000000 : 0x880000 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 1.5;

            const armGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
            const armMaterial = new THREE.MeshLambertMaterial({ color: isLightningZombie ? 0x000000 : 0xaa0000 });

            const leftArm = new THREE.Mesh(armGeometry, armMaterial);
            leftArm.position.set(0.6, 0.5, 0);

            const rightArm = new THREE.Mesh(armGeometry, armMaterial);
            rightArm.position.set(-0.6, 0.5, 0);

            const legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
            const legMaterial = new THREE.MeshLambertMaterial({ color: isLightningZombie ? 0x000000 : 0x770000 });

            const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
            leftLeg.position.set(0.25, -1.25, 0);

            const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
            rightLeg.position.set(-0.25, -1.25, 0);

            zombie = new THREE.Group();
            zombie.add(body);
            zombie.add(head);
            zombie.add(leftArm);
            zombie.add(rightArm);
            zombie.add(leftLeg);
            zombie.add(rightLeg);

            originalSpeed = 1.2;
            health = 2 + gameState.level;
        }

        if (position) {
            zombie.position.copy(position);
            zombie.position.x += (Math.random() - 0.5) * 2;
            zombie.position.z += (Math.random() - 0.5) * 2;
        } else {
            zombie.position.set(
                (Math.random() - 0.5) * 80,
                0,
                (Math.random() - 0.5) * 80
            );
        }

        if (isLightningZombie) {
            zombie.scale.set(5, 5, 5);
            zombie.userData.isLightningZombie = true;
            originalSpeed = 1.2 * 2.5;
            health = 500;

            const healthBarGeometry = new THREE.PlaneGeometry(1, 0.1);
            const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const healthBarMesh = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
            healthBarMesh.position.set(0, 2.5, 0);
            zombie.add(healthBarMesh);
            zombie.userData.healthBar = healthBarMesh;
        }

        if (isRockSpawned) {
            zombie.userData.isRockSpawned = true;
            const mouthGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000088 });
            const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
            mouth.position.set(0, 0.5, 0.5);
            zombie.children[1].add(mouth);
            zombie.userData.mouthMesh = mouth;
            zombie.userData.canShootElectricity = true;
            zombie.userData.electricityCooldown = 3 + Math.random() * 2;
            zombie.userData.electricityDamage = 15;
        }

        globals.scene.add(zombie);

        zombie.userData.isZombie = true;
        zombie.userData.zombieId = zombie.uuid;
        zombie.userData.chasingPlayer = false;
        zombie.userData.chaseTimer = 0;
        zombie.userData.originalSpeed = originalSpeed;
        zombie.userData.maxHealth = health;

        if (!isKamikazeBunny && !isWerewolfRabbit) {
            const armMovement = { left: 0, right: 0, direction: 1 };
            const legMovement = { left: 0, right: 0, direction: 1 };
            gameState.zombies.push({
                mesh: zombie,
                health: health,
                attackCooldown: 0,
                animation: { armMovement, legMovement }
            });
        } else {
            gameState.zombies.push({
                mesh: zombie,
                health: health,
                attackCooldown: 0.5,
                animation: null
            });
        }
    }
    updateAllInteractableMeshes();
    updateZombieCounter();
}

export function zombieHit(zombie, damage) {
    zombie.health -= damage;

    if (zombie.mesh.userData.isLightningZombie && zombie.mesh.userData.healthBar) {
        const healthRatio = Math.max(0, zombie.health / zombie.mesh.userData.maxHealth);
        zombie.mesh.userData.healthBar.scale.x = healthRatio;
        zombie.mesh.userData.healthBar.position.x = (healthRatio - 1) * (zombie.mesh.userData.healthBar.geometry.parameters.width / 2);
    }

    zombie.mesh.traverse(child => {
      if (child.isMesh) {
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }
        child.material.color.set(0xff0000);
      }
    });

    setTimeout(() => {
      zombie.mesh.traverse(child => {
        if (child.isMesh && child.userData.originalMaterial) {
          child.material.copy(child.userData.originalMaterial);
        }
      });
    }, 200);

    if (zombie.health <= 0) {
      gameState.score += (zombie.mesh.userData.isLightningZombie ? 500 : 10 * gameState.level);
      if (zombie.mesh.userData.isLightningZombie) {
          gameState.lightningZombieExists = false;
          if (zombie.mesh.userData.healthBar) {
              zombie.mesh.remove(zombie.mesh.userData.healthBar);
          }
      }
      gameState.zombiesDestroyed++;
      updateUI();

      const zombieMesh = zombie.mesh;
      const initialY = zombieMesh.position.y;
      const fallSpeed = 10;
      let currentFallTime = 0;

      function animateFall() {
          if (zombieMesh.position.y > initialY - 5) {
              zombieMesh.position.y -= fallSpeed * globals.clock.getDelta();
              currentFallTime += globals.clock.getDelta();
              requestAnimationFrame(animateFall);
          } else {
              globals.scene.remove(zombieMesh);
          }
      }
      animateFall();

      gameState.zombies = gameState.zombies.filter(z => z.mesh.uuid !== zombie.mesh.uuid);
      updateAllInteractableMeshes();

      if (gameState.zombiesDestroyed >= gameState.zombiesTotal) {
        nextLevel();
      }
    }
}

export function animateZombies(delta) {
    gameState.zombies.forEach(zombie => {
      if (zombie.animation) {
          const armSpeed = 5;
          zombie.animation.armMovement.left += delta * armSpeed;
          zombie.animation.armMovement.right += delta * armSpeed;

          zombie.mesh.children[2].rotation.x = Math.sin(zombie.animation.armMovement.left) * 0.5;
          zombie.mesh.children[3].rotation.x = Math.sin(zombie.animation.armMovement.right + Math.PI) * 0.5;

          const legSpeed = 5;
          zombie.animation.legMovement.left += delta * legSpeed;
          zombie.animation.legMovement.right += delta * legSpeed;

          zombie.mesh.children[4].rotation.x = Math.sin(zombie.animation.legMovement.left) * 0.3;
          zombie.mesh.children[5].rotation.x = Math.sin(zombie.animation.legMovement.right + Math.PI) * 0.3;
      } else if (zombie.mesh.userData.isKamikazeBunny) {
          zombie.mesh.position.y = 0.8 + Math.sin(globals.clock.elapsedTime * 8) * 0.2;
      } else if (zombie.mesh.userData.isWerewolfRabbit) {
          zombie.mesh.position.y = 1.0 + Math.sin(globals.clock.elapsedTime * 3) * 0.1;
      }
    });
}
