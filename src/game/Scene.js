import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as Stats from "stats.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import Player from "../player/Player";
import Loader from "../entities/Loader";

export default class Scene {
  constructor(
    playerSpawningZoneNumber,
    setPlayerSpawningZone,
    toggleInteractPrompt
  ) {
    this.playerSpawningZoneNumber = playerSpawningZoneNumber;
    this.setPlayerSpawningZone = setPlayerSpawningZone;
    this.toggleInteractPrompt = toggleInteractPrompt;

    //Prompt

    this.scene = null;

    this.isTheGamePaused = false;

    this.cameraList = [];
    this.currentCamera = null;
    this.cameraOffset = new THREE.Vector3(0, 3, 0);
    this.shadowHelper = null;

    this.renderer = null;
    this.composer = null;

    this.instanceList = [];
    this.player = null;
    this.level = null;

    this.solidInstanceList = [];
    this.triggerList = [];
    this.playerSpawningZoneList = [];

    this.clock = new THREE.Clock();

    this.stats = new Stats();

    //Framerate lock
    this.targetFrameRate = 60;
    this.frameDelay = 1000 / this.targetFrameRate;
    this.lastFrameTime = 0;
  }
  async init() {
    //Listeners
    window.addEventListener("resize", this.handleWindowResize.bind(this));

    //Panel framerate
    this.stats.showPanel(0);

    //Scene
    document.body.appendChild(this.stats.dom);
    this.scene = new THREE.Scene();
    this.scene.castShadow = true;
    this.scene.receiveShadow = true;

    this.scene.background = new THREE.Color("black");

    //Whole level
    let loader = new Loader();
    this.level = await loader.loadModel("../../assets/rooms/entranceRoom.gltf");
    await this.setupInterractiveObjectsProperties();

    this.scene.add(this.level);
    console.log("level ajouté");

    this.player = new Player(
      this.playerSpawningZoneList[this.playerSpawningZoneNumber],
      this.cameraTriggerActivation.bind(this),
      this.toggleInteractPrompt
    );
    this.instanceList.push(this.player);
    await this.player.init().then(() => {
      this.scene.add(this.player.model);
    });

    //Libérer le loader
    loader = null;
    console.log("personnage ajouté");
    //Render
    this.setupCamera();
    console.log("camera ok");
    this.setupLights();
    console.log("lumière ok");
    this.setupRenderer();
    console.log("renderer ok");
  }

  animate() {
    this.stats.begin();
    const currentTime = performance.now();
    const elapsedFrameTime = currentTime - this.lastFrameTime;
    if (elapsedFrameTime > this.frameDelay) {
      this.player.animation.update(this.clock);
      if (!this.isTheGamePaused) {
        this.player.update(this.solidInstanceList, this.triggerList);
        TWEEN.update();
        this.handleCameras();
        this.composer.render(this.scene, this.currentCamera.camera);
        this.lastFrameTime = currentTime - (elapsedFrameTime % this.frameDelay);
      }
    }
    requestAnimationFrame(this.animate.bind(this));
    this.stats.end();
  }
  async setupInterractiveObjectsProperties() {
    const tempTriggerList = [];
    const tempPlayerSpawningZoneList = [];

    this.level.traverse((node) => {
      //Spawn
      if (node.name.startsWith("playerSpawningZone")) {
        const playerSpawningZoneNumber = parseInt(node.name.match(/\d+/)[0]);
        tempPlayerSpawningZoneList.push({
          node,
          number: playerSpawningZoneNumber,
        });
      }
      //Solid
      if (node.name.startsWith("solid_")) {
        node.userData.collider = new THREE.Box3().setFromObject(node);
        this.solidInstanceList.push(node);
      }
      //General Triggers
      if (node.name.includes("Trigger")) {
        node.userData.collider = new THREE.Box3().setFromObject(node);
        const triggerNumber = parseInt(node.name.match(/\d+/)[0]);
        tempTriggerList.push({ node, number: triggerNumber });
      }
    });

    tempPlayerSpawningZoneList.sort((a, b) => a.number - b.number);
    tempTriggerList.sort((a, b) => a.number - b.number);

    this.playerSpawningZoneList.push(
      ...tempPlayerSpawningZoneList.map((entry) => entry.node)
    );
    this.triggerList.push(...tempTriggerList.map((entry) => entry.node));

    console.log(this.playerSpawningZoneList);
  }

  async setupCamera() {
    const tempCameraList = [];
    this.level.traverse((node) => {
      if (node.name.includes("camera") && node.name.includes("Orientation")) {
        const cameraNumber = parseInt(node.name.match(/\d+/)[0]);
        console.log(cameraNumber);
        const cameraObject = node.name.includes("static")
          ? { camera: node, mode: "static" }
          : { camera: node, mode: "dynamic" };
        console.log(cameraObject);

        cameraObject.camera.aspect = window.innerWidth / window.innerHeight;
        tempCameraList.push({ ...cameraObject, number: cameraNumber });
      }
    });
    console.log(tempCameraList);
    tempCameraList.sort((a, b) => a.number - b.number);
    this.cameraList = tempCameraList.map((entry) => ({
      camera: entry.camera,
      mode: entry.mode,
    }));

    this.currentCamera = this.cameraList[0];
    console.log(this.cameraList);
  }

  handleCameras() {
    this.currentCamera.mode == "static"
      ? this.staticCamera()
      : this.dynamicCamera();
  }

  staticCamera() {
    this.currentCamera.camera.updateProjectionMatrix();
  }

  dynamicCamera() {
    const playerPosition = this.player.model.position.clone();
    const cameraTarget = playerPosition.add(this.cameraOffset);
    this.currentCamera.camera.lookAt(cameraTarget);
    this.currentCamera.camera.updateProjectionMatrix();
  }

  cameraTriggerActivation(cameraActivated) {
    if (this.currentCamera !== this.cameraList[cameraActivated]) {
      console.log(cameraActivated);
      this.currentCamera = this.cameraList[cameraActivated];
      this.currentCamera.camera.updateProjectionMatrix();
      this.composer.passes[0].camera = this.currentCamera.camera;
      this.composer.passes[0].setSize(window.innerWidth, window.innerHeight);
      console.log("current C", this.currentCamera);
      console.log("rotation C", this.currentCamera.camera.rotation);
      console.log("position C", this.currentCamera.camera.rotation);
    }
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    //Post processing

    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.currentCamera.camera);
    this.composer.addPass(renderPass);
  }

  setupLights() {
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
    this.scene.add(directionalLight);

    this.level.traverse((node) => {
      if (node.userData.name === "light") {
        console.log(node);
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
        console.log(pointLight);
        this.scene.add(pointLight);
      }
    });
  }

  handleWindowResize() {
    this.cameraList.forEach((cameraObject) => {
      cameraObject.camera.aspect = window.innerWidth / window.innerHeight;
      cameraObject.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    z;
  }
}
