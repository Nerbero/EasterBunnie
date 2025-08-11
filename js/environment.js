import * as THREE from 'three';
import * as globals from './globals.js';
import gameState from './gameState.js';
import { createVehicle } from './assets.js';
import { updateAllInteractableMeshes, createDestructibleRock } from './utils.js';
import { createLighthouse } from './objectives.js';
import { addClouds } from './weather.js';

function generateTrees(count) {
    const treeGroup = new THREE.Group();

    const trunkHeight = 8;
    const leavesHeight = 15;

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 800;
        const z = (Math.random() - 0.5) * 800;

        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, (trunkHeight / 2), z); // Posizionato sopra il terreno
        trunk.castShadow = true;

        const leavesGeometry = new THREE.ConeGeometry(5, leavesHeight, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, trunkHeight + (leavesHeight / 2), z); // Posizionato sopra il terreno
        leaves.castShadow = true;

        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);
        treeGroup.add(tree);
    }

    globals.scene.add(treeGroup);
    return treeGroup;
}

function generateStaticRocks(count) {
    const rockGroup = new THREE.Group();

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 800;
        const z = (Math.random() - 0.5) * 800;

        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 3 + 1, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x757575,
            roughness: 0.8
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);

        rock.position.set(x, rockGeometry.parameters.radius, z);
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        rock.castShadow = true;
        rockGroup.add(rock);
    }

    globals.scene.add(rockGroup);
    return rockGroup;
}

function createMountains() {
    const mountainGroup = new THREE.Group();

    for (let i = 0; i < 5; i++) {
        const size = 80 + Math.random() * 40;
        const mountainGeometry = new THREE.ConeGeometry(size, 150, 8);
        const mountainMaterial = new THREE.MeshStandardMaterial({
            color: 0x78909c,
            wireframe: false,
            roughness: 0.9
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);

        mountain.position.set(
            -300 + i * 150,
            -50,
            -400
        );

        mountain.rotation.x = Math.PI / 2;
        mountainGroup.add(mountain);
    }

    globals.scene.add(mountainGroup);
    return mountainGroup;
}

function createNavigatorSpaceship() {
    const spaceshipGroup = new THREE.Group();

    const bodyGeometry = new THREE.SphereGeometry(50, 32, 16);
    bodyGeometry.applyMatrix4(new THREE.Matrix4().makeScale(1.5, 0.5, 1.5));
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        metalness: 0.9,
        roughness: 0.1,
        envMap: globals.scene.background,
        envMapIntensity: 1.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    spaceshipGroup.add(body);

    const cockpitGeometry = new THREE.SphereGeometry(15, 32, 16);
    cockpitGeometry.applyMatrix4(new THREE.Matrix4().makeScale(1.2, 0.8, 1.2));
    const cockpitMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.1,
        envMap: globals.scene.background,
        envMapIntensity: 1.5
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.set(0, 0, -40);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    spaceshipGroup.add(cockpit);

    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.8 });
    const light1 = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), lightMaterial);
    light1.position.set(20, 5, -30);
    spaceshipGroup.add(light1);
    const light2 = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), lightMaterial);
    light2.position.set(-20, 5, -30);
    spaceshipGroup.add(light2);

    spaceshipGroup.position.set(500, 5, -500);
    spaceshipGroup.rotation.y = Math.PI / 4;
    spaceshipGroup.userData.isSpaceship = true;

    globals.scene.add(spaceshipGroup);
}

function addStaticDecorations(count) {
    const decorationGroup = new THREE.Group();

    for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 800;
        const z = (Math.random() - 0.5) * 800;
        const type = Math.floor(Math.random() * 5);

        let decorativeMesh;
        let heightOffset = 0;

        switch (type) {
            case 0:
                const monolithHeight = 10 + Math.random() * 10;
                const monolithWidth = 2 + Math.random() * 2;
                decorativeMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(monolithWidth, monolithHeight, monolithWidth),
                    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: 0.7 })
                );
                heightOffset = monolithHeight / 2;
                break;
            case 1:
                const dolmenGroup = new THREE.Group();
                const verticalHeight = 5 + Math.random() * 3;
                const verticalWidth = 1 + Math.random() * 0.5;
                const horizontalLength = 4 + Math.random() * 2;

                const vertical1 = new THREE.Mesh(
                    new THREE.BoxGeometry(verticalWidth, verticalHeight, verticalWidth),
                    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: 0.7 })
                );
                vertical1.position.set(-horizontalLength / 4, verticalHeight / 2, 0);
                dolmenGroup.add(vertical1);

                const vertical2 = new THREE.Mesh(
                    new THREE.BoxGeometry(verticalWidth, verticalHeight, verticalWidth),
                    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: 0.7 })
                );
                vertical2.position.set(horizontalLength / 4, verticalHeight / 2, 0);
                dolmenGroup.add(vertical2);

                const horizontal = new THREE.Mesh(
                    new THREE.BoxGeometry(horizontalLength, verticalWidth, verticalWidth * 2),
                    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: 0.7 })
                );
                horizontal.position.set(0, verticalHeight + verticalWidth / 2, 0);
                dolmenGroup.add(horizontal);
                decorativeMesh = dolmenGroup;
                heightOffset = 0;
                break;
            case 2:
                const menhirHeight = 7 + Math.random() * 5;
                const menhirRadius = 2 + Math.random() * 1;
                decorativeMesh = new THREE.Mesh(
                    new THREE.ConeGeometry(menhirRadius, menhirHeight, 6),
                    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: 0.7 })
                );
                heightOffset = menhirHeight / 2;
                break;
            case 3:
                const plantGroup = new THREE.Group();
                const stemHeight = 1.5 + Math.random() * 1;
                const stem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.1, stemHeight, 8),
                    new THREE.MeshStandardMaterial({ color: 0x228B22 })
                );
                stem.position.y = stemHeight / 2;
                plantGroup.add(stem);

                const mouthMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
                const mouthPartGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.5);
                const mouth1 = new THREE.Mesh(mouthPartGeometry, mouthMaterial);
                mouth1.position.set(0, stemHeight, 0);
                mouth1.rotation.x = Math.PI / 4;
                plantGroup.add(mouth1);

                const mouth2 = new THREE.Mesh(mouthPartGeometry, mouthMaterial);
                mouth2.position.set(0, stemHeight, 0);
                mouth2.rotation.x = -Math.PI / 4;
                plantGroup.add(mouth2);
                decorativeMesh = plantGroup;
                heightOffset = 0;
                break;
            case 4:
                const mushroomGroup = new THREE.Group();
                const stalkHeight = 1 + Math.random() * 0.5;
                const stalk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.3, stalkHeight, 16),
                    new THREE.MeshStandardMaterial({ color: 0xdeb887 })
                );
                stalk.position.y = stalkHeight / 2;
                mushroomGroup.add(stalk);

                const capRadius = 1 + Math.random() * 0.5;
                const cap = new THREE.Mesh(
                    new THREE.ConeGeometry(capRadius, 0.5, 32),
                    new THREE.MeshBasicMaterial({ color: 0x8A2BE2, emissive: 0x8A2BE2, emissiveIntensity: 0.5 + Math.random() * 0.5 })
                );
                cap.position.y = stalkHeight;
                mushroomGroup.add(cap);
                decorativeMesh = mushroomGroup;
                heightOffset = 0;
                break;
        }

        if (decorativeMesh) {
            decorativeMesh.position.set(x, heightOffset, z);
            decorativeMesh.rotation.y = Math.random() * Math.PI * 2;
            decorativeMesh.castShadow = true;
            decorationGroup.add(decorativeMesh);
        }
    }
    globals.scene.add(decorationGroup);
}

export function createEnvironment() {
    const terrainGeometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
    const terrainMaterial = new THREE.MeshStandardMaterial({
        color: 0x66cc66,
        wireframe: false,
        roughness: 0.7,
        metalness: 0.0
    });
    globals.setTerrain(new THREE.Mesh(terrainGeometry, terrainMaterial));
    globals.terrain.rotation.x = -Math.PI / 2;
    globals.terrain.position.y = 0;
    globals.terrain.receiveShadow = true;
    globals.scene.add(globals.terrain);

    const waterGeometry = new THREE.PlaneGeometry(800, 800);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x0077be,
        transparent: true,
        opacity: 0.7,
        roughness: 0.2,
        metalness: 0.8
    });
    globals.setWater(new THREE.Mesh(waterGeometry, waterMaterial));
    globals.water.rotation.x = -Math.PI / 2;
    globals.water.position.y = 0.5;
    globals.water.position.z = -100;
    globals.water.receiveShadow = true;
    globals.scene.add(globals.water);

    globals.setTreesGroup(generateTrees(50));
    globals.setRocksGroup(generateStaticRocks(30));
    globals.setCloudsGroup(addClouds(15));
    globals.setMountainsGroup(createMountains());

    const obstacleMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });

    const obstacle1 = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), obstacleMaterial);
    obstacle1.position.set(20, 2.5, 20);
    globals.scene.add(obstacle1);

    const obstacle2 = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 4), obstacleMaterial);
    obstacle2.position.set(-20, 2, -15);
    globals.scene.add(obstacle2);

    const obstacle3 = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 6, 16), obstacleMaterial);
    obstacle3.position.set(15, 3, -20);
    globals.scene.add(obstacle3);

    for (let i = 0; i < 8; i++) {
      const crate = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshLambertMaterial({ color: 0x8B4513 })
      );
      crate.position.set(
        Math.random() * 80 - 40,
        1,
        Math.random() * 80 - 40
      );
      globals.scene.add(crate);
    }

    for (let i = 0; i < gameState.maxDestructibleRocks; i++) {
        createDestructibleRock();
    }

    createNavigatorSpaceship();
    createVehicle();
    gameState.vehicleOriginalMaterial = globals.vehicleGroup.children[0].material.clone();
    addStaticDecorations(20);
    createLighthouse();
}
