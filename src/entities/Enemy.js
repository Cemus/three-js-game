import * as THREE from "three";
import Entities from "./Entity";

export default class Enemy extends Entities {
  constructor(enemy) {
    super();

    this.loadGameAssets();

    this.assetsFolder = "./models/enemies/";
    this.assetsModelName = this.enemyName;
    this.mixer = null;
    this.enemy = null;
    this.enemyWalkingAnim = null;
    this.enemyIdleAnim = null;
    this.enemyRunningAnim = null;

    this.currentState = "idle";
  }

  async loadGameAssets() {
    try {
      this.enemy = await this.loadModel(`${assetsFolder}${assetsModelName}`);

      this.setupEnemy();
      this.mixer = new THREE.AnimationMixer(this.enemy);

      const walkingAnim = await this.loadAnimation(
        `${assetsFolder}${this.assetsModelName}WalkingAnim.gltf`
      );
      const idleAnim = await this.loadAnimation(
        `${assetsFolder}${this.assetsModelName}IdleAnim.gltf`
      );
      const runningAnim = await this.loadAnimation(
        `${assetsFolder}${this.assetsModelName}RunningAnim.gltf`
      );

      this.setupAnimations(walkingAnim, idleAnim, runningAnim);
    } catch (error) {
      console.error("Erreur de chargement du modèle:", error);
    }
  }

  setupPlayer() {
    this.enemy.castShadow = true;
    this.enemy.receiveShadow = true;
    this.enemy.rotation.set(0, 0, 0);
    this.enemy.position.set(0, 0, 0);
    this.enemy.scale.set(0.2, 0.2, 0.2);
  }

  setupAnimations(walkingAnim, idleAnim, runningAnim) {
    const animations = [...walkingAnim, ...idleAnim, ...runningAnim];
    if (animations && animations.length > 0) {
      this.enemyWalkingAnim = this.mixer.clipAction(animations[0]);
      this.enemyIdleAnim = this.mixer.clipAction(animations[1]);
      this.enemyRunningAnim = this.mixer.clipAction(animations[2]);
      this.enemyIdleAnim.play();
    }
  }

  updatePlayerPosition() {}

  animationTransitionState(newState) {
    const transitionDuration = 0.25;

    if (this.currentState !== newState) {
      this.currentState = newState;

      this.enemyWalkingAnim.stop();
      this.enemyIdleAnim.stop();
      this.enemyRunningAnim.stop();

      switch (this.currentState) {
        case "idle":
          this.enemyIdleAnim.play();
          this.enemyIdleAnim.setEffectiveTimeScale(1);
          this.enemyWalkingAnim.crossFadeTo(
            this.enemyIdleAnim,
            transitionDuration,
            true
          );
          this.enemyIdleAnim.play();
          break;

        case "walking":
          this.enemyWalkingAnim.play();
          this.enemyWalkingAnim.setEffectiveTimeScale(1);
          this.enemyIdleAnim.crossFadeTo(
            this.enemyWalkingAnim,
            transitionDuration,
            true
          );
          break;

        case "running":
          this.enemyRunningAnim.play();
          this.enemyRunningAnim.setEffectiveTimeScale(1);
          this.enemyWalkingAnim.crossFadeTo(
            this.enemyRunningAnim,
            transitionDuration,
            true
          );
          break;
      }

      switch (this.currentState) {
        case "idle":
        case "walking":
          this.enemyWalkingAnim.play();
          this.enemyIdleAnim.play();
          break;
        case "running":
          this.enemyWalkingAnim.play();
          break;
      }
    }
  }
}
