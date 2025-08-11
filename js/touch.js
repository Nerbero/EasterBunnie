import * as globals from './globals.js';
import * as constants from './constants.js';
import gameState from './gameState.js';

export function onJoystickTouchStart(event) {
    event.preventDefault();
    constants.movement.joystickActive = true;
    const touch = event.touches[0];
    const rect = constants.joystickContainer.getBoundingClientRect();
    constants.movement.joystickStart.x = rect.left + rect.width / 2;
    constants.movement.joystickStart.y = rect.top + rect.height / 2;

    constants.joystickHandle.style.transform = `translate(${touch.clientX - constants.movement.joystickStart.x}px, ${touch.clientY - constants.movement.joystickStart.y}px)`;
}

export function onJoystickTouchMove(event) {
    event.preventDefault();
    if (!constants.movement.joystickActive) return;

    const touch = event.touches[0];
    let dx = touch.clientX - constants.movement.joystickStart.x;
    let dy = touch.clientY - constants.movement.joystickStart.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    const sprintThreshold = constants.movement.joystickRadius * constants.movement.joystickSprintThresholdRatio;
    if (distance > sprintThreshold) {
        constants.movement.sprint = true;
        constants.joystickContainer.classList.add('sprint-active');
    } else {
        constants.movement.sprint = false;
        constants.joystickContainer.classList.remove('sprint-active');
    }

    if (distance > constants.movement.joystickRadius) {
        dx *= constants.movement.joystickRadius / distance;
        dy *= constants.movement.joystickRadius / distance;
    }

    constants.joystickHandle.style.transform = `translate(${dx}px, ${dy}px)`;

    if (gameState.inVehicle) {
        constants.movement.vehicleForward = dy < -constants.movement.joystickRadius * 0.2;
        constants.movement.vehicleBackward = dy > constants.movement.joystickRadius * 0.2;
        constants.movement.vehicleTurnLeft = dx < -constants.movement.joystickRadius * 0.2;
        constants.movement.vehicleTurnRight = dx > constants.movement.joystickRadius * 0.2;
    } else {
        constants.movement.forward = dy < -constants.movement.joystickRadius * 0.2;
        constants.movement.backward = dy > constants.movement.joystickRadius * 0.2;
        constants.movement.left = dx < -constants.movement.joystickRadius * 0.2;
        constants.movement.right = dx > constants.movement.joystickRadius * 0.2;
    }
}

export function onJoystickTouchEnd(event) {
    if (!constants.movement.joystickActive) return;

    constants.movement.joystickActive = false;
    constants.joystickHandle.style.transform = 'translate(0, 0)';
    constants.movement.forward = false;
    constants.movement.backward = false;
    constants.movement.left = false;
    constants.movement.right = false;
    constants.movement.sprint = false;
    constants.joystickContainer.classList.remove('sprint-active');
    constants.movement.vehicleForward = false;
    constants.movement.vehicleBackward = false;
    constants.movement.vehicleTurnLeft = false;
    constants.movement.vehicleTurnRight = false;
}
