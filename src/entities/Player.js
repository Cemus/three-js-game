import * as THREE from "three";
import Loader from "./Loader";

export default class Player {
  constructor(
    loader,
    playerSpawningZone,
    cameraTriggerActivation,
    toggleInteractPrompt
  ) {
    this.playerSpawningZone = playerSpawningZone;
    this.cameraTriggerActivation = cameraTriggerActivation;
    this.toggleInteractPrompt = toggleInteractPrompt;

    this.loader = loader;
    this.assetsFolder = "../../assets/models/player/";
    this.assetsModelName = "lastPsych.gltf";
    this.mixer = null;
    this.model = null;
    this.playerWalkingAnim = null;
    this.playerIdleAnim = null;
    this.playerRunningAnim = null;
    this.animationTimeOnPause = 0;

    this.isRunning = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.rotateLeft = false;
    this.rotateRight = false;

    this.currentState = "idle";
    this.isTheGamePaused = false;

    this.lastBackwardKeyPressTime = 0;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.collider = null;
    this.isColliding = false;
  }

  async loadGameAssets() {
    try {
      this.model = await this.loader.loadModel(
        `${this.assetsFolder}${this.assetsModelName}`
      );
      this.setupPlayer();
      this.mixer = new THREE.AnimationMixer(this.model);

      const walkingAnim = await this.loader.loadAnimation(
        `${this.assetsFolder}playerWalkingAnim.gltf`
      );
      const idleAnim = await this.loader.loadAnimation(
        `${this.assetsFolder}playerIdleAnim.gltf`
      );
      const runningAnim = await this.loader.loadAnimation(
        `${this.assetsFolder}playerRunningAnim.gltf`
      );

      await this.setupAnimations(walkingAnim, idleAnim, runningAnim);
      this.model.userData.mixer = this.mixer;
    } catch (error) {
      console.error("Erreur de chargement du modèle:", error);
    }
  }

  setupListeners() {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
  }

  setupPlayer() {
    this.setupListeners();

    this.model.traverse((node) => {
      node.castShadow = true;
      node.receiveShadow = true;
    });

    const spawnPosition = this.playerSpawningZone.position.clone();
    const spawnRotation = this.playerSpawningZone.rotation.clone();

    this.model.rotation.copy(spawnRotation);
    this.model.position.copy(spawnPosition);

    this.model.scale.set(0.2, 0.2, 0.2);

    this.collider = new THREE.Box3().setFromObject(this.model);
  }

  async setupAnimations(walkingAnim, idleAnim, runningAnim) {
    const animations = [...walkingAnim, ...idleAnim, ...runningAnim];
    if (animations && animations.length > 0) {
      this.playerWalkingAnim = this.mixer.clipAction(animations[0]);
      this.playerIdleAnim = this.mixer.clipAction(animations[1]);
      this.playerRunningAnim = this.mixer.clipAction(animations[2]);
      this.playerIdleAnim.play();
    }
  }

  updatePlayerPosition(solidInstancesList, triggerList) {
    const rotationSpeed = 0.06;
    const normalSpeed = 4;
    const backwardSpeed = 2.5;
    const runningSpeed = 4.5;
    const multiplicateur = 0.01;

    this.collider.setFromObject(this.model);

    if (this.checkWallCollisions(solidInstancesList)) {
      this.handleWallCollisions(solidInstancesList);
    }
    this.toggleInteractPrompt(false);
    if (this.checkTriggerCollisions(triggerList)) {
      this.handleTriggerCollisions(triggerList);
    }

    if (this.moveForward) {
      const forwardDelta = new THREE.Vector3(0, 0, 1).applyQuaternion(
        this.model.quaternion
      );
      this.model.position.add(
        forwardDelta.multiplyScalar(normalSpeed * multiplicateur)
      );
    }

    if (this.moveBackward) {
      const backwardDelta = new THREE.Vector3(0, 0, -1).applyQuaternion(
        this.model.quaternion
      );
      this.model.position.add(
        backwardDelta.multiplyScalar(backwardSpeed * multiplicateur)
      );
    }

    if (this.isRunning && this.moveForward) {
      const forwardDelta = new THREE.Vector3(0, 0, 1).applyQuaternion(
        this.model.quaternion
      );
      this.model.position.add(
        forwardDelta.multiplyScalar(runningSpeed * multiplicateur)
      );
    }

    if (this.rotateLeft) {
      this.model.rotation.y -= rotationSpeed;
    }

    if (this.rotateRight) {
      this.model.rotation.y += rotationSpeed;
    }
  }

  checkWallCollisions(solidInstancesList) {
    for (const object of solidInstancesList) {
      if (object.userData.isSolid) {
        if (this.collider.intersectsBox(object.userData.collider)) {
          return true;
        }
      }
    }
    return false;
  }

  handleWallCollisions(solidInstancesList) {
    const pushDistance = 0.1;
    const originalY = this.model.position.y;
    const directionsToTest = [
      new THREE.Vector3(-pushDistance, 0, 0), // Gauche
      new THREE.Vector3(pushDistance, 0, 0), // Droite
      new THREE.Vector3(0, 0, -pushDistance), // Arrière
      new THREE.Vector3(0, 0, pushDistance), // Avant
      new THREE.Vector3(-pushDistance, 0, -pushDistance), // Diagonale haut gauche
      new THREE.Vector3(pushDistance, 0, -pushDistance), // Diagonale haut droite
      new THREE.Vector3(-pushDistance, 0, pushDistance), // Diagonale bas gauche
      new THREE.Vector3(pushDistance, 0, pushDistance), // Diagonale bas droite
    ];

    let newPosition = this.model.position.clone();
    const collisionBox = new THREE.Box3().setFromObject(this.model);

    for (const direction of directionsToTest) {
      const offset = direction.clone();

      newPosition.add(offset);
      collisionBox.translate(offset);

      let isColliding = false;

      // Collision ?
      for (const object of solidInstancesList) {
        if (
          object.userData.isSolid &&
          collisionBox.intersectsBox(object.userData.collider)
        ) {
          isColliding = true;
          break;
        }
      }

      if (!isColliding) {
        this.model.position.copy(newPosition);
        this.model.position.y = originalY;
        return;
      }

      // Reset
      newPosition.sub(offset);
      collisionBox.translate(offset.negate());
    }
  }

  checkTriggerCollisions(triggerList) {
    for (const object of triggerList) {
      if (this.collider.intersectsBox(object.userData.collider)) {
        return true;
      }
    }
    return false;
  }

  handleTriggerCollisions(triggerList) {
    for (const object of triggerList) {
      if (this.collider.intersectsBox(object.userData.collider)) {
        const objectName = object.name;
        if (objectName.includes("cameraTrigger")) {
          const cameraNumber = objectName.substring("cameraTrigger".length);
          this.cameraTriggerActivation(parseInt(cameraNumber));
        }
        if (objectName.includes("doorTrigger")) {
          this.toggleInteractPrompt(true);
        }
      }
    }
  }
  animationTransitionState(newState) {
    const transitionDuration = 0.25;
    if (this.currentState !== newState) {
      const prevState = this.currentState;
      this.currentState = newState;
      let prevAnim;

      switch (prevState) {
        case "idle":
          prevAnim = this.playerIdleAnim;
          break;
        case "walking":
          prevAnim = this.playerWalkingAnim;
          break;
        case "running": {
          prevAnim = this.playerRunningAnim;
        }
      }
      switch (this.currentState) {
        case "idle":
          this.playerIdleAnim.time = this.animationTimeOnPause;
          this.playerIdleAnim.play();
          this.playerIdleAnim.setEffectiveTimeScale(1);
          prevAnim.crossFadeTo(this.playerIdleAnim, transitionDuration, true);
          break;

        case "walking":
          this.playerWalkingAnim.time = this.animationTimeOnPause;
          this.playerWalkingAnim.play();
          this.playerWalkingAnim.setEffectiveTimeScale(1);
          prevAnim.crossFadeTo(
            this.playerWalkingAnim,
            transitionDuration,
            true
          );
          break;

        case "running":
          this.playerRunningAnim.time = this.animationTimeOnPause;
          this.playerRunningAnim.play();
          this.playerRunningAnim.setEffectiveTimeScale(1);
          prevAnim.crossFadeTo(
            this.playerRunningAnim,
            transitionDuration,
            true
          );
          break;
      }
      switch (this.currentState) {
        case "idle":
          this.playerIdleAnim.enabled = true;
          break;
        case "walking":
          this.playerWalkingAnim.enabled = true;
          break;
        case "running":
          this.playerRunningAnim.enabled = true;
          break;
        default:
          this.playerIdleAnim.enabled = true;
          break;
      }
    }
  }
  onKeyDown(e) {
    const isShiftPressed = e.shiftKey;
    switch (e.key.toUpperCase()) {
      case "Z":
        this.moveForward = true;
        break;
      case "S":
        this.moveBackward = true;

        break;
      case "Q":
        this.rotateLeft = true;
        break;
      case "D":
        this.rotateRight = true;
        break;
    }
    if (this.moveForward && isShiftPressed) {
      this.isRunning = true;
    } else {
      this.isRunning = false;
    }
    this.playerMovementState();
  }

  onKeyUp(e) {
    const isShiftUp = e.shiftKey;
    switch (e.key.toUpperCase()) {
      case "Z":
        this.moveForward = false;
        break;
      case "S":
        this.moveBackward = false;
        this.checkDoubleBackwardPress();
        break;
      case "Q":
        this.rotateLeft = false;
        break;
      case "D":
        this.rotateRight = false;
        break;
    }
    if (this.moveForward && isShiftUp) {
      this.isRunning = true;
    } else {
      this.isRunning = false;
    }
    this.playerMovementState();
  }

  checkDoubleBackwardPress() {
    const currentTime = performance.now();
    const timeSinceLastPress = currentTime - this.lastBackwardKeyPressTime;

    if (timeSinceLastPress < 200 && !this.isTheGamePaused) {
      this.triggerQuickTurn();
    }

    this.lastBackwardKeyPressTime = currentTime;
  }

  triggerQuickTurn() {
    const targetRotation = this.model.rotation.y + Math.PI;
    let quickTurnProgress = 0;
    const quickTurnSpeed = 0.02;

    const updateQuickTurn = () => {
      quickTurnProgress += quickTurnSpeed;
      this.model.rotation.y = THREE.MathUtils.lerp(
        this.model.rotation.y,
        targetRotation,
        quickTurnProgress
      );

      if (quickTurnProgress < 0.5) {
        requestAnimationFrame(updateQuickTurn);
      }
    };

    updateQuickTurn();
  }

  playerMovementState() {
    if (
      this.moveForward ||
      this.moveBackward ||
      this.rotateLeft ||
      this.rotateRight
    ) {
      if (this.moveForward && this.isRunning) {
        this.animationTransitionState("running");
      } else {
        this.animationTransitionState("walking");
      }
    } else {
      this.animationTransitionState("idle");
    }
  }
  updateAnimations(clock) {
    const delta = clock.getDelta();
    if (this.mixer) {
      if (!this.isTheGamePaused) {
        this.mixer.update(delta);
      } else {
        this.animationTimeOnPause += delta;
      }
    }
  }
}
