import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

export default class Loader {
  constructor() {}

  async loadModel(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
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
              node.name.includes("Trigger")
            ) {
              node.visible = false;
            }
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
