import * as THREE from "three";
import Loader from "../entities/Loader";
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

    this.loader = new Loader();
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

    this.collider = null;

    this.collision = new PlayerCollision(this);
    this.animation = new PlayerAnimation(this);
    this.movement = new PlayerMovement(this);
  }

  async init() {
    await this.setupAssets();
    this.setupModel();
    this.setupListeners();
  }

  async setupAssets() {
    try {
      this.model = await this.loader.loadModel(
        `${this.assetsFolder}${this.assetsModelName}`
      );

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

      await this.animation.setupAnimations(walkingAnim, idleAnim, runningAnim);
      this.model.userData.mixer = this.mixer;
      this.loader = null;
    } catch (error) {
      console.error("Erreur de chargement du modèle:", error);
    }
  }

  setupListeners() {
    document.addEventListener("keydown", this.movement.onKeyDown);
    document.addEventListener("keyup", this.movement.onKeyUp);
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

    this.model.scale.set(0.2, 0.2, 0.2);
    this.collider = new THREE.Box3().setFromObject(this.model);
  }

  update(solidInstancesList, triggerList) {
    this.collider.setFromObject(this.model);

    if (this.collision.checkWallCollisions(solidInstancesList)) {
      this.collision.handleWallCollisions(solidInstancesList);
    }
    if (this.collision.checkTriggerCollisions(triggerList)) {
      this.collision.handleTriggerCollisions(triggerList);
    }
    this.movement.update();
  }
}
