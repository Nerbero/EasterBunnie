import * as globals from './globals.js';
import * as constants from './constants.js';

export function updateTimeOfDay(time) {
    const hour = Math.floor(time);
    const minute = Math.floor((time - hour) * 60);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    constants.timeDisplayTime.textContent = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;

    let r, g, b;
    if (time >= 6 && time < 18) {
        r = 0.3 + 0.7 * (1 - Math.abs(12 - time) / 6);
        g = 0.4 + 0.6 * (1 - Math.abs(12 - time) / 6);
        b = 0.5 + 0.5 * (1 - Math.abs(12 - time) / 6);
        constants.timeDisplayLabel.textContent = 'GIORNO SOLEGGIATO';
        globals.ambientLight.intensity = 0.8;
        globals.directionalLight.intensity = 1.2;
    } else {
        r = 0.05;
        g = 0.05;
        b = 0.1;
        constants.timeDisplayLabel.textContent = 'NOTTE';
        globals.ambientLight.intensity = 0.2;
        globals.directionalLight.intensity = 0.3;
    }
    globals.scene.background.setRGB(r, g, b);

    const angle = (time / 24) * Math.PI * 2 - Math.PI / 2;
    globals.directionalLight.position.set(
        Math.cos(angle) * 200,
        Math.sin(angle) * 200,
        0
    );

    if (time > 5 && time < 19) {
        globals.directionalLight.intensity = 0.8;
        globals.directionalLight.color.set(0xffffff);
    } else if (time >= 19 || time < 5) {
        globals.directionalLight.intensity = 0.2;
        globals.directionalLight.color.set(0x88aaff);
    } else {
        globals.directionalLight.intensity = 0.6;
        globals.directionalLight.color.set(0xffaa00);
    }
}
