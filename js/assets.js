import * as THREE from 'three';
import * as globals from './globals.js';
import gameState from './gameState.js';

export function createWeapons() {
    const rifleBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.8),
      new THREE.MeshBasicMaterial({ color: 0x555555 })
    );
    const rifleHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.3, 0.15),
      new THREE.MeshBasicMaterial({ color: 0x444444 })
    );
    rifleHandle.position.set(0, -0.15, 0.2);

    const rifleBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    rifleBarrel.position.set(0, 0, -0.5);

    const rifleGroup = new THREE.Group();
    rifleGroup.add(rifleBody);
    rifleGroup.add(rifleHandle);
    rifleGroup.add(rifleBarrel);
    rifleGroup.position.set(0.6, -0.4, -0.8);
    rifleGroup.rotation.y = -Math.PI / 16;
    globals.camera.add(rifleGroup);
    gameState.weapons.rifle.mesh = rifleGroup;

    const shotgunBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 1.0),
      new THREE.MeshBasicMaterial({ color: 0x664422 })
    );
    const shotgunHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.4, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x553311 })
    );
    shotgunHandle.position.set(0, -0.2, 0.3);

    const shotgunBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    shotgunBarrel.position.set(0, 0, -0.6);

    const shotgunPump = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8),
      new THREE.MeshBasicMaterial({ color: 0x444444 })
    );
    shotgunPump.position.set(0, -0.05, -0.3);

    const shotgunGroup = new THREE.Group();
    shotgunGroup.add(shotgunBody);
    shotgunGroup.add(shotgunHandle);
    shotgunGroup.add(shotgunBarrel);
    shotgunGroup.add(shotgunPump);
    shotgunGroup.position.set(0.6, -0.4, -0.8);
    shotgunGroup.rotation.y = -Math.PI / 16;
    globals.camera.add(shotgunGroup);
    gameState.weapons.shotgun.mesh = shotgunGroup;
    shotgunGroup.visible = false;
}

export function createVehicle() {
    const vehicleGroup = new THREE.Group();
    globals.setVehicleGroup(vehicleGroup);

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.0,
        roughness: 0.8,
    });

    const mainBody = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.7, 1.5),
        bodyMaterial
    );
    mainBody.position.set(0, 0.35, 0);
    vehicleGroup.add(mainBody);

    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16);

    const wheelY = 0.2;
    const frontWheelX = 1.2;
    const rearWheelX = -1.2;
    const wheelZOffset = 0.8;

    vehicleGroup.userData.wheels = [];

    const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontLeftWheel.position.set(frontWheelX, wheelY, wheelZOffset);
    frontLeftWheel.rotation.x = Math.PI / 2;
    vehicleGroup.add(frontLeftWheel);
    vehicleGroup.userData.wheels.push(frontLeftWheel);

    const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontRightWheel.position.set(frontWheelX, wheelY, -wheelZOffset);
    frontRightWheel.rotation.x = Math.PI / 2;
    vehicleGroup.add(frontRightWheel);
    vehicleGroup.userData.wheels.push(frontRightWheel);

    const rearLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearLeftWheel.position.set(rearWheelX, wheelY, wheelZOffset);
    rearLeftWheel.rotation.x = Math.PI / 2;
    vehicleGroup.add(rearLeftWheel);
    vehicleGroup.userData.wheels.push(rearLeftWheel);

    const rearRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    rearRightWheel.position.set(rearWheelX, wheelY, -wheelZOffset);
    rearRightWheel.rotation.x = Math.PI / 2;
    vehicleGroup.add(rearRightWheel);
    vehicleGroup.userData.wheels.push(rearRightWheel);

    const fluxCapacitor = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.6, 0.2),
        new THREE.MeshBasicMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 1.0 })
    );
    fluxCapacitor.position.set(-1.7, 1.0, 0);
    vehicleGroup.add(fluxCapacitor);

    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 0.5 });
    const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);

    const headlight1Mesh = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight1Mesh.position.set(1.7, 0.7, 0.6);
    vehicleGroup.add(headlight1Mesh);

    const headlight2Mesh = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight2Mesh.position.set(1.7, 0.7, -0.6);
    vehicleGroup.add(headlight2Mesh);

    const vehicleLight = new THREE.SpotLight(0xffffff, 0, 100, Math.PI / 8, 0.5, 2);
    globals.setVehicleLight(vehicleLight);
    vehicleLight.position.set(1.7, 0.7, 0);
    vehicleLight.target.position.set(1.7 + 10, 0.7, 0);
    vehicleGroup.add(vehicleLight);
    vehicleGroup.add(vehicleLight.target);
    vehicleLight.visible = false;

    const muzzleFlashLight = new THREE.PointLight(0xffff00, 0, 5, 2);
    muzzleFlashLight.position.set(1.7, 0.7, 0);
    vehicleGroup.add(muzzleFlashLight);
    gameState.vehicleWeapons.machineGun.muzzleFlashLight = muzzleFlashLight;

    const muzzleFlashGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const muzzleFlashMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500, transparent: true, opacity: 0 });
    const muzzleFlashMesh = new THREE.Mesh(muzzleFlashGeometry, muzzleFlashMaterial);
    muzzleFlashMesh.position.set(1.7, 0.7, 0);
    vehicleGroup.add(muzzleFlashMesh);
    gameState.vehicleWeapons.machineGun.muzzleFlashMesh = muzzleFlashMesh;

    const cockpitGroup = new THREE.Group();
    cockpitGroup.position.set(0.5, 0.5, 0);
    vehicleGroup.add(cockpitGroup);
    vehicleGroup.userData.cockpitGroup = cockpitGroup;

    const steeringWheelRadius = 0.3;
    const steeringWheelTube = 0.03;
    const steeringWheelGeometry = new THREE.TorusGeometry(steeringWheelRadius, steeringWheelTube, 8, 32);
    const steeringWheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
    const steeringWheel = new THREE.Mesh(steeringWheelGeometry, steeringWheelMaterial);
    steeringWheel.position.set(0.5, 0.1, 0);
    steeringWheel.rotation.y = Math.PI / 2;
    steeringWheel.rotation.z = Math.PI / 2;
    cockpitGroup.add(steeringWheel);
    steeringWheel.visible = false;

    const steeringColumn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    steeringColumn.position.set(0.5, -0.1, 0);
    steeringColumn.rotation.x = Math.PI / 2;
    cockpitGroup.add(steeringColumn);
    steeringColumn.visible = false;

    const handGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.2);
    const handMaterial = new THREE.MeshStandardMaterial({ color: 0xaa8866 });
    const leftHand = new THREE.Mesh(handGeometry, handMaterial);
    leftHand.position.set(0.5 + steeringWheelRadius * Math.cos(Math.PI * 0.75), 0.1 + steeringWheelRadius * Math.sin(Math.PI * 0.75), 0);
    leftHand.rotation.z = Math.PI / 4;
    cockpitGroup.add(leftHand);
    leftHand.visible = false;

    const rightHand = new THREE.Mesh(handGeometry, handMaterial);
    rightHand.position.set(0.5 + steeringWheelRadius * Math.cos(Math.PI * 0.25), 0.1 + steeringWheelRadius * Math.sin(Math.PI * 0.25), 0);
    rightHand.rotation.z = -Math.PI / 4;
    cockpitGroup.add(rightHand);
    rightHand.visible = false;

    vehicleGroup.userData.steeringWheel = steeringWheel;
    vehicleGroup.userData.steeringColumn = steeringColumn;
    vehicleGroup.userData.leftHand = leftHand;
    vehicleGroup.userData.rightHand = rightHand;

    vehicleGroup.scale.set(5, 5, 5);
    vehicleGroup.position.set(-80, 2.5, 80);
    vehicleGroup.rotation.y = Math.PI / 2;

    vehicleGroup.userData.isVehicle = true;
    vehicleGroup.userData.occupied = false;

    globals.scene.add(vehicleGroup);
}
