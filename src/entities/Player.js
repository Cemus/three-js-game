import * as THREE from "three";
import Entities from "./Entity";

export default class Player extends Entities {
  constructor() {
    super();
    this.assetsFolder = "../../assets/models/player/";
    this.assetsModelName = "lastPsych.gltf";
    this.mixer = null;
    this.model = null;
    this.playerWalkingAnim = null;
    this.playerIdleAnim = null;
    this.playerRunningAnim = null;

    this.isRunning = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.rotateLeft = false;
    this.rotateRight = false;

    this.currentState = "idle";

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  async loadGameAssets() {
    try {
      this.model = await this.loadModel(
        `${this.assetsFolder}${this.assetsModelName}`
      );
      this.setupPlayer();
      this.mixer = new THREE.AnimationMixer(this.model);

      const walkingAnim = await this.loadAnimation(
        `${this.assetsFolder}playerWalkingAnim.gltf`
      );
      const idleAnim = await this.loadAnimation(
        `${this.assetsFolder}playerIdleAnim.gltf`
      );
      const runningAnim = await this.loadAnimation(
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
    this.model.castShadow = true;
    this.model.receiveShadow = true;
    this.model.rotation.set(0, 0, 0);
    this.model.position.set(0, 0, 0);
    this.model.scale.set(0.2, 0.2, 0.2);
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

  updatePlayerPosition() {
    const rotationSpeed = 0.06;
    const normalSpeed = 4;
    const backwardSpeed = 2.5;
    const runningSpeed = 4.5;
    const multiplicateur = 0.01;

    if (this.moveForward) {
      const forwardDelta = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.model.rotation.y
      );
      this.model.position.add(
        forwardDelta.multiplyScalar(normalSpeed * multiplicateur)
      );
    }

    if (this.moveBackward) {
      const backwardDelta = new THREE.Vector3(0, 0, -1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.model.rotation.y
      );
      this.model.position.add(
        backwardDelta.multiplyScalar(backwardSpeed * multiplicateur)
      );
    }

    if (this.isRunning && this.moveForward) {
      const forwardDelta = new THREE.Vector3(0, 0, 1).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.model.rotation.y
      );
      this.model.position.add(
        forwardDelta.multiplyScalar(runningSpeed * multiplicateur)
      );
    }

    if (this.rotateLeft) {
      this.model.rotation.y += rotationSpeed;
    }

    if (this.rotateRight) {
      this.model.rotation.y -= rotationSpeed;
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
          this.playerIdleAnim.play();
          this.playerIdleAnim.setEffectiveTimeScale(1);
          prevAnim.crossFadeTo(this.playerIdleAnim, transitionDuration, true);
          break;

        case "walking":
          this.playerWalkingAnim.play();
          this.playerWalkingAnim.setEffectiveTimeScale(1);
          prevAnim.crossFadeTo(
            this.playerWalkingAnim,
            transitionDuration,
            true
          );
          break;

        case "running":
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
      this.mixer.update(delta);
    }
  }
}
