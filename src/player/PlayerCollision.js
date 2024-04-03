import * as THREE from "three";

export default class PlayerCollision {
  constructor(player) {
    this.player = player;
  }

  checkSolidCollisions(solidInstancesList) {
    for (const object of solidInstancesList) {
      if (object.userData.isSolid) {
        if (this.player.collider.intersectsBox(object.userData.collider)) {
          return true;
        }
      }
    }
    return false;
  }

  checkSolidCollisionsAtNextPosition(position, solidInstancesList) {
    const playerCollider = this.player.collider.clone();
    playerCollider.translate(position); // Déplacer le collider du joueur à la prochaine position

    const objectsCollidingList = [];
    for (const object of solidInstancesList) {
      if (object.userData.isSolid) {
        const objectCollider = object.userData.collider;
        if (playerCollider.intersectsBox(objectCollider)) {
          objectsCollidingList.push(object);
        }
      }
    }
    return objectsCollidingList;
  }

  checkSolidCollisionsAtNextPosition(position, solidInstancesList) {
    const playerBox = new THREE.Box3().copy(this.player.collider);
    const nextPlayerPosition = this.player.model.position.clone().add(position);
    playerBox.translate(nextPlayerPosition.sub(this.player.model.position));
    const objectsCollidingList = [];
    for (const object of solidInstancesList) {
      if (object.userData.isSolid) {
        if (playerBox.intersectsBox(object.userData.collider)) {
          objectsCollidingList.push(object);
        }
      }
    }
    return objectsCollidingList;
  }

  getSolidCollisionNormals(position, objectsCollidingList) {
    const playerBox = new THREE.Box3().copy(this.player.collider);
    const nextPlayerPosition = this.player.model.position.clone().add(position);
    playerBox.translate(nextPlayerPosition.sub(this.player.model.position));

    const intersections = [];
    console.log(objectsCollidingList);
    for (const object of objectsCollidingList) {
      console.log(object);
      const objectCollider = object.userData.collider;
      if (playerBox.intersectsBox(objectCollider)) {
        if (object.isMesh) {
          const objectNormal = this.getNormal(object);
          intersections.push(objectNormal);
        }
      }
    }
    return intersections;
  }

  getNormal(object) {
    console.log("object", object);
    const normalAttribute = object.geometry.attributes.normal;
    const objectNormal = new THREE.Vector3();
    for (let i = 0; i < normalAttribute.count; i++) {
      const normal = new THREE.Vector3(
        normalAttribute.getX(i),
        normalAttribute.getY(i),
        normalAttribute.getZ(i)
      );
      objectNormal.addScaledVector(normal, 1); // Ajouter la normale avec un facteur de 1
    }

    objectNormal.divideScalar(normalAttribute.count).normalize();

    const normalMatrix = new THREE.Matrix3().getNormalMatrix(
      object.matrixWorld
    );

    objectNormal.applyMatrix3(normalMatrix).normalize();
    console.log(objectNormal);
    return objectNormal;
  }

  checkTriggerCollisions(triggerList) {
    for (const key in triggerList) {
      if (Object.hasOwnProperty.call(triggerList, key)) {
        const triggerArray = triggerList[key];
        for (const object of triggerArray) {
          if (this.player.collider.intersectsBox(object.userData.collider)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  handleTriggerCollisions(triggerList) {
    if (!this.player.isAiming) {
      const cameraTriggers = triggerList.cameras;
      const doorTriggers = triggerList.doors;
      const itemTriggers = triggerList.items;
      const itemBoxTrigers = triggerList.itemBox;

      for (const object of cameraTriggers) {
        if (this.player.collider.intersectsBox(object.userData.collider)) {
          const objectName = object.name;
          const cameraNumber = parseInt(objectName.match(/\d+/)[0]);
          this.player.cameraTriggerActivation(parseInt(cameraNumber));
        }
      }
      for (const object of doorTriggers) {
        if (this.player.collider.intersectsBox(object.userData.collider)) {
          const objectName = object.name;
          this.player.toggleInteractPrompt(objectName);
        }
      }
      for (const object of itemTriggers) {
        if (this.player.collider.intersectsBox(object.userData.collider)) {
          const item = object.userData.item;
          if (item.pickedUp === false) {
            this.player.toggleInteractPrompt(item);
          }
        }
      }
      for (const object of itemBoxTrigers) {
        //Ajouter un trigger spécifique, pas la boîte en elle-même
        if (this.player.collider.intersectsBox(object.userData.collider)) {
          this.player.toggleInteractPrompt("itemBox");
        }
      }
    }
  }
}
