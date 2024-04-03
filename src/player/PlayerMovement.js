import * as THREE from "three";

export default class PlayerMovement {
  constructor(player) {
    this.player = player;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.isQuickTurning = false;
  }
  update(solidInstancesList) {
    const currentPosition = this.player.model.position.clone();
    const speed = this.getSpeed();
    let intendedDelta = new THREE.Vector3();

    if (
      (this.player.moveForward || this.player.moveBackward) &&
      !this.player.isAiming &&
      !this.player.isShooting
    ) {
      if (this.player.moveForward) {
        intendedDelta = new THREE.Vector3(0, 0, 1);
      } else {
        intendedDelta = new THREE.Vector3(0, 0, -1);
      }
      intendedDelta.applyQuaternion(this.player.model.quaternion);
      const nextPosition = currentPosition
        .clone()
        .add(intendedDelta.multiplyScalar(speed));

      const objectsCollidingList =
        this.player.collision.checkSolidCollisionsAtNextPosition(
          intendedDelta,
          solidInstancesList
        );
      if (objectsCollidingList.length > 0) {
        this.handleTrajectoryCorrection(
          currentPosition,
          intendedDelta,
          objectsCollidingList
        );
      } else {
        console.log("good pos");
        this.player.model.position.copy(nextPosition);
      }
    }

    if (!this.player.isShooting) {
      this.player.model.rotateY(this.handleRotation());
    }
  }

  handleTrajectoryCorrection(
    currentPosition,
    intendedDelta,
    objectsCollidingList
  ) {
    let correctedDelta = intendedDelta.clone();
    let correctedPosition;
    for (const object of objectsCollidingList) {
      //Changer le moyen de distinguer les murs...
      correctedPosition = object.userData.name.includes("walls")
        ? this.handleWallTrajectoryCorrection(
            currentPosition,
            correctedDelta,
            objectsCollidingList
          )
        : currentPosition;
    }
    this.player.model.position.copy(correctedPosition);
    this.player.model.position.y = 0;
  }

  handleWallTrajectoryCorrection(
    currentPosition,
    intendedPosition,
    objectsCollidingList
  ) {
    const intersections = this.player.collision.getSolidCollisionNormals(
      intendedPosition,
      objectsCollidingList
    );

    let totalNormal = new THREE.Vector3();
    intersections.forEach((intersection) => {
      totalNormal.add(intersection);
    });
    //dp = dp - N * dot(dp,n)
    const dotProduct = intendedPosition.dot(totalNormal);
    const correction = totalNormal.clone().multiplyScalar(dotProduct);
    const correctedDelta = intendedPosition.clone().sub(correction);
    const correctedPosition = currentPosition.clone().add(correctedDelta);

    return correctedPosition;
  }

  handleRotation() {
    const rotationSpeed = 0.06;
    let rotationDirection = 0;
    if (this.player.rotateLeft) {
      rotationDirection += rotationSpeed;
    }
    if (this.player.rotateRight) {
      rotationDirection -= rotationSpeed;
    }
    return rotationDirection;
  }

  getSpeed() {
    const normalSpeed = 4;
    const backwardSpeed = 2.5;
    const runningSpeed = 7;
    const multiplicateur = 0.01;

    let speed = normalSpeed * multiplicateur;

    if (this.player.moveForward && this.player.isRunning) {
      speed = runningSpeed * multiplicateur;
    }
    if (this.player.moveBackward) {
      speed = backwardSpeed * multiplicateur;
    }
    return speed;
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
