import * as THREE from "three";

export default class PlayerCollision {
  constructor(player) {
    this.player = player;
  }

  checkWallCollisions(solidInstancesList) {
    for (const object of solidInstancesList) {
      if (object.userData.isSolid) {
        if (this.player.collider.intersectsBox(object.userData.collider)) {
          return true;
        }
      }
    }
    return false;
  }

  handleWallCollisions(solidInstancesList) {
    const pushDistance = 0.1;
    const originalY = this.player.model.position.y;
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

    let newPosition = this.player.model.position.clone();
    const collisionBox = new THREE.Box3().setFromObject(this.player.model);

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
        this.player.model.position.copy(newPosition);
        this.player.model.position.y = originalY;
        return;
      }

      // Reset
      newPosition.sub(offset);
      collisionBox.translate(offset.negate());
    }
  }

  checkTriggerCollisions(triggerList) {
    for (const object of triggerList) {
      if (this.player.collider.intersectsBox(object.userData.collider)) {
        return true;
      }
    }
    return false;
  }

  handleTriggerCollisions(triggerList) {
    for (const object of triggerList) {
      if (this.player.collider.intersectsBox(object.userData.collider)) {
        const objectName = object.name;
        if (objectName.includes("cameraTrigger")) {
          const cameraNumber = objectName.substring("cameraTrigger".length);
          this.player.cameraTriggerActivation(parseInt(cameraNumber));
        }
        if (objectName.includes("doorTrigger")) {
          this.player.toggleInteractPrompt(true);
        }
      }
    }
  }
}
