export const timeOfDaySpeed = 24 / (120 * 60);
export const touchLookSensitivity = 0.005;
export const radarSize = 200;
export const radarRange = 100;

export const crosshair = document.getElementById('crosshair');
export const startScreen = document.getElementById('startScreen');
export const gameOverScreen = document.getElementById('gameOverScreen');
export const startButton = document.getElementById('startButton');
export const restartButton = document.getElementById('restartButton');
export const message = document.getElementById('message');
export const hitEffect = document.getElementById('hitEffect');
export const nightVisionOverlay = document.getElementById('nightVisionOverlay');
export const distortionOverlay = document.getElementById('distortionOverlay');
export const zombieCount = document.getElementById('zombieCount');
export const healthBar = document.getElementById('healthBar');
export const ammoBar = document.getElementById('ammoBar');
export const weaponDisplay = document.getElementById('weaponDisplay');
export const weaponName = document.getElementById('weaponName');
export const weaponAmmo = document.getElementById('weaponAmmo');
export const watermark = document.getElementById('watermark');
export const vehicleDashboard = document.getElementById('vehicleDashboard');
export const dashSpeed = document.getElementById('dashSpeed');
export const dashDistance = document.getElementById('dashDistance');
export const dashFuel = document.getElementById('dashFuel');
export const dashFuelBar = document.getElementById('dashFuelBar');
export const dashHeadlightsStatus = document.getElementById('dashHeadlightsStatus');
export const vehicleWeaponPanel = document.getElementById('vehicleWeaponPanel');
export const dashWeaponName = document.getElementById('dashWeaponName');
export const dashWeaponAmmo = document.getElementById('dashWeaponAmmo');
export const vehicleInstructions = document.getElementById('vehicleInstructions');
export const interactionPrompt = document.getElementById('interactionPrompt');
export const objectiveDisplay = document.getElementById('objectiveDisplay');
export const craftingMenu = document.getElementById('craftingMenu');
export const closeCraftingButton = document.getElementById('closeCrafting');
export const craftRifleAmmoButton = document.getElementById('craftRifleAmmo');
export const craftShotgunAmmoButton = document.getElementById('craftShotgunAmmo');
export const resourceDisplay = document.getElementById('resourceDisplay');
export const resourceCountSpan = document.getElementById('resourceCount');

export const touchControls = document.getElementById('touchControls');
export const joystickContainer = document.getElementById('joystickContainer');
export const joystickHandle = document.getElementById('joystickHandle');
export const jumpButton = document.getElementById('jumpButton');
export const shootButton = document.getElementById('shootButton');
export const reloadButton = document.getElementById('reloadButton');
export const nightVisionButton = document.getElementById('nightVisionButton');
export const switchWeaponButton = document.getElementById('switchWeaponButton');
export const enterExitVehicleButton = document.getElementById('enterExitVehicleButton');
export const headlightsButton = document.getElementById('headlightsButton');
export const vehicleMachineGunButton = document.getElementById('vehicleMachineGunButton');
export const vehicleCannonButton = document.getElementById('vehicleCannonButton');
export const craftingButton = document.getElementById('craftingButton');

export const timeDisplayCard = document.getElementById('time-display');
export const timeDisplayTime = timeDisplayCard.querySelector('.time');
export const timeDisplayLabel = timeDisplayCard.querySelector('.time-label');

export const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
  canJump: true,
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  playerSpeed: 5.0,
  jumpHeight: 8.0,
  gravity: 9.8 * 10,
  playerHeightOffset: 1.6,
  joystickActive: false,
  joystickStart: { x: 0, y: 0 },
  joystickCurrent: { x: 0, y: 0 },
  joystickRadius: 93.75,
  joystickSprintThresholdRatio: 0.7,

  vehicleForward: false,
  vehicleBackward: false,
  vehicleTurnLeft: false,
  vehicleTurnRight: false,
  vehicleCurrentSpeed: 0,
};
