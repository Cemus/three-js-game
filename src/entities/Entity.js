import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

export default class Entities {
  constructor() {}

  async loadModel(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          resolve(model);
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + "% chargé");
        },
        (error) => {
          console.error("Erreur de chargement du modèle GLTF:", error);
          reject(error);
        }
      );
    });
  }
  async loadAnimation(url) {
    return new Promise((resolve, reject) => {
      const animationLoader = new GLTFLoader();
      animationLoader.load(url, (anim) => {
        const animations = anim.animations;
        resolve(animations);
      });

      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% chargé");
      },
        (error) => {
          console.error("Erreur de chargement du modèle GLTF:", error);
          reject(error);
        };
    });
  }
}
