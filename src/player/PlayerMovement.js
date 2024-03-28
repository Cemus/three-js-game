import * as THREE from "three";

export default class PlayerMovement {
  constructor(player) {
    this.player = player;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.isQuickTurning = false;
  }

  update() {
    const rotationSpeed = 0.06;
    const normalSpeed = 4;
    const backwardSpeed = 2.5;
    const runningSpeed = 4.5;
    const multiplicateur = 0.01;

    if (!this.player.isAiming && !this.player.isShooting) {
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
    }

    if (!this.player.isShooting) {
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

  onKeyDown(e) {
    const isShiftDown = e.shiftKey;
    const isControlDown = e.ctrlKey;
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

    if (this.player.moveForward && isShiftDown) {
      this.player.isRunning = true;
    } else {
      this.player.isRunning = false;
    }
    if (this.player.moveBackward && isShiftDown) {
      this.triggerQuickTurn();
    }
    if (isControlDown) {
      this.player.isAiming = this.handleAiming(true);
    }

    this.player.animation.stateTransitionTrigger();
  }

  onKeyUp(e) {
    const isShiftDown = e.shiftKey;
    const isControlDown = e.ctrlKey;

    switch (e.key.toUpperCase()) {
      case "Z":
      case "W":
        this.player.moveForward = false;
        break;
      case "S":
        this.player.moveBackward = false;
        if (isShiftDown) {
          this.triggerQuickTurn();
        }
        break;
      case "Q":
      case "A":
        this.player.rotateLeft = false;
        break;
      case "D":
        this.player.rotateRight = false;
        break;
      case " ":
        if (this.player.isAiming && !this.player.isShooting) {
          this.player.isShooting = true;
        }

        break;
    }
    if (this.player.moveForward && isShiftDown) {
      this.player.isRunning = true;
    } else if (!isShiftDown) {
      this.player.isRunning = false;
    }
    if (!isControlDown) {
      this.player.isAiming = this.handleAiming(false);
    }
    this.player.animation.stateTransitionTrigger();
  }

  triggerQuickTurn() {
    if (!this.isQuickTurning) {
      this.isQuickTurning = true;
      const currentRotation = this.player.model.rotation.y;
      let targetRotation = currentRotation - Math.PI;
      this.player.model.rotation.y = targetRotation;
      setTimeout(() => {
        this.isQuickTurning = false;
      }, 1000);
    }
  }

  handleAiming(isAiming) {
    this.player.itemEquipped ? isAiming : (isAiming = false);
    return isAiming;
  }
}
