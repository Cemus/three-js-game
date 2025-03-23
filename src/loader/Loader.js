import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { getFromCache, addToCache } from "./cache";
import * as THREE from "three";

export default class Loader {
  constructor() {}

  async loadCharacter(folder, characterName) {
    const modelAlreadyExists = getFromCache("character", characterName);
    const url = `${folder}${characterName}.gltf`;
    return modelAlreadyExists
      ? modelAlreadyExists
      : new Promise((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load(
            url,
            async (gltf) => {
              let model = gltf.scene;
              await this.loadedModelOptimization(model);
              addToCache("character", characterName, model);
              resolve(model);
            },
            (xhr) => {
              console.log(`${url} ${(xhr.loaded / xhr.total) * 100} % chargé`);
            },
            (error) => {
              console.error("Erreur de chargement du modèle GLTF:", error);
              reject(error);
            }
          );
        });
  }

  async loadItem(itemModelName) {
    const modelAlreadyExists = getFromCache("item", itemModelName);
    const url = `../assets/models/items/${itemModelName}.gltf`;
    return modelAlreadyExists
      ? modelAlreadyExists
      : new Promise((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load(
            url,
            async (gltf) => {
              let model = gltf.scene;
              await this.loadedModelOptimization(model);
              model.children.forEach((child) => {
                addToCache("item", child.name, child);
              });
              resolve(model);
            },
            (xhr) => {
              console.log(`${url} ${(xhr.loaded / xhr.total) * 100} % chargé`);
            },
            (error) => {
              console.error("Erreur de chargement du modèle GLTF:", error);
              reject(error);
            }
          );
        });
  }

  async loadRoom(roomModelName) {
    const modelAlreadyExists = getFromCache("room", roomModelName);
    const url = `../assets/models/rooms/${roomModelName}.gltf`;
    return modelAlreadyExists
      ? modelAlreadyExists
      : new Promise((resolve, reject) => {
          const loader = new GLTFLoader();
          loader.load(
            url,
            async (gltf) => {
              let model = gltf.scene;
              await this.loadedModelOptimization(model);
              addToCache("room", roomModelName, model);
              resolve(model);
            },
            (xhr) => {
              console.log(`${url} ${(xhr.loaded / xhr.total) * 100} % chargé`);
            },
            (error) => {
              console.error("Erreur de chargement du modèle GLTF:", error);
              reject(error);
            }
          );
        });
  }

  async loadAnimation(parent, animationName) {
    const animationAlreadyExists = getFromCache("animation", animationName);
    const url = `../assets/animations/${parent}/${animationName}.gltf`;
    return animationAlreadyExists
      ? animationAlreadyExists
      : new Promise((resolve, reject) => {
          const animationLoader = new GLTFLoader();
          animationLoader.load(url, (anim) => {
            const animations = anim.animations;
            addToCache("animation", animationName, animations);
            resolve(animations);
          });

          (xhr) => {
            /*         console.log((xhr.loaded / xhr.total) * 100 + "% chargé"); */
          },
            (error) => {
              console.error("Erreur de chargement du modèle GLTF:", error);
              reject(error);
            };
        });
  }

  async loadedModelOptimization(model) {
    model.traverse((node) => {
      if (node.isMesh) {
        if (node.name.startsWith("solid_")) {
          node.userData.isSolid = true;
        } else {
          node.userData.isSolid = false;
        }
        node.castShadow = true;
        node.receiveShadow = true;
      }
      if (
        node.userData.name === "light" ||
        node.name.includes("camera") ||
        node.name.includes("Trigger") ||
        node.name.includes("itemSlot") ||
        node.name.includes("playerSpawningZone")
      ) {
        node.visible = false;
      }
    });
  }
}
