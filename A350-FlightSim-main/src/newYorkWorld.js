/**
 * New York World Environment
 * Creates a detailed New York City environment with landmarks and terrain
 */

import * as THREE from "three";

export function createNewYorkWorld(scene) {
  // Sky background - NYC overcast look
  scene.background.setHex(0x8fa3b8);
  scene.fog.color.setHex(0x8fa3b8);
  scene.fog.far = 5000;

  // Ground/Water
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a3a52,
    roughness: 0.3,
    metalness: 0.1,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000, 128, 128), waterMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -50;
  ground.receiveShadow = true;
  scene.add(ground);

  // Hudson River
  const riverMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d5a7a,
    roughness: 0.25,
    metalness: 0.05,
  });
  const river = new THREE.Mesh(new THREE.BoxGeometry(1200, 0.1, 15000), riverMaterial);
  river.position.set(-1500, 0, 0);
  river.receiveShadow = true;
  scene.add(river);

  // East River
  const eastRiver = new THREE.Mesh(new THREE.BoxGeometry(800, 0.1, 15000), riverMaterial);
  eastRiver.position.set(1800, 0, 0);
  eastRiver.receiveShadow = true;
  scene.add(eastRiver);

  // Manhattan Island - Parks
  const parkMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a6b2a,
    roughness: 0.85,
    metalness: 0.02,
  });

  // Central Park
  const centralPark = new THREE.Mesh(new THREE.BoxGeometry(2000, 0.05, 4000), parkMaterial);
  centralPark.position.set(0, 0.02, 1200);
  scene.add(centralPark);

  // Battery Park
  const batteryPark = new THREE.Mesh(new THREE.BoxGeometry(600, 0.05, 800), parkMaterial);
  batteryPark.position.set(0, 0.02, -3800);
  scene.add(batteryPark);

  // Streets grid pattern
  const streetMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.7,
    metalness: 0.05,
  });

  // Horizontal streets (Avenues)
  for (let i = -3000; i <= 3000; i += 300) {
    const street = new THREE.Mesh(new THREE.BoxGeometry(3000, 0.02, 80), streetMaterial);
    street.position.set(0, 0.01, i);
    scene.add(street);
  }

  // Vertical streets
  for (let i = -1000; i <= 1000; i += 200) {
    const street = new THREE.Mesh(new THREE.BoxGeometry(80, 0.02, 8000), streetMaterial);
    street.position.set(i, 0.01, 0);
    scene.add(street);
  }

  // Empire State Building
  createEmpireStateBuilding(scene, -400, 0, -1000);

  // One World Trade Center (Freedom Tower)
  createFreedomTower(scene, 200, 0, -3500);

  // Chrysler Building
  createChryslerBuilding(scene, -800, 0, -500);

  // Central Park Tower
  createCentralParkTower(scene, 600, 0, 1500);

  // 432 Park Avenue
  create432ParkAvenue(scene, -600, 0, 800);

  // General office buildings
  createManhattanGridBuildings(scene);

  // Bridges
  createBrooklynBridge(scene);
  createGeorgeWashingtonBridge(scene);

  // Water features and piers
  createWaterFront(scene);

  // Lighting for NYC nighttime feel
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(-2000, 2000, -2000);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(4096, 4096);
  directionalLight.shadow.camera.left = -4000;
  directionalLight.shadow.camera.right = 4000;
  directionalLight.shadow.camera.top = 4000;
  directionalLight.shadow.camera.bottom = -4000;
  scene.add(directionalLight);
}

function createEmpireStateBuilding(scene, x, y, z) {
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.5,
    metalness: 0.3,
  });

  // Main tower
  const base = new THREE.Mesh(new THREE.BoxGeometry(250, 380, 250), baseMaterial);
  base.position.set(x, y + 190, z);
  base.castShadow = true;
  base.receiveShadow = true;
  scene.add(base);

  // Upper tower (narrower)
  const upper = new THREE.Mesh(new THREE.BoxGeometry(180, 120, 180), baseMaterial);
  upper.position.set(x, y + 360, z);
  upper.castShadow = true;
  scene.add(upper);

  // Spire
  const spireMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999,
    roughness: 0.4,
    metalness: 0.6,
  });
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(30, 20, 120, 8), spireMaterial);
  spire.position.set(x, y + 460, z);
  spire.castShadow = true;
  scene.add(spire);

  // Observatory deck lights
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffff99,
    emissive: 0xffff00,
    emissiveIntensity: 1.2,
  });
  const obsLight = new THREE.Mesh(new THREE.BoxGeometry(200, 20, 200), lightMat);
  obsLight.position.set(x, y + 320, z);
  scene.add(obsLight);
}

function createFreedomTower(scene, x, y, z) {
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: 0.8,
  });

  // Main tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(200, 541, 200), glassMaterial);
  tower.position.set(x, y + 270, z);
  tower.castShadow = true;
  tower.receiveShadow = true;
  scene.add(tower);

  // Spire
  const spireMaterial = new THREE.MeshStandardMaterial({
    color: 0xccccff,
    emissive: 0x6666ff,
    emissiveIntensity: 0.5,
    metalness: 0.8,
  });
  const spire = new THREE.Mesh(new THREE.ConeGeometry(60, 200, 8), spireMaterial);
  spire.position.set(x, y + 541, z);
  scene.add(spire);

  // Base
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.6,
  });
  const base = new THREE.Mesh(new THREE.BoxGeometry(300, 80, 300), baseMaterial);
  base.position.set(x, y + 40, z);
  scene.add(base);
}

function createChryslerBuilding(scene, x, y, z) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xbbbbbb,
    roughness: 0.4,
    metalness: 0.4,
  });

  // Main tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(160, 319, 160), material);
  tower.position.set(x, y + 160, z);
  tower.castShadow = true;
  scene.add(tower);

  // Stepped crown
  const crownMaterial = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.7,
    roughness: 0.3,
  });

  for (let i = 0; i < 4; i++) {
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(160 - i * 30, 30, 160 - i * 30),
      crownMaterial
    );
    crown.position.set(x, y + 320 + i * 35, z);
    scene.add(crown);
  }

  // Spire
  const spire = new THREE.Mesh(new THREE.ConeGeometry(40, 100, 4), crownMaterial);
  spire.position.set(x, y + 500, z);
  scene.add(spire);
}

function createCentralParkTower(scene, x, y, z) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.3,
    metalness: 0.5,
  });

  const tower = new THREE.Mesh(new THREE.BoxGeometry(180, 472, 180), material);
  tower.position.set(x, y + 236, z);
  tower.castShadow = true;
  scene.add(tower);

  // Top
  const top = new THREE.Mesh(new THREE.BoxGeometry(100, 80, 100), material);
  top.position.set(x, y + 430, z);
  scene.add(top);
}

function create432ParkAvenue(scene, x, y, z) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xccccdd,
    roughness: 0.5,
    metalness: 0.2,
  });

  const tower = new THREE.Mesh(new THREE.BoxGeometry(200, 426, 200), material);
  tower.position.set(x, y + 213, z);
  tower.castShadow = true;
  scene.add(tower);
}

function createManhattanGridBuildings(scene) {
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.6, metalness: 0.2 }),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.5, metalness: 0.3 }),
    new THREE.MeshStandardMaterial({ color: 0xbbbbbb, roughness: 0.6, metalness: 0.15 }),
    new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.1 }),
  ];

  // Create grid of buildings
  for (let x = -1000; x <= 1000; x += 400) {
    for (let z = -3000; z <= 3000; z += 400) {
      // Skip areas with major buildings
      if (
        (Math.abs(x) < 600 && Math.abs(z) < 1500) || // Central Park area
        (Math.abs(x) < 500 && z < -3200) || // Freedom Tower area
        (Math.abs(x) < 600 && Math.abs(z - 1500) < 600) // Central Park Tower area
      ) {
        continue;
      }

      const height = 80 + Math.random() * 200;
      const width = 150 + Math.random() * 80;
      const depth = 150 + Math.random() * 80;
      const material = materials[Math.floor(Math.random() * materials.length)];

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
      );
      building.position.set(x + Math.random() * 100, height / 2, z + Math.random() * 100);
      building.castShadow = true;
      building.receiveShadow = true;
      scene.add(building);
    }
  }
}

function createBrooklynBridge(scene) {
  const cableMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.7,
  });

  // Bridge towers
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x666666,
    roughness: 0.6,
  });

  const tower1 = new THREE.Mesh(new THREE.ConeGeometry(100, 300, 4), towerMat);
  tower1.position.set(-800, 150, -4000);
  scene.add(tower1);

  const tower2 = new THREE.Mesh(new THREE.ConeGeometry(100, 300, 4), towerMat);
  tower2.position.set(800, 150, -4000);
  scene.add(tower2);

  // Bridge deck
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.8,
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(1600, 30, 200), deckMaterial);
  deck.position.set(0, 100, -4000);
  scene.add(deck);
}

function createGeorgeWashingtonBridge(scene) {
  // Towers
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x777777,
    roughness: 0.5,
    metalness: 0.3,
  });

  const tower1 = new THREE.Mesh(new THREE.BoxGeometry(80, 350, 80), towerMat);
  tower1.position.set(-1200, 175, 2000);
  scene.add(tower1);

  const tower2 = new THREE.Mesh(new THREE.BoxGeometry(80, 350, 80), towerMat);
  tower2.position.set(1200, 175, 2000);
  scene.add(tower2);

  // Bridge deck
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.7,
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2400, 25, 150), deckMaterial);
  deck.position.set(0, 120, 2000);
  scene.add(deck);
}

function createWaterFront(scene) {
  const pierMaterial = new THREE.MeshStandardMaterial({
    color: 0x663333,
    roughness: 0.8,
  });

  // Multiple piers along Manhattan
  const pierPositions = [
    { x: -1800, z: -2000 },
    { x: -1800, z: 0 },
    { x: -1800, z: 2000 },
    { x: 2000, z: -2000 },
    { x: 2000, z: 0 },
    { x: 2000, z: 2000 },
  ];

  pierPositions.forEach((pos) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(300, 50, 100), pierMaterial);
    pier.position.set(pos.x, 25, pos.z);
    scene.add(pier);
  });
}

export default createNewYorkWorld;
