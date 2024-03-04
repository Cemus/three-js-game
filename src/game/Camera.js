import * as THREE from "three";

export default class Camera {
  constructor(scene) {
    this.scene = scene;
    this.cameraList = [];
    this.currentCamera = null;
  }
  async init() {
    const tempCameraList = [];
    this.scene.level.traverse((node) => {
      if (node.name.includes("camera") && node.name.includes("Orientation")) {
        const cameraNumber = parseInt(node.name.match(/\d+/)[0]);
        const cameraObject = node.name.includes("static")
          ? { camera: node, mode: "static" }
          : { camera: node, mode: "dynamic" };
        cameraObject.camera.aspect = window.innerWidth / window.innerHeight;
        tempCameraList.push({ ...cameraObject, number: cameraNumber });
      }
    });
    tempCameraList.sort((a, b) => a.number - b.number);
    this.cameraList = tempCameraList.map((entry) => ({
      camera: entry.camera,
      mode: entry.mode,
    }));
    this.currentCamera = this.cameraList[0];
  }

  handleCameraModes() {
    this.currentCamera.mode == "static" ? this.static() : this.dynamic();
  }

  static() {
    this.currentCamera.camera.updateProjectionMatrix();
  }

  dynamic() {
    const playerPosition = this.scene.player.model.position.clone();
    const cameraOffset = new THREE.Vector3(0, 3, 0);
    const cameraTarget = playerPosition.add(cameraOffset);
    this.currentCamera.camera.lookAt(cameraTarget);
    this.currentCamera.camera.updateProjectionMatrix();
  }

  update(cameraActivated) {
    if (this.currentCamera !== this.cameraList[cameraActivated]) {
      this.currentCamera = this.cameraList[cameraActivated];
      this.currentCamera.camera.updateProjectionMatrix();
      this.scene.composer.passes[0].camera = this.currentCamera.camera;
      this.scene.composer.passes[0].setSize(
        window.innerWidth,
        window.innerHeight
      );
    }
  }
}
