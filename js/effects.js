import * as THREE from 'three';
import * as globals from './globals.js';
import gameState from './gameState.js';

export function createAtomicMushroom(position) {
    const mushroomDiv = document.createElement('div');
    mushroomDiv.className = 'atomic-mushroom';
    const vector = new THREE.Vector3(position.x, position.y, position.z);
    vector.project(globals.camera);

    mushroomDiv.style.left = `${(vector.x + 1) / 2 * 100}%`;
    mushroomDiv.style.top = `${(-vector.y + 1) / 2 * 100}%`;
    mushroomDiv.style.width = '10px';
    mushroomDiv.style.height = '10px';
    document.body.appendChild(mushroomDiv);

    for (let i = 0; i < 10; i++) {
        const arc = document.createElement('div');
        arc.className = 'electric-arc';
        const size = Math.random() * 50 + 20;
        arc.style.width = `${size}px`;
        arc.style.height = `${size}px`;
        arc.style.left = `${(vector.x + 1) / 2 * 100 + (Math.random() - 0.5) * 10}%`;
        arc.style.top = `${(-vector.y + 1) / 2 * 100 + (Math.random() - 0.5) * 10}%`;
        arc.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(arc);
        setTimeout(() => arc.remove(), 500);
    }

    setTimeout(() => mushroomDiv.remove(), 1000);
}

export function createElectricChain(startPos, endPos) {
    const chainGeometry = new THREE.BufferGeometry().setFromPoints([startPos, endPos]);
    const chainMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const chainLine = new THREE.Line(chainGeometry, chainMaterial);
    globals.scene.add(chainLine);
    setTimeout(() => globals.scene.remove(chainLine), 500);
}

export function applyGelatinousEffect(mesh) {
    const gelatinousMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    mesh.material = gelatinousMaterial;
}

export function removeGelatinousEffect(mesh) {
    mesh.material = gameState.vehicleOriginalMaterial.clone();
}
