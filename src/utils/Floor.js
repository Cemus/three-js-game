import * as THREE from "three";

export default class Floor {
  constructor() {
    this.folderUrl = "../../assets/floor/";
  }

  getFloor() {
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load(
      `${this.folderUrl}Wood_Floor_012_basecolor.jpg`
    );

    //Roughness
    const roughnessMap = textureLoader.load(
      `${this.folderUrl}Wood_Floor_012_roughness.jpg`
    );

    //Normal
    const normalMap = textureLoader.load(
      `${this.folderUrl}Wood_Floor_012_normal.jpg`
    );

    //AO
    const aoMap = textureLoader.load(
      `${this.folderUrl}Wood_Floor_012_ambientOcclusion.jpg`
    );

    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(128, 128);

    roughnessMap.wrapS = THREE.RepeatWrapping;
    roughnessMap.wrapT = THREE.RepeatWrapping;
    roughnessMap.repeat.set(128, 128);

    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(128, 128);

    aoMap.wrapS = THREE.RepeatWrapping;
    aoMap.wrapT = THREE.RepeatWrapping;
    aoMap.repeat.set(128, 128);

    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: map,
      roughnessMap: roughnessMap,
      normalMap: normalMap,
      aoMap: aoMap,
    });

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.receiveShadow = true;
    planeMesh.castShadow = true;

    return planeMesh;
  }
}
