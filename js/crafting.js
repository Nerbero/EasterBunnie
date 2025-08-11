import gameState from './gameState.js';
import * as globals from './globals.js';
import * as constants from './constants.js';
import { showMessage } from './utils.js';
import { updateUI, updateResourceDisplay, updateCraftingButtons } from './ui.js';

export function toggleCraftingMenu() {
    gameState.isCraftingMenuOpen = !gameState.isCraftingMenuOpen;
    constants.craftingMenu.style.display = gameState.isCraftingMenuOpen ? 'flex' : 'none';
    if (gameState.isCraftingMenuOpen) {
        globals.controls.unlock();
        updateCraftingButtons();
    } else {
        if (!globals.isTouchDevice) globals.controls.lock();
    }
}

export function craftAmmo(weaponType) {
    let cost;
    let ammoAmount;
    let weapon = gameState.weapons[weaponType];

    if (weaponType === 'rifle') {
        cost = 5;
        ammoAmount = 30;
    } else if (weaponType === 'shotgun') {
        cost = 8;
        ammoAmount = 8;
    }

    if (gameState.resources >= cost) {
        if (weapon.ammo < weapon.maxAmmo) {
            gameState.resources -= cost;
            weapon.ammo = Math.min(weapon.maxAmmo, weapon.ammo + ammoAmount);
            showMessage(`Craftato: ${ammoAmount} munizioni ${weapon.name}!`, 1500);
            updateUI();
            updateResourceDisplay();
        } else {
            showMessage(`Munizioni ${weapon.name} già al massimo!`, 1500);
        }
    } else {
        showMessage("Risorse insufficienti!", 1500);
    }
}
