import * as THREE from 'three';
import * as globals from './globals.js';
import gameState from './gameState.js';
import { radarSize, radarRange } from './constants.js';

export function drawRadar() {
    if (!globals.radarCanvas || !globals.radarCtx) return;

    globals.radarCtx.clearRect(0, 0, radarSize, radarSize);
    globals.radarCtx.fillStyle = 'rgba(0, 50, 0, 0.7)';
    globals.radarCtx.beginPath();
    globals.radarCtx.arc(radarSize / 2, radarSize / 2, radarSize / 2, 0, Math.PI * 2);
    globals.radarCtx.fill();
    globals.radarCtx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    globals.radarCtx.lineWidth = 2;
    globals.radarCtx.stroke();

    const centerX = radarSize / 2;
    const centerY = radarSize / 2;
    const scale = radarSize / (radarRange * 2);

    const playerWorldPosition = new THREE.Vector3();
    if (gameState.inVehicle) {
        globals.vehicleGroup.getWorldPosition(playerWorldPosition);
    } else {
        globals.controls.getObject().getWorldPosition(playerWorldPosition);
    }

    const playerRotationY = gameState.inVehicle ? globals.vehicleGroup.rotation.y : globals.controls.getObject().rotation.y;

    globals.radarCtx.fillStyle = 'cyan';
    globals.radarCtx.beginPath();
    globals.radarCtx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    globals.radarCtx.fill();

    if (globals.vehicleGroup && !globals.vehicleGroup.userData.occupied) {
        const dx = globals.vehicleGroup.position.x - playerWorldPosition.x;
        const dz = globals.vehicleGroup.position.z - playerWorldPosition.z;

        const rotatedX = dx * Math.cos(-playerRotationY) - dz * Math.sin(-playerRotationY);
        const rotatedZ = dx * Math.sin(-playerRotationY) + dz * Math.cos(-playerRotationY);

        const radarX = centerX + rotatedX * scale;
        const radarY = centerY + rotatedZ * scale;

        if (radarX >= 0 && radarX <= radarSize && radarY >= 0 && radarY <= radarSize) {
            globals.radarCtx.fillStyle = 'gold';
            globals.radarCtx.fillRect(radarX - 4, radarY - 4, 8, 8);
        }
    }

    gameState.zombies.forEach(zombie => {
        const dx = zombie.mesh.position.x - playerWorldPosition.x;
        const dz = zombie.mesh.position.z - playerWorldPosition.z;

        const rotatedX = dx * Math.cos(-playerRotationY) - dz * Math.sin(-playerRotationY);
        const rotatedZ = dx * Math.sin(-playerRotationY) + dz * Math.cos(-playerRotationY);

        const radarX = centerX + rotatedX * scale;
        const radarY = centerY + rotatedZ * scale;

        if (radarX >= 0 && radarX <= radarSize && radarY >= 0 && radarY <= radarSize) {
            globals.radarCtx.fillStyle = zombie.mesh.userData.isKamikazeBunny ? 'orange' : 'red';
            globals.radarCtx.beginPath();
            globals.radarCtx.arc(radarX, radarY, 2, 0, Math.PI * 2);
            globals.radarCtx.fill();
        }
    });
}
