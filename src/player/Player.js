import * as THREE from "three";
import PlayerAnimation from "./PlayerAnimation";
import PlayerCollision from "./PlayerCollision";
import PlayerMovement from "./PlayerMovement";
import { getFromCache } from "../loader/cache";

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
    this.assetsModelName = "lastPsych";

    this.model = null;
    this.rightHand = null;

    this.mixer = null;
    this.playerWalkingAnim = null;
    this.playerIdleAnim = null;
    this.playerRunningAnim = null;
    this.animationTimeOnPause = 0;

    this.isAiming = false;
    this.isRunning = false;
    this.moveForward = false;
    this.moveBackward = false;
    this.rotateLeft = false;
    this.rotateRight = false;

    this.currentState = "idle";
    this.isTheGamePaused = false;

    this.itemEquipped = null;

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
      this.model = await loader.loadCharacter(
        this.assetsFolder,
        this.assetsModelName
      );

      this.mixer = new THREE.AnimationMixer(this.model);

      //Base
      const walkingAnim = await loader.loadAnimation(
        "player",
        "playerWalkingAnim"
      );
      const idleAnim = await loader.loadAnimation("player", "playerIdleAnim");
      const runningAnim = await loader.loadAnimation(
        "player",
        "playerRunningAnim"
      );

      //Gun
      const aimingAnim = await loader.loadAnimation(
        "player",
        "playerAimingAnim"
      );
      const shootingAnim = await loader.loadAnimation(
        "player",
        "playerShootingAnim"
      );

      await this.animation.setupAnimations(
        walkingAnim,
        idleAnim,
        runningAnim,
        aimingAnim,
        shootingAnim
      );
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
    this.model.scale.set(0.2, 0.2, 0.2);
    console.log("player", this.model);
    this.rightHand = this.findRightHand();

    this.collider = this.updateCollider();
    console.log(this.collider);
  }

  updateCollider() {
    const box = new THREE.Box3();
    const playerPosition = this.model.position;

    const playerSize = new THREE.Vector3(1, 7, 1);
    const halfPlayerSize = playerSize.clone().multiplyScalar(0.5);

    const min = playerPosition.clone().sub(halfPlayerSize);
    const max = playerPosition.clone().add(halfPlayerSize);

    box.min.copy(min);
    box.max.copy(max);

    return box;
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
    this.isAiming = false;
    this.isRunning = false;
    this.animation.toIdlePose();
  }

  resumePlayerStateAfterPause() {
    this.setupListeners();
  }

  handleEquipment(itemEquipped) {
    if (itemEquipped) {
      this.itemEquipped = itemEquipped;
      switch (itemEquipped.name) {
        case "nambu14":
          const itemModel = getFromCache("item", "item_nambu14");
          const itemCloned = itemModel.clone();
          const handPosition = this.rightHand.position.clone();
          const handRotation = this.rightHand.rotation.clone();
          itemCloned.position.copy(handPosition);
          itemCloned.rotation.copy(handRotation);
          itemCloned.position.set(10, 110, 0);
          itemCloned.position.y = 120;
          itemCloned.position.z = 10;
          itemCloned.rotation.set(1.3, 4.8, 6.2);
          itemCloned.scale.set(75, 75, 75);
          this.rightHand.add(itemCloned);
          console.log(this.rightHand);

          break;
      }
    } else {
      this.itemEquipped = null;
      const weaponInRightHand = this.rightHand.children[1];
      if (weaponInRightHand) {
        this.rightHand.remove(weaponInRightHand);
      }
      console.log(this.rightHand);
    }
  }

  findRightHand() {
    let rightHandNode = null;
    this.model.traverse((node) => {
      if (node.userData.name === "mixamorig:RightHand") {
        rightHandNode = node;
        return;
      }
    });
    return rightHandNode;
  }

  destroy() {
    document.removeEventListener("keydown", this.movement.onKeyDown);
    document.removeEventListener("keyup", this.movement.onKeyUp);
  }
}
