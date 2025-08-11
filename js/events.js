import gameState from './gameState.js';
import * as globals from './globals.js';
import * as constants from './constants.js';
import { toggleCraftingMenu, craftAmmo } from './crafting.js';
import { toggleVehicleHeadlights, shootVehicleMachineGun, shootVehicleCannon, exitVehicle, checkVehicleProximityAndEnter, switchVehicleWeapon } from './vehicle.js';
import { shoot, reload, switchWeapon, toggleNightVision } from './player.js';
import { toggleLighthouse, enterSpaceship } from './objectives.js';
import { onJoystickTouchStart, onJoystickTouchMove, onJoystickTouchEnd } from './touch.js';
import { resetGame } from './main.js';
import { createZombies } from './zombies.js';
import { updateUI, updateUIVisibility } from './ui.js';
import { showMessage } from './utils.js';

export function setupEventListeners() {
    async function startGameHandler(e) {
        e.preventDefault();
        constants.startScreen.style.display = 'none';

        if (!globals.isTouchDevice) {
            try {
                await globals.renderer.domElement.requestPointerLock();
            } catch (error) {
                console.warn("Blocco puntatore fallito su desktop, continuo senza.", error);
                showMessage("Blocco puntatore fallito. Usa il mouse per la visuale.", 3000);
            }
        } else {
             showMessage("Tocca l'area di gioco per muovere la visuale.", 3000);
        }

        createZombies(gameState.zombiesTotal);
        updateUI();
        gameState.powerUpSpawnTimer = gameState.powerUpSpawnInterval;
        gameState.lightningStrikeRandomTimer = Math.random() * (gameState.lightningStrikeRandomIntervalMax - gameState.lightningStrikeRandomIntervalMin) + gameState.lightningStrikeRandomIntervalMin;

        updateUIVisibility();
    }

    async function restartGameHandler(e) {
        e.preventDefault();
        constants.gameOverScreen.style.display = 'none';
        resetGame();

        if (!globals.isTouchDevice) {
            try {
                await globals.renderer.domElement.requestPointerLock();
            } catch (error) {
                console.warn("Blocco puntatore fallito su desktop al riavvio, continuo senza.", error);
                showMessage("Blocco puntatore fallito. Usa il mouse per la visuale.", 3000);
            }
        } else {
            showMessage("Tocca l'area di gioco per muovere la visuale.", 3000);
        }

        createZombies(gameState.zombiesTotal);
        updateUI();
        gameState.powerUpSpawnTimer = gameState.powerUpSpawnInterval;
        gameState.lightningStrikeRandomTimer = Math.random() * (gameState.lightningStrikeRandomIntervalMax - gameState.lightningStrikeRandomIntervalMin) + gameState.lightningStrikeRandomIntervalMin;

        updateUIVisibility();
    }

    constants.startButton.addEventListener('click', startGameHandler);
    constants.startButton.addEventListener('touchstart', startGameHandler, { passive: false });

    constants.restartButton.addEventListener('click', restartGameHandler);
    constants.restartButton.addEventListener('touchstart', restartGameHandler, { passive: false });

    globals.renderer.domElement.addEventListener('touchstart', (e) => {
        if (constants.startScreen.style.display === 'none' && !e.target.closest('.touch-button') && e.target !== constants.joystickContainer && e.target !== constants.joystickHandle) {
            e.preventDefault();
            globals.isLookingWithTouch = true;
            globals.lastTouchX_camera = e.touches[0].clientX;
            globals.lastTouchY_camera = e.touches[0].clientY;
        }
    }, { passive: false });

    globals.renderer.domElement.addEventListener('touchmove', (e) => {
        if (globals.isLookingWithTouch) {
            e.preventDefault();
            const touch = e.touches[0];
            const dx = touch.clientX - globals.lastTouchX_camera;
            const dy = touch.clientY - globals.lastTouchY_camera;

            globals.controls.getObject().rotation.y -= dx * constants.touchLookSensitivity;

            const currentPitch = globals.camera.rotation.x;
            const newPitch = currentPitch - dy * constants.touchLookSensitivity;
            const minPitch = -Math.PI / 2 + 0.1;
            const maxPitch = Math.PI / 2 - 0.1;
            globals.camera.rotation.x = Math.max(minPitch, Math.min(maxPitch, newPitch));

            globals.lastTouchX_camera = touch.clientX;
            globals.lastTouchY_camera = touch.clientY;
        }
    }, { passive: false });

    globals.renderer.domElement.addEventListener('touchend', () => {
        globals.isLookingWithTouch = false;
    });

    document.addEventListener('keydown', (e) => {
      if (gameState.gameOver) return;

      if (gameState.isCraftingMenuOpen) {
          if (e.code === 'KeyC' || e.code === 'Escape') {
              toggleCraftingMenu();
          }
          return;
      }

      if (gameState.inVehicle) {
          switch (e.code) {
              case 'KeyW': constants.movement.vehicleForward = true; break;
              case 'KeyS': constants.movement.vehicleBackward = true; break;
              case 'KeyA': constants.movement.vehicleTurnLeft = true; break;
              case 'KeyD': constants.movement.vehicleTurnRight = true; break;
              case 'KeyL': toggleVehicleHeadlights(); break;
              case 'KeyF': shootVehicleMachineGun(); break;
              case 'KeyG': shootVehicleCannon(); break;
              case 'KeyE': exitVehicle(); break;
          }
      } else {
          if (!globals.isTouchDevice && !globals.controls.isLocked) return;
          switch (e.code) {
              case 'KeyW': constants.movement.forward = true; break;
              case 'KeyA': constants.movement.left = true; break;
              case 'KeyS': constants.movement.backward = true; break;
              case 'KeyD': constants.movement.right = true; break;
              case 'Space':
                  if (constants.movement.canJump) {
                      constants.movement.velocity.y += constants.movement.jumpHeight;
                      constants.movement.canJump = false;
                  }
                  break;
              case 'ShiftLeft': constants.movement.sprint = true; break;
              case 'KeyR': reload(); break;
              case 'KeyN': toggleNightVision(); break;
              case 'KeyQ': switchWeapon(); break;
              case 'KeyE':
                  if (gameState.currentObjective === 'activate_lighthouse' && globals.camera.position.distanceTo(gameState.lighthouseMesh.position) < 15) {
                      toggleLighthouse();
                  } else if (globals.camera.position.distanceTo(globals.vehicleGroup.position) < 10) { // spaceshipGroup does not exist in globals
                      checkVehicleProximityAndEnter();
                  }
                  break;
              case 'KeyC': toggleCraftingMenu(); break;
          }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (gameState.gameOver || gameState.isCraftingMenuOpen) return;

      if (gameState.inVehicle) {
          switch (e.code) {
              case 'KeyW': constants.movement.vehicleForward = false; break;
              case 'KeyS': constants.movement.vehicleBackward = false; break;
              case 'KeyA': constants.movement.vehicleTurnLeft = false; break;
              case 'KeyD': constants.movement.vehicleTurnRight = false; break;
          }
      } else {
          if (!globals.isTouchDevice && !globals.controls.isLocked) return;
          switch (e.code) {
              case 'KeyW': constants.movement.forward = false; break;
              case 'KeyA': constants.movement.left = false; break;
              case 'KeyS': constants.movement.backward = false; break;
              case 'KeyD': constants.movement.right = false; break;
              case 'ShiftLeft': constants.movement.sprint = false; break;
          }
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (gameState.gameOver || gameState.isCraftingMenuOpen) return;
      if (gameState.inVehicle) return;
      if (e.button !== 0 || (!globals.isTouchDevice && !globals.controls.isLocked)) return;
      shoot();
    });

    constants.joystickContainer.addEventListener('touchstart', onJoystickTouchStart, { passive: false });
    constants.joystickContainer.addEventListener('touchmove', onJoystickTouchMove, { passive: false });
    constants.joystickContainer.addEventListener('touchend', onJoystickTouchEnd);
    constants.joystickContainer.addEventListener('touchcancel', onJoystickTouchEnd);

    constants.jumpButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!gameState.inVehicle && constants.movement.canJump) {
          constants.movement.velocity.y += constants.movement.jumpHeight;
          constants.movement.canJump = false;
      }
    }, { passive: false });
    constants.shootButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!gameState.inVehicle) shoot();
    }, { passive: false });
    constants.reloadButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!gameState.inVehicle) reload();
    }, { passive: false });
    constants.nightVisionButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      toggleNightVision();
    }, { passive: false });
    constants.switchWeaponButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!gameState.inVehicle) switchWeapon();
    }, { passive: false });
    constants.craftingButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        toggleCraftingMenu();
    }, { passive: false });

    constants.enterExitVehicleButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.inVehicle) {
            exitVehicle();
        } else {
            checkVehicleProximityAndEnter();
        }
    }, { passive: false });
    constants.headlightsButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.inVehicle) toggleVehicleHeadlights();
    }, { passive: false });
    constants.vehicleMachineGunButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.inVehicle) shootVehicleMachineGun();
    }, { passive: false });
    constants.vehicleCannonButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.inVehicle) shootVehicleCannon();
    }, { passive: false });

    constants.closeCraftingButton.addEventListener('click', toggleCraftingMenu);
    constants.craftRifleAmmoButton.addEventListener('click', () => craftAmmo('rifle'));
    constants.craftShotgunAmmoButton.addEventListener('click', () => craftAmmo('shotgun'));

    window.addEventListener('resize', () => {
      globals.camera.aspect = window.innerWidth / window.innerHeight;
      globals.camera.updateProjectionMatrix();
      globals.renderer.setSize(window.innerWidth, window.innerHeight);
      updateUIVisibility();
    });
}
