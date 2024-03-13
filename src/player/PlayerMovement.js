import * as THREE from "three";

export default class PlayerMovement {
  constructor(player) {
    this.player = player;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }
  onKeyDown(e) {
    const isShiftPressed = e.shiftKey;
    switch (e.key.toUpperCase()) {
      case "Z":
      case "W":
        this.player.moveForward = true;
        break;
      case "S":
        this.player.moveBackward = true;
        break;
      case "Q":
      case "A":
        this.player.rotateLeft = true;
        break;
      case "D":
        this.player.rotateRight = true;
        break;
    }
    if (this.player.moveForward && isShiftPressed) {
      this.player.isRunning = true;
    } else {
      this.player.isRunning = false;
    }
    this.player.animation.stateTransitionTrigger();
  }

  onKeyUp(e) {
    const isShiftUp = e.shiftKey;
    switch (e.key.toUpperCase()) {
      case "Z":
      case "W":
        this.player.moveForward = false;
        break;
      case "S":
        this.player.moveBackward = false;
        this.checkDoubleBackwardPress();
        break;
      case "Q":
      case "A":
        this.player.rotateLeft = false;
        break;
      case "D":
        this.player.rotateRight = false;
        break;
    }
    if (this.player.moveForward && isShiftUp) {
      this.player.isRunning = true;
    } else {
      this.player.isRunning = false;
    }
    console.log("lancement du state transition");
    console.log("state : ", this.player.currentState);
    this.player.animation.stateTransitionTrigger();
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
    const targetRotation = this.player.model.rotation.y + Math.PI;
    let quickTurnProgress = 0;
    const quickTurnSpeed = 0.02;

    const updateQuickTurn = () => {
      quickTurnProgress += quickTurnSpeed;
      this.player.model.rotation.y = THREE.MathUtils.lerp(
        this.player.model.rotation.y,
        targetRotation,
        quickTurnProgress
      );

      if (quickTurnProgress < 0.5) {
        requestAnimationFrame(updateQuickTurn);
      }
    };

    updateQuickTurn();
  }

  update() {
    const rotationSpeed = 0.06;
    const normalSpeed = 4;
    const backwardSpeed = 2.5;
    const runningSpeed = 4.5;
    const multiplicateur = 0.01;

    if (this.player.moveForward) {
      const forwardDelta = new THREE.Vector3(0, 0, 1).applyQuaternion(
        this.player.model.quaternion
      );
      this.player.model.position.add(
        forwardDelta.multiplyScalar(normalSpeed * multiplicateur)
      );
    }

    if (this.player.moveBackward) {
      const backwardDelta = new THREE.Vector3(0, 0, -1).applyQuaternion(
        this.player.model.quaternion
      );
      this.player.model.position.add(
        backwardDelta.multiplyScalar(backwardSpeed * multiplicateur)
      );
    }

    if (this.player.isRunning && this.player.moveForward) {
      const forwardDelta = new THREE.Vector3(0, 0, 1).applyQuaternion(
        this.player.model.quaternion
      );
      this.player.model.position.add(
        forwardDelta.multiplyScalar(runningSpeed * multiplicateur)
      );
    }

    let rotationDirection = 0;
    if (this.player.rotateLeft) {
      rotationDirection += rotationSpeed;
    }
    if (this.player.rotateRight) {
      rotationDirection -= rotationSpeed;
    }
    this.player.model.rotateY(rotationDirection);
  }
}
