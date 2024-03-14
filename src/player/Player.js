import * as THREE from "three";
import PlayerAnimation from "./PlayerAnimation";
import PlayerCollision from "./PlayerCollision";
import PlayerMovement from "./PlayerMovement";

export default class Player {
  constructor(
    playerSpawningZone,
    cameraTriggerActivation,
    toggleInteractPrompt
  ) {
    this.playerSpawningZone = playerSpawningZone;
    this.cameraTriggerActivation = cameraTriggerActivation;
    this.toggleInteractPrompt = toggleInteractPrompt;

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

    this.spawnRotation = null;

    this.collider = null;

    this.collision = new PlayerCollision(this);
    this.animation = new PlayerAnimation(this);
    this.movement = new PlayerMovement(this);
  }

  async init(loader) {
    await this.setupAssets(loader);
    this.setupModel();
    this.setupListeners();
  }

  async setupAssets(loader) {
    try {
      this.model = await loader.loadModel(
        `${this.assetsFolder}${this.assetsModelName}`
      );

      this.mixer = new THREE.AnimationMixer(this.model);

      const walkingAnim = await loader.loadAnimation(
        `${this.assetsFolder}playerWalkingAnim.gltf`
      );
      const idleAnim = await loader.loadAnimation(
        `${this.assetsFolder}playerIdleAnim.gltf`
      );
      const runningAnim = await loader.loadAnimation(
        `${this.assetsFolder}playerRunningAnim.gltf`
      );

      await this.animation.setupAnimations(walkingAnim, idleAnim, runningAnim);
      this.model.userData.mixer = this.mixer;
    } catch (error) {
      console.error("Erreur de chargement du modèle:", error);
    }
  }

  setupListeners() {
    document.addEventListener("keydown", this.movement.onKeyDown);
    document.addEventListener("keyup", this.movement.onKeyUp);
  }

  removeListeners() {
    document.removeEventListener("keydown", this.movement.onKeyDown);
    document.removeEventListener("keyup", this.movement.onKeyUp);
  }

  setupModel() {
    this.model.traverse((node) => {
      node.castShadow = true;
      node.receiveShadow = true;
    });
    const spawnPosition = this.playerSpawningZone.position.clone();
    const spawnRotation = this.playerSpawningZone.rotation.clone();

    this.model.rotation.copy(spawnRotation);
    this.model.position.copy(spawnPosition);

    this.spawnRotation = this.model.rotation.y;
    console.log(this.spawnRotation);
    this.model.scale.set(0.2, 0.2, 0.2);
    console.log(this.model);
    this.collider = this.updateCollider();
  }

  updateCollider() {
    return new THREE.Box3().setFromObject(this.model);
  }

  update(solidInstancesList, triggerList) {
    this.collider = this.updateCollider();

    if (this.collision.checkWallCollisions(solidInstancesList)) {
      this.collision.handleWallCollisions(solidInstancesList);
    }
    if (this.collision.checkTriggerCollisions(triggerList)) {
      this.collision.handleTriggerCollisions(triggerList);
    }
    this.movement.update();
  }

  resetPlayerStateDuringPause() {
    this.removeListeners();
    this.moveBackward = false;
    this.moveForward = false;
    this.rotateLeft = false;
    this.rotateRight = false;
    this.isRunning = false;
    this.animation.toIdlePose();
  }

  resumePlayerStateAfterPause() {
    this.setupListeners();
  }

  destroy() {
    document.removeEventListener("keydown", this.movement.onKeyDown);
    document.removeEventListener("keyup", this.movement.onKeyUp);
  }
}
