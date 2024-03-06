import * as THREE from "three";

export default class Light {
  constructor(scene) {
    this.scene = scene;
  }
  init() {
    const directionalLight = new THREE.DirectionalLight("white", 0.3);
    directionalLight.castShadow = true;
    directionalLight.position.x += 50;
    directionalLight.position.y += 50;
    directionalLight.position.z += 150;
    //Evite l'effet "télé cathodique"
    directionalLight.shadow.bias = -0.0001;
    //N'affiche pas les ombres lointaines
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500.0;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);

    /*     this.scene.add(shadowHelper); */
    this.scene.addToScene(directionalLight);
    this.scene.level.traverse((node) => {
      if (node.name.includes("light")) {
        const pointLight = new THREE.PointLight("white", 1, 500, 1);
        pointLight.castShadow = true;
        pointLight.position.x = node.position.x;
        pointLight.position.y = node.position.y;
        pointLight.position.z = node.position.z;
        //Evite l'effet "télé cathodique"
        pointLight.shadow.bias = -0.0001;
        //N'affiche pas les ombres lointaines
        pointLight.shadow.camera.near = 0.1;
        pointLight.shadow.camera.far = 500.0;
        pointLight.shadow.mapSize.width = 2048;
        pointLight.shadow.mapSize.height = 2048;

        const shadowHelper = new THREE.CameraHelper(pointLight.shadow.camera);
        /*         this.scene.add(shadowHelper); */
        this.scene.addToScene(pointLight);
      }
    });
  }
}
