import gameState from './gameState.js';
import * as globals from './globals.js';
import * as constants from './constants.js';
import { updateUI, updateVehicleDashboardUI, updateUIVisibility } from './ui.js';
import { applyWeather, addClouds } from './weather.js';
import { exitVehicle } from './vehicle.js';
import { createDestructibleRock } from './assets.js';
import { createZombies } from './zombies.js';
import { spawnPowerUp } from './powerups.js';
import { showMessage } from './utils.js';
import { updateTimeOfDay } from './time.js';

export function resetGame() {
    gameState.playerHealth = 100;
    gameState.score = 0;
    gameState.level = 1;
    gameState.zombiesDestroyed = 0;
    gameState.zombiesTotal = 5;

    gameState.zombies.forEach(z => {
        if (z.mesh && z.mesh.userData && z.mesh.userData.healthBar) {
            z.mesh.remove(z.mesh.userData.healthBar);
        }
        if (z.mesh) globals.scene.remove(z.mesh);
    });
    gameState.zombies = [];

    gameState.projectiles.forEach(p => globals.scene.remove(p));
    gameState.projectiles = [];

    gameState.powerUps.forEach(powerUp => {
      if (powerUp.mesh) {
        globals.scene.remove(powerUp.mesh);
      }
    });
    gameState.powerUps = [];

    gameState.destructibleRocks.forEach(r => {
        if (r) globals.scene.remove(r);
    });
    gameState.destructibleRocks = [];

    for (let i = 0; i < gameState.maxDestructibleRocks; i++) {
        createDestructibleRock();
    }

    if (globals.cloudsGroup) {
        globals.cloudsGroup.children.forEach(cloud => globals.scene.remove(cloud));
        globals.scene.remove(globals.cloudsGroup);
        globals.setCloudsGroup(null);
    }
    globals.setCloudsGroup(addClouds(15));

    gameState.isReloading = false;
    gameState.gameOver = false;
    gameState.nightVision = false;
    gameState.isShooting = false;
    gameState.lastShotPosition = null;
    gameState.isDamageBoostActive = false;
    gameState.damageBoostTimer = 0;
    gameState.isDistorted = false;
    gameState.distortionTimer = 0;
    if (globals.distortionOverlay) {
        globals.distortionOverlay.style.display = 'none';
        globals.distortionOverlay.classList.remove('active');
        globals.distortionOverlay.style.filter = 'none';
    }

    gameState.isCloudStormActive = false;
    gameState.cloudStormTimer = 0;
    gameState.cloudStormLightningTimer = 0;

    gameState.isSpeedBoostActive = false;
    gameState.speedBoostTimer = 0;
    gameState.resources = 0;
    gameState.isCraftingMenuOpen = false;
    constants.craftingMenu.style.display = 'none';

    gameState.gameDay = 1;
    gameState.lastWeatherChangeDay = 0;
    gameState.currentWeather = 'clear';
    gameState.weatherTimer = 0;
    gameState.lightningFlickerTimer = 0;
    gameState.isLightningActive = false;
    applyWeather('clear');

    gameState.lightningZombieExists = false;
    gameState.lightningStrikeRandomTimer = Math.random() * (gameState.lightningStrikeRandomIntervalMax - gameState.lightningStrikeRandomIntervalMin) + gameState.lightningStrikeRandomIntervalMin;

    gameState.weapons.rifle.ammo = gameState.weapons.rifle.clipSize;
    gameState.weapons.shotgun.ammo = gameState.weapons.shotgun.clipSize;
    gameState.currentWeapon = 'rifle';
    gameState.weapons.rifle.mesh.visible = true;
    gameState.weapons.shotgun.mesh.visible = false;

    if (gameState.inVehicle) {
        exitVehicle();
    }
    globals.vehicleGroup.position.set(-80, 2.5, 80);
    globals.vehicleGroup.rotation.y = Math.PI / 2;
    globals.vehicleLight.visible = false;
    globals.vehicleLight.intensity = 0;
    gameState.vehicleFuel = gameState.maxVehicleFuel;
    gameState.vehicleDistanceTraveled = 0;
    gameState.vehicleIsVulnerable = false;
    gameState.vehicleVulnerabilityTimer = 0;
    globals.vehicleGroup.children[0].material = gameState.vehicleOriginalMaterial.clone();

    gameState.vehicleWeapons.machineGun.ammo = gameState.vehicleWeapons.machineGun.maxAmmo;
    gameState.vehicleWeapons.cannon.ammo = gameState.vehicleWeapons.cannon.maxAmmo;
    gameState.currentVehicleWeapon = 'machineGun';

    globals.camera.position.set(0, constants.movement.playerHeightOffset, 0);
    constants.movement.velocity.set(0, 0, 0);

    updateUI();
    updateVehicleDashboardUI();

    globals.nightVisionOverlay.style.display = 'none';

    globals.setCurrentTime(12);
    updateTimeOfDay(globals.currentTime);

    constants.crosshair.style.display = 'none';
    document.getElementById('uiContainer').style.display = 'none';
    document.querySelector('.zombie-counter').style.display = 'none';
    constants.timeDisplayCard.style.display = 'none';
    constants.weaponDisplay.style.display = 'none';
    constants.vehicleDashboard.style.display = 'none';
    globals.radarCanvas.style.display = 'none';
    constants.resourceDisplay.style.display = 'none';
    constants.objectiveDisplay.style.display = 'none';
    constants.craftingMenu.style.display = 'none';

    constants.interactionPrompt.style.display = 'none';

    globals.nightVisionOverlay.style.display = 'none';
    if (globals.distortionOverlay) {
        globals.distortionOverlay.style.display = 'none';
        globals.distortionOverlay.classList.remove('active');
        globals.distortionOverlay.style.filter = 'none';
    }

    constants.enterExitVehicleButton.style.display = 'none';
    constants.headlightsButton.style.display = 'none';
    constants.vehicleMachineGunButton.style.display = 'none';
    constants.vehicleCannonButton.style.display = 'none';

    constants.jumpButton.style.display = 'none';
    constants.shootButton.style.display = 'none';
    constants.reloadButton.style.display = 'none';
    constants.nightVisionButton.style.display = 'none';
    constants.switchWeaponButton.style.display = 'none';
    constants.craftingButton.style.display = 'none';

    constants.movement.joystickActive = false;
    constants.joystickHandle.style.transform = 'translate(0, 0)';
    constants.movement.forward = constants.movement.backward = constants.movement.left = constants.movement.right = constants.movement.sprint = false;
    constants.joystickContainer.classList.remove('sprint-active');
    constants.movement.vehicleForward = constants.movement.vehicleBackward = constants.movement.vehicleTurnLeft = constants.movement.vehicleTurnRight = false;
}

export function gameOver() {
    gameState.gameOver = true;
    globals.controls.unlock();
    constants.gameOverScreen.style.display = 'flex';
    document.getElementById('finalScore').textContent = `Punto Finale: ${gameState.score}`;

    document.getElementById('uiContainer').style.display = 'none';
    document.querySelector('.zombie-counter').style.display = 'none';
    constants.crosshair.style.display = 'none';
    constants.timeDisplayCard.style.display = 'none';
    constants.weaponDisplay.style.display = 'none';
    constants.vehicleDashboard.style.display = 'none';
    globals.radarCanvas.style.display = 'none';
    constants.resourceDisplay.style.display = 'none';
    constants.objectiveDisplay.style.display = 'none';
    constants.craftingMenu.style.display = 'none';

    constants.interactionPrompt.style.display = 'none';

    globals.nightVisionOverlay.style.display = 'none';
    if (globals.distortionOverlay) {
        globals.distortionOverlay.style.display = 'none';
        globals.distortionOverlay.classList.remove('active');
        globals.distortionOverlay.style.filter = 'none';
    }

    constants.enterExitVehicleButton.style.display = 'none';
    constants.headlightsButton.style.display = 'none';
    constants.vehicleMachineGunButton.style.display = 'none';
    constants.vehicleCannonButton.style.display = 'none';

    constants.jumpButton.style.display = 'none';
    constants.shootButton.style.display = 'none';
    constants.reloadButton.style.display = 'none';
    constants.nightVisionButton.style.display = 'none';
    constants.switchWeaponButton.style.display = 'none';
    constants.craftingButton.style.display = 'none';

    constants.movement.joystickActive = false;
    constants.joystickHandle.style.transform = 'translate(0, 0)';
    constants.movement.forward = constants.movement.backward = constants.movement.left = constants.movement.right = constants.movement.sprint = false;
    constants.joystickContainer.classList.remove('sprint-active');
    constants.movement.vehicleForward = constants.movement.vehicleBackward = constants.movement.vehicleTurnLeft = constants.movement.vehicleTurnRight = false;
}

export function nextLevel() {
    gameState.level++;
    gameState.score += 100;
    gameState.zombiesTotal += 2;
    gameState.zombiesDestroyed = 0;

    gameState.weapons.rifle.ammo = gameState.weapons.rifle.clipSize;
    gameState.weapons.shotgun.ammo = gameState.weapons.shotgun.clipSize;

    gameState.playerHealth = gameState.maxHealth;

    showMessage(`LIVELLO ${gameState.level} INIZIO!`, 2500);
    updateUI();

    spawnPowerUp();

    setTimeout(() => {
      createZombies(gameState.zombiesTotal);
      createZombies(Math.floor(gameState.level / 2) + 1, false, null, false, true);
      if (gameState.level >= 3) createZombies(Math.floor(gameState.level / 3), false, null, false, false, true);
    }, 3000);
}
