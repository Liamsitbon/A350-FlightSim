import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import WeatherSystem from "./weather.js";
import WeatherUI from "./weatherUI.js";
import createNewYorkWorld from "./newYorkWorld.js";

const canvas = document.querySelector("#sim-canvas");
const loading = document.querySelector("#loading");
const hud = {
  speed: document.querySelector("#speed"),
  altitude: document.querySelector("#altitude"),
  heading: document.querySelector("#heading"),
  verticalSpeed: document.querySelector("#vertical-speed"),
  throttleInput: document.querySelector("#throttle"),
  throttleOutput: document.querySelector("#throttle-output"),
  flapsInput: document.querySelector("#flaps"),
  flapsOutput: document.querySelector("#flaps-output"),
  gearToggle: document.querySelector("#gear-toggle"),
  gearState: document.querySelector("#gear-state"),
  modelState: document.querySelector("#model-state"),
  missionState: document.querySelector("#mission-state"),
  flightMode: document.querySelector("#flight-mode"),
  attitudeBg: document.querySelector("#attitude-bg"),
  controlButtons: [...document.querySelectorAll("[data-control]")],
};

const METERS_TO_FEET = 3.28084;
const MS_TO_KNOTS = 1.94384;
const CONTROL_PULSE_MS = 520;
const GROUND_Y = 5.2;
const CHECKPOINT_PASS_RADIUS = 68;
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const clock = new THREE.Clock();
const keys = new Set();
const keyPulses = new Map();
const heldControls = new Set();
const controlPulses = new Map();
const checkpoints = [];

const state = {
  throttle: 0,
  flaps: 2,
  gearDown: true,
  airspeed: 0,
  verticalSpeed: 0,
  heading: 0,
  pitch: 0,
  pitchInput: 0,
  rollInput: 0,
  yawInput: 0,
  roll: 0,
  yaw: 0,
  airborne: false,
  missionIndex: 0,
  missionPulse: 0,
  position: new THREE.Vector3(0, GROUND_Y, -1140),
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8dd4ff);
scene.fog = new THREE.Fog(0x91d3ff, 900, 6800);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 18000);
camera.position.set(0, 24, -88);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const aircraft = new THREE.Group();
aircraft.name = "A350-900";
scene.add(aircraft);

const aircraftVisual = new THREE.Group();
aircraft.add(aircraftVisual);
let groundShadow;

// Weather system initialization
const weather = new WeatherSystem();
const weatherUI = new WeatherUI(weather);

const renderProbe = {
  frame: 0,
  pixel: new Uint8Array(4),
};

setupLighting();
createNewYorkWorld(scene);
createRunway();
createMissionRings();
createAircraftShadow();
createProceduralA350();
loadLicensedA350Model();
bindControls();
resize();

// Initialize weather UI
weatherUI.init(document.querySelector(".sim-shell"));

// Add weather CSS
const weatherCssLink = document.createElement("link");
weatherCssLink.rel = "stylesheet";
weatherCssLink.href = "./src/weatherStyles.css";
document.head.appendChild(weatherCssLink);

setTimeout(() => loading.classList.add("is-hidden"), 700);
renderer.setAnimationLoop(animate);

function setupLighting() {
  const hemi = new THREE.HemisphereLight(0xbfe9ff, 0x35442d, 1.85);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff2cd, 2.8);
  sun.position.set(-2000, 2000, -2000);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.camera.left = -4000;
  sun.shadow.camera.right = 4000;
  sun.shadow.camera.top = 4000;
  sun.shadow.camera.bottom = -4000;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 5000;
  scene.add(sun);
}

function createRunway() {
  const runwayGroup = new THREE.Group();
  scene.add(runwayGroup);

  const asphalt = new THREE.MeshStandardMaterial({
    color: 0x22272e,
    roughness: 0.72,
    metalness: 0.01,
  });
  const runway = new THREE.Mesh(new THREE.BoxGeometry(92, 0.18, 3100), asphalt);
  runway.position.y = 0.02;
  runway.receiveShadow = true;
  runwayGroup.add(runway);

  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x303740, roughness: 0.82 });
  [-62, 62].forEach((x) => {
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(18, 0.14, 3100), shoulderMat);
    shoulder.position.set(x, 0.025, 0);
    shoulder.receiveShadow = true;
    runwayGroup.add(shoulder);
  });

  const markingMat = new THREE.MeshStandardMaterial({
    color: 0xf7f5e9,
    roughness: 0.54,
    emissive: 0x111111,
  });
  for (let z = -1420; z <= 1420; z += 140) {
    const centerLine = new THREE.Mesh(new THREE.BoxGeometry(4, 0.05, 54), markingMat);
    centerLine.position.set(0, 0.16, z);
    runwayGroup.add(centerLine);
  }

  [-1355, 1355].forEach((z) => {
    const threshold = new THREE.Mesh(new THREE.BoxGeometry(70, 0.055, 10), markingMat);
    threshold.position.set(0, 0.17, z);
    runwayGroup.add(threshold);

    for (let i = -3; i <= 3; i += 1) {
      if (i === 0) continue;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(7, 0.06, 60), markingMat);
      bar.position.set(i * 10, 0.18, z + Math.sign(z) * -52);
      runwayGroup.add(bar);
    }
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xd7f7ff,
    emissive: 0x6ee7f9,
    emissiveIntensity: 1.6,
  });
  for (let z = -1480; z <= 1480; z += 100) {
    [-58, 58].forEach((x) => {
      const light = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 8), lightMat);
      light.position.set(x, 2.8, z);
      runwayGroup.add(light);
    });
  }
}

function createMissionRings() {
  const ringGeometry = new THREE.TorusGeometry(34, 2.2, 12, 72);
  const activeMaterial = new THREE.MeshStandardMaterial({
    color: 0x6ee7f9,
    emissive: 0x168aa0,
    emissiveIntensity: 1.45,
    roughness: 0.28,
  });
  const inactiveMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0x5a3a05,
    emissiveIntensity: 0.55,
    roughness: 0.34,
    transparent: true,
    opacity: 0.72,
  });
  const completeMaterial = new THREE.MeshStandardMaterial({
    color: 0x8ee07c,
    emissive: 0x2b7a2d,
    emissiveIntensity: 0.9,
    roughness: 0.3,
    transparent: true,
    opacity: 0.5,
  });

  // NYC mission route - flying around Manhattan landmarks
  const route = [
    [0, 300, -2000],        // Battery Park
    [-400, 350, -1000],     // Empire State Building
    [200, 400, -3500],      // One World Trade Center
    [-800, 300, -500],      // Chrysler Building
    [600, 450, 1500],       // Central Park Tower
  ];

  route.forEach((position, index) => {
    const ring = new THREE.Mesh(ringGeometry, index === 0 ? activeMaterial.clone() : inactiveMaterial.clone());
    ring.position.set(...position);
    ring.name = `checkpoint-${index + 1}`;
    ring.castShadow = false;
    scene.add(ring);

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 12, 8),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x6ee7f9,
        emissiveIntensity: index === 0 ? 1.6 : 0.5,
      }),
    );
    marker.position.set(position[0], position[1] + 34, position[2]);
    scene.add(marker);

    checkpoints.push({
      ring,
      marker,
      activeMaterial,
      inactiveMaterial,
      completeMaterial,
    });
  });
}

function createAircraftShadow() {
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x071018,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  groundShadow = new THREE.Mesh(new THREE.CircleGeometry(34, 42), shadowMaterial);
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.set(state.position.x, 0.21, state.position.z);
  scene.add(groundShadow);
}

function createProceduralA350() {
  aircraftVisual.clear();
  aircraftVisual.scale.setScalar(1);
  aircraftVisual.rotation.set(0, Math.PI, 0);

  const white = new THREE.MeshStandardMaterial({
    color: 0xf7fbff,
    roughness: 0.34,
    metalness: 0.08,
  });
  const blue = new THREE.MeshStandardMaterial({
    color: 0x2f70bc,
    roughness: 0.42,
    metalness: 0.06,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x101923,
    roughness: 0.38,
    metalness: 0.18,
  });
  const glass = new THREE.MeshStandardMaterial({
    color: 0x142b3d,
    roughness: 0.08,
    metalness: 0.12,
    emissive: 0x06111b,
  });

  const fuselage = new THREE.Mesh(new THREE.CapsuleGeometry(6.2, 62, 18, 34), white);
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  fuselage.receiveShadow = true;
  aircraftVisual.add(fuselage);

  const noseStripe = new THREE.Mesh(new THREE.CapsuleGeometry(6.25, 61.8, 18, 34), blue);
  noseStripe.rotation.x = Math.PI / 2;
  noseStripe.scale.set(1.012, 0.09, 1.012);
  noseStripe.position.y = -2.1;
  aircraftVisual.add(noseStripe);

  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(8.6, 2.1, 3.4), glass);
  cockpit.position.set(0, 3.9, -35.4);
  cockpit.rotation.x = -0.18;
  cockpit.castShadow = true;
  aircraftVisual.add(cockpit);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(-4, 0);
  wingShape.lineTo(-47, 8);
  wingShape.lineTo(-58, 14);
  wingShape.lineTo(-8, 4);
  wingShape.lineTo(4, 0);
  const wingGeometry = new THREE.ExtrudeGeometry(wingShape, { depth: 0.72, bevelEnabled: false });
  wingGeometry.rotateX(Math.PI / 2);
  wingGeometry.translate(0, 0, -4);

  const leftWing = new THREE.Mesh(wingGeometry, white);
  leftWing.position.set(0, -0.6, -3);
  leftWing.castShadow = true;
  aircraftVisual.add(leftWing);

  const rightWing = leftWing.clone();
  rightWing.scale.x = -1;
  aircraftVisual.add(rightWing);

  const wingletGeometry = new THREE.BoxGeometry(1.8, 11, 4.5);
  const leftWinglet = new THREE.Mesh(wingletGeometry, blue);
  leftWinglet.position.set(-57.5, 5.1, 11.5);
  leftWinglet.rotation.z = -0.34;
  leftWinglet.rotation.x = 0.2;
  leftWinglet.castShadow = true;
  aircraftVisual.add(leftWinglet);

  const rightWinglet = leftWinglet.clone();
  rightWinglet.position.x *= -1;
  rightWinglet.rotation.z *= -1;
  aircraftVisual.add(rightWinglet);

  [-25, 25].forEach((x) => {
    const nacelle = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.6, 9.4, 28), dark);
    nacelle.rotation.x = Math.PI / 2;
    nacelle.position.set(x, -4.8, -4.5);
    nacelle.castShadow = true;
    aircraftVisual.add(nacelle);

    const intake = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 0.55, 28), glass);
    intake.rotation.x = Math.PI / 2;
    intake.position.set(x, -4.8, -9.4);
    aircraftVisual.add(intake);
  });

  const tail = new THREE.Mesh(new THREE.BoxGeometry(3, 20, 13), blue);
  tail.position.set(0, 10, 31);
  tail.rotation.x = -0.26;
  tail.castShadow = true;
  aircraftVisual.add(tail);

  const tailWingGeometry = new THREE.BoxGeometry(38, 1.2, 6);
  const hTail = new THREE.Mesh(tailWingGeometry, white);
  hTail.position.set(0, 5.4, 30);
  hTail.castShadow = true;
  aircraftVisual.add(hTail);

  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0d1117, roughness: 0.5, metalness: 0.2 });
  const strutMat = new THREE.MeshStandardMaterial({ color: 0xc6ccd2, roughness: 0.35, metalness: 0.5 });
  const gearGroup = new THREE.Group();
  gearGroup.name = "gear";
  [
    [0, -8.8, -23],
    [-7, -8.9, 8],
    [7, -8.9, 8],
  ].forEach(([x, y, z]) => {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 5, 8), strutMat);
    strut.position.set(x, y + 1.7, z);
    strut.castShadow = true;
    gearGroup.add(strut);

    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 1.1, 18), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y - 1.3, z);
    wheel.castShadow = true;
    gearGroup.add(wheel);
  });
  aircraftVisual.add(gearGroup);

  aircraftVisual.position.y = 4.5;
  hud.modelState.textContent = "PROC A350-900";
}

function loadLicensedA350Model() {
  const loader = new GLTFLoader();
  loader.load(
    "./public/models/a350-900.glb",
    (gltf) => {
      const model = gltf.scene;
      aircraftVisual.clear();
      aircraftVisual.rotation.set(0, 0, 0);
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material?.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      model.position.sub(center);

      const longest = Math.max(size.x, size.y, size.z) || 1;
      model.scale.setScalar(82 / longest);
      model.rotation.y = Math.PI;
      aircraftVisual.add(model);
      aircraftVisual.position.y = 8.2;
      hud.modelState.textContent = "A350-900 GLB";
      loading.textContent = "MODEL LOADED";
      setTimeout(() => loading.classList.add("is-hidden"), 400);
    },
    undefined,
    () => {
      loading.textContent = "A350-900 READY";
    },
  );
}

function bindControls() {
  window.addEventListener("keydown", (event) => {
    keys.add(event.code);
    keyPulses.set(event.code, performance.now() + CONTROL_PULSE_MS);
    if (event.code === "KeyG" && !event.repeat) toggleGear();
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  window.addEventListener("resize", resize);

  hud.throttleInput.addEventListener("input", () => {
    state.throttle = Number(hud.throttleInput.value) / 100;
  });
  hud.flapsInput.addEventListener("input", () => {
    state.flaps = Number(hud.flapsInput.value);
  });
  hud.gearToggle.addEventListener("click", toggleGear);

  hud.controlButtons.forEach((button) => {
    const control = button.dataset.control;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      heldControls.add(control);
      button.classList.add("is-active");
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointerup", (event) => {
      releaseControl(button, control, event.pointerId);
    });
    button.addEventListener("pointercancel", (event) => {
      releaseControl(button, control, event.pointerId);
    });
    button.addEventListener("pointerleave", () => {
      heldControls.delete(control);
      button.classList.remove("is-active");
    });
  });
}

function releaseControl(button, control, pointerId) {
  heldControls.delete(control);
  controlPulses.set(control, performance.now() + CONTROL_PULSE_MS);
  button.classList.remove("is-active");
  if (button.hasPointerCapture(pointerId)) button.releasePointerCapture(pointerId);
}

function toggleGear() {
  state.gearDown = !state.gearDown;
  const gear = aircraftVisual.getObjectByName("gear");
  if (gear) gear.visible = state.gearDown;
  hud.gearToggle.classList.toggle("is-up", !state.gearDown);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.035);
  updateInputs(dt);
  updateFlightModel(dt);
  updateAircraftTransform();
  updateAircraftShadow();
  updateMission(dt);
  updateCamera(dt);
  updateHud();
  updateTelemetry();
  
  // Update weather
  weather.updateWeather(dt);
  weatherUI.update();
  
  renderer.render(scene, camera);
  updateRenderProbe();
}

function updateInputs(dt) {
  const throttleDelta = 0.34 * dt;
  if (keys.has("KeyW")) state.throttle = Math.min(1, state.throttle + throttleDelta);
  if (keys.has("KeyS")) state.throttle = Math.max(0, state.throttle - throttleDelta);

  state.pitchInput =
    axisInput(["ArrowDown", "KeyK"], ["ArrowUp", "KeyI"], "pitch-up", "pitch-down");
  state.rollInput =
    axisInput(["ArrowLeft", "KeyJ"], ["ArrowRight", "KeyL"], "roll-left", "roll-right");
  state.yawInput =
    axisInput(["KeyA", "KeyQ"], ["KeyD", "KeyE"], "yaw-left", "yaw-right");

  if (state.pitchInput > 0 && state.throttle < 0.92) {
    state.throttle = Math.min(0.92, state.throttle + 0.82 * dt);
  }

  hud.throttleInput.value = Math.round(state.throttle * 100);

  const targetPitch = state.pitchInput * 0.38;
  const targetRoll = state.rollInput * 0.58;
  const targetYaw = state.yawInput * 0.5;

  state.pitch = THREE.MathUtils.lerp(state.pitch, targetPitch, 4.2 * dt);
  state.roll = THREE.MathUtils.lerp(state.roll, targetRoll, 4.5 * dt);
  state.yaw += (targetYaw + Math.sin(state.roll) * 0.42) * dt;
}

function axisInput(positiveKeys, negativeKeys, positiveControl, negativeControl) {
  const positive =
    positiveKeys.some((code) => activeKey(code)) || activeControl(positiveControl);
  const negative =
    negativeKeys.some((code) => activeKey(code)) || activeControl(negativeControl);
  return Number(positive) - Number(negative);
}

function activeKey(code) {
  const pulseUntil = keyPulses.get(code) || 0;
  return keys.has(code) || pulseUntil > performance.now();
}

function activeControl(control) {
  const pulseUntil = controlPulses.get(control) || 0;
  return heldControls.has(control) || pulseUntil > performance.now();
}

function updateFlightModel(dt) {
  const speedKts = state.airspeed * MS_TO_KNOTS;
  const drag = 0.00072 * state.airspeed * state.airspeed;
  const gearDrag = state.gearDown ? 0.44 : 0;
  const flapsDrag = state.flaps * 0.16;
  const thrust = state.throttle * 15.2;
  const brake = keys.has("Space") ? 8.5 : 0;
  state.airspeed = Math.max(0, state.airspeed + (thrust - drag - gearDrag - flapsDrag - brake) * dt);

  const lift = Math.max(0, (speedKts - 60 + state.flaps * 12) / 86);
  const pitchLift = Math.sin(state.pitch) * state.airspeed * 2.55;
  const targetVerticalSpeed = (lift - 0.5) * 7.5 + pitchLift;
  const response = state.airborne ? 1.7 : 0.9;
  state.verticalSpeed = THREE.MathUtils.lerp(state.verticalSpeed, targetVerticalSpeed, response * dt);

  const forward = new THREE.Vector3(Math.sin(state.yaw), 0, Math.cos(state.yaw));
  state.position.addScaledVector(forward, state.airspeed * dt);

  const rotationReady = speedKts > 74 && state.pitch > 0.035;
  if (rotationReady) {
    state.airborne = true;
    state.verticalSpeed = Math.max(state.verticalSpeed, 6.5);
  }

  if (state.airborne) {
    state.position.y += state.verticalSpeed * dt;
    if (state.position.y <= GROUND_Y && state.verticalSpeed < 0) {
      state.position.y = GROUND_Y;
      state.verticalSpeed = 0;
      state.airborne = false;
      state.pitch = Math.max(state.pitch, 0);
    }
  } else {
    state.position.y = GROUND_Y;
    state.verticalSpeed = 0;
    state.roll *= 0.92;
    state.yaw += state.yawInput * 0.24 * dt;
  }
}

function updateAircraftTransform() {
  aircraft.position.copy(state.position);
  aircraft.rotation.set(-state.pitch, state.yaw, -state.roll, "YXZ");

  const gear = aircraftVisual.getObjectByName("gear");
  if (gear) {
    const visibleLift = state.gearDown ? 1 : 0;
    gear.scale.y = THREE.MathUtils.lerp(gear.scale.y, visibleLift, 0.16);
  }
}

function updateAircraftShadow() {
  if (!groundShadow) return;
  const altitude = Math.max(0, state.position.y - GROUND_Y);
  groundShadow.position.set(state.position.x, 0.22, state.position.z);
  const scale = THREE.MathUtils.clamp(1 + altitude / 160, 1, 2.5);
  groundShadow.scale.set(scale * 1.6, scale * 0.45, 1);
  groundShadow.material.opacity = THREE.MathUtils.clamp(0.34 - altitude / 420, 0.06, 0.34);
}

function updateMission(dt) {
  if (!checkpoints.length) return;

  checkpoints.forEach((checkpoint, index) => {
    checkpoint.ring.rotation.z += (index === state.missionIndex ? 0.9 : 0.22) * dt;
    checkpoint.ring.rotation.x = Math.sin(clock.elapsedTime * 1.3 + index) * 0.04;
  });

  const active = checkpoints[state.missionIndex];
  if (!active) {
    hud.missionState.textContent = "ROUTE DONE";
    return;
  }

  const distance = active.ring.position.distanceTo(state.position);
  if (distance < CHECKPOINT_PASS_RADIUS) {
    active.ring.material = active.completeMaterial.clone();
    active.marker.material.emissiveIntensity = 0.35;
    state.missionIndex += 1;
    state.missionPulse = 1;

    const next = checkpoints[state.missionIndex];
    if (next) {
      next.ring.material = next.activeMaterial.clone();
      next.marker.material.emissiveIntensity = 1.6;
    }
  }

  state.missionPulse = Math.max(0, state.missionPulse - dt * 1.8);
  hud.missionState.textContent =
    state.missionIndex >= checkpoints.length
      ? "ROUTE DONE"
      : `RING ${state.missionIndex + 1}/${checkpoints.length}`;
}

function updateCamera(dt) {
  const back = new THREE.Vector3(0, 0, -1).applyAxisAngle(WORLD_UP, state.yaw);
  const side = new THREE.Vector3(1, 0, 0).applyAxisAngle(WORLD_UP, state.yaw);
  const cameraTarget = state.position
    .clone()
    .addScaledVector(back, 128)
    .addScaledVector(side, state.roll * 22)
    .add(new THREE.Vector3(0, 38 + Math.abs(state.roll) * 18 + Math.max(0, state.position.y - GROUND_Y) * 0.08, 0));
  camera.position.lerp(cameraTarget, 1 - Math.exp(-3.2 * dt));

  const lookAt = state.position
    .clone()
    .add(new THREE.Vector3(0, 12, 0))
    .add(new THREE.Vector3(Math.sin(state.yaw), Math.sin(state.pitch) * 0.4, Math.cos(state.yaw)).multiplyScalar(80));
  camera.lookAt(lookAt);
}

function updateHud() {
  const speedKts = Math.round(state.airspeed * MS_TO_KNOTS);
  const altitudeFt = Math.max(0, Math.round((state.position.y - GROUND_Y) * METERS_TO_FEET));
  const verticalFpm = Math.round(state.verticalSpeed * 196.85);
  const heading = ((THREE.MathUtils.radToDeg(state.yaw) % 360) + 360) % 360;

  hud.speed.textContent = speedKts.toString().padStart(3, "0");
  hud.altitude.textContent = altitudeFt.toString();
  hud.heading.textContent = Math.round(heading).toString().padStart(3, "0");
  hud.verticalSpeed.textContent = verticalFpm.toString();
  hud.throttleOutput.textContent = `${Math.round(state.throttle * 100)}%`;
  hud.flapsOutput.textContent = state.flaps.toString();
  hud.gearState.textContent = state.gearDown ? "GEAR DOWN" : "GEAR UP";

  if (state.airborne) {
    hud.flightMode.textContent = state.verticalSpeed > 3 ? "CLIMB" : state.verticalSpeed < -1.5 ? "DESCENT" : "FLIGHT";
  } else if (speedKts > 55) {
    hud.flightMode.textContent = "TAKEOFF";
  } else if (state.throttle > 0.02) {
    hud.flightMode.textContent = "TAXI";
  } else {
    hud.flightMode.textContent = "PARKED";
  }

  const pitchOffset = THREE.MathUtils.clamp(THREE.MathUtils.radToDeg(state.pitch) * 1.45, -35, 35);
  hud.attitudeBg.style.transform = `translateY(${pitchOffset}px) rotate(${-THREE.MathUtils.radToDeg(state.roll)}deg)`;
}

function updateRenderProbe() {
  renderProbe.frame += 1;
  if (renderProbe.frame % 24 !== 0) return;

  const gl = renderer.getContext();
  const x = Math.floor(gl.drawingBufferWidth * 0.5);
  const y = Math.floor(gl.drawingBufferHeight * 0.5);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, renderProbe.pixel);

  const [r, g, b, a] = renderProbe.pixel;
  canvas.dataset.renderFrame = String(renderProbe.frame);
  canvas.dataset.renderPixel = `${r},${g},${b},${a}`;
  canvas.dataset.renderNonblank = String(a > 0 && r + g + b > 20);
  canvas.dataset.renderSize = `${gl.drawingBufferWidth}x${gl.drawingBufferHeight}`;
}

function updateTelemetry() {
  canvas.dataset.pitch = state.pitch.toFixed(3);
  canvas.dataset.roll = state.roll.toFixed(3);
  canvas.dataset.yaw = state.yaw.toFixed(3);
  canvas.dataset.altitudeMeters = Math.max(0, state.position.y - GROUND_Y).toFixed(2);
  canvas.dataset.airspeed = state.airspeed.toFixed(2);
  canvas.dataset.missionIndex = String(state.missionIndex);
}
