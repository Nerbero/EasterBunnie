import gameState from './gameState.js';
import * as constants from './constants.js';
import { isTouchDevice, radarCanvas, vehicleLight } from './globals.js';

export function updateUI() {
  document.getElementById('health').querySelector('.value').textContent = gameState.playerHealth;
  const totalPlayerAmmo = gameState.weapons.rifle.ammo + gameState.weapons.shotgun.ammo;
  const maxTotalPlayerAmmo = gameState.weapons.rifle.maxAmmo + gameState.weapons.shotgun.maxAmmo;
  document.getElementById('ammo').querySelector('.value').textContent = `${totalPlayerAmmo}/${maxTotalPlayerAmmo}`;

  document.getElementById('score').querySelector('.value').textContent = gameState.score;
  document.querySelector('.stat:nth-child(2) .value').textContent = gameState.level;

  constants.healthBar.style.width = `${(gameState.playerHealth / gameState.maxHealth) * 100}%`;
  constants.ammoBar.style.width = `${(totalPlayerAmmo / maxTotalPlayerAmmo) * 100}%`;

  const currentWeaponData = gameState.weapons[gameState.currentWeapon];
  constants.weaponName.textContent = currentWeaponData.name;
  constants.weaponAmmo.textContent = `${currentWeaponData.ammo}/${currentWeaponData.clipSize}`;

  updateZombieCounter();
  updateResourceDisplay();
}

export function updateVehicleDashboardUI() {
    if (!gameState.inVehicle) return;

    const currentVehicleWeaponData = gameState.vehicleWeapons[gameState.currentVehicleWeapon];

    constants.dashSpeed.textContent = `${(constants.movement.vehicleCurrentSpeed * gameState.vehicleKmPerUnit * 3600).toFixed(0)} km/h`;
    constants.dashDistance.textContent = `${(gameState.vehicleDistanceTraveled * gameState.vehicleKmPerUnit).toFixed(2)} km`;
    constants.dashFuel.textContent = `${gameState.vehicleFuel.toFixed(0)}%`;
    constants.dashFuelBar.style.width = `${(gameState.vehicleFuel / gameState.maxVehicleFuel) * 100}%`;
    constants.dashHeadlightsStatus.textContent = vehicleLight && vehicleLight.visible ? 'ACCESI' : 'SPENTI';
    constants.dashWeaponName.textContent = currentVehicleWeaponData.name;
    constants.dashWeaponAmmo.textContent = `${currentVehicleWeaponData.ammo}/${currentVehicleWeaponData.maxAmmo}`;
}

export function updateZombieCounter() {
  constants.zombieCount.textContent = gameState.zombiesTotal - gameState.zombiesDestroyed;
}

export function updateUIVisibility() {
    constants.touchControls.style.display = 'block';
    constants.touchControls.style.opacity = '0.4';
    document.querySelector('.instructions').style.display = 'none'; /* Hidden */

    document.getElementById('uiContainer').style.display = gameState.inVehicle ? 'none' : 'flex';
    constants.weaponDisplay.style.display = gameState.inVehicle ? 'none' : 'block';
    constants.jumpButton.style.display = gameState.inVehicle ? 'none' : 'flex';
    constants.shootButton.style.display = gameState.inVehicle ? 'none' : 'flex';
    constants.reloadButton.style.display = gameState.inVehicle ? 'none' : 'flex';
    constants.switchWeaponButton.style.display = gameState.inVehicle ? 'none' : 'flex';
    constants.craftingButton.style.display = gameState.inVehicle ? 'none' : 'flex';

    constants.vehicleDashboard.style.display = gameState.inVehicle ? 'flex' : 'none';
    constants.headlightsButton.style.display = gameState.inVehicle ? 'flex' : 'none';
    constants.vehicleMachineGunButton.style.display = gameState.inVehicle ? 'flex' : 'none';
    constants.vehicleCannonButton.style.display = gameState.inVehicle ? 'flex' : 'none';
    constants.vehicleInstructions.style.display = gameState.inVehicle ? 'block' : 'none';

    constants.crosshair.style.display = 'block'; // Sempre visibile, anche in vehicle per mirino
    document.querySelector('.zombie-counter').style.display = 'block';
    constants.timeDisplayCard.style.display = 'block';
    constants.watermark.style.display = 'block'; /* Re-enabled watermark */
    radarCanvas.style.display = 'block';
    constants.resourceDisplay.style.display = 'block';

    constants.interactionPrompt.style.display = 'none';
    constants.objectiveDisplay.style.display = gameState.currentObjective ? 'block' : 'none';

    constants.enterExitVehicleButton.style.display = 'flex'; // Always show for touch devices
    if (!isTouchDevice) { // Only hide if not touch device
        constants.enterExitVehicleButton.style.display = 'none';
    }
}

export function updateResourceDisplay() {
    constants.resourceCountSpan.textContent = gameState.resources;
    updateCraftingButtons();
}

export function updateCraftingButtons() {
    constants.craftRifleAmmoButton.disabled = gameState.resources < 5;
    constants.craftShotgunAmmoButton.disabled = gameState.resources < 8;
}
