import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as Stats from "stats.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import Player from "../player/Player";
import Loader from "../entities/Loader";
import Camera from "./Camera";
import Light from "./Light";

export default class Scene {
  constructor(
    currentRoom,
    playerSpawningZoneNumber,
    setPlayerSpawningZone,
    toggleInteractPrompt
  ) {
    this.currentRoom = currentRoom;
    this.playerSpawningZoneNumber = playerSpawningZoneNumber;
    this.setPlayerSpawningZone = setPlayerSpawningZone;
    this.toggleInteractPrompt = toggleInteractPrompt;

    //Prompt

    this.scene = null;
    this.handleWindowResizeBinded = null;

    this.isTheGamePaused = false;
    this.changingScene = false;

    this.loader = new Loader();
    this.camera = new Camera(this);
    this.light = new Light(this);
    this.stats = new Stats();
    this.clock = new THREE.Clock();

    this.shadowHelper = null;

    this.renderer = null;
    this.composer = null;

    this.instanceList = [];
    this.player = null;
    this.level = null;

    this.solidInstanceList = [];
    this.triggerList = [];
    this.playerSpawningZoneList = [];

    //Framerate lock
    this.targetFrameRate = 60;
    this.frameDelay = 1000 / this.targetFrameRate;
    this.lastFrameTime = 0;
  }
  async init() {
    //Listeners

    this.handleWindowResizeBinded = this.handleWindowResize.bind(this);
    window.addEventListener("resize", this.handleWindowResizeBinded);

    //Panel framerate
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);

    //Scene
    this.scene = new THREE.Scene();
    this.scene.castShadow = true;
    this.scene.receiveShadow = true;

    //Level

    this.level = await this.loader.loadModel(this.currentRoom.roomURL);
    await this.setupInterractiveObjectsProperties();
    this.addToScene(this.level);

    //Character
    this.player = new Player(
      this.playerSpawningZoneList[this.playerSpawningZoneNumber],
      this.camera.update.bind(this.camera),
      this.toggleInteractPrompt
    );
    this.instanceList.push(this.player);
    await this.player.init().then(() => {
      this.addToScene(this.player.model);
    });

    //Render
    this.camera.init();
    this.light.init();
    this.setupRenderer();
  }

  animate() {
    if (!this.changingScene) {
      this.stats.begin();
      const currentTime = performance.now();
      const elapsedFrameTime = currentTime - this.lastFrameTime;
      if (elapsedFrameTime > this.frameDelay) {
        this.player.animation.update(this.clock);
        if (!this.isTheGamePaused) {
          this.player.update(this.solidInstanceList, this.triggerList);
          TWEEN.update();
          this.camera.handleCameraModes();
          this.composer.render(this.scene, this.camera.currentCamera.camera);
          this.lastFrameTime =
            currentTime - (elapsedFrameTime % this.frameDelay);
        }
      }
      requestAnimationFrame(this.animate.bind(this));
      this.stats.end();
    }
  }

  addToScene(object) {
    this.scene.add(object);
  }

  async setupInterractiveObjectsProperties() {
    const tempTriggerList = [];
    const tempPlayerSpawningZoneList = [];

    this.level.traverse(async (node) => {
      //Spawn
      if (node.name.startsWith("playerSpawningZone")) {
        const playerSpawningZoneNumber = node.name.slice("_")[1];
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
        const triggerNumber = node.name.split("_")[1];
        node.userData.collider = new THREE.Box3().setFromObject(node);
        tempTriggerList.push({ node, number: triggerNumber });
      }
      //Item generation
      if (node.name.includes("itemSlot")) {
        const slotNumber = node.name.split("_")[1];
        node.userData.collider = new THREE.Box3().setFromObject(node);
        node.visible = false;
        const currentRoomSlot = this.currentRoom.itemSlots[slotNumber];
        if (currentRoomSlot !== null) {
          const item = await this.loader.loadModel(
            `../../assets/rooms/${currentRoomSlot}.gltf`
          );

          this.scene.add(item);
          const spawnPosition = node.position.clone();
          const spawnRotation = node.rotation.clone();
          item.rotation.copy(spawnRotation);
          item.position.copy(spawnPosition);
        }
      }
    });

    tempPlayerSpawningZoneList.sort((a, b) => a.number - b.number);
    tempTriggerList.sort((a, b) => a.number - b.number);

    this.playerSpawningZoneList.push(
      ...tempPlayerSpawningZoneList.map((entry) => entry.node)
    );
    this.triggerList.push(...tempTriggerList.map((entry) => entry.node));
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    //Post processing

    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(
      this.scene,
      this.camera.currentCamera.camera
    );
    this.composer.addPass(renderPass);
  }

  handleWindowResize() {
    this.camera.cameraList.forEach((cameraObject) => {
      cameraObject.camera.aspect = window.innerWidth / window.innerHeight;
      cameraObject.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  async destroy() {
    this.changingScene = true;
    //Dom
    window.removeEventListener("resize", this.handleWindowResizeBinded);
    document.body.removeChild(this.stats.dom);
    //Remove objects
    this.player.destroy();
    this.light = null;
    this.camera = null;
    this.stats = null;
    this.clock = null;
    this.loader = null;
    this.player = null;
    this.level.traverse((node) => {
      node.remove();
    });
    this.scene.traverse((node) => {
      node.remove();
    });
    const canvas = this.renderer.domElement;

    canvas.parentNode.removeChild(canvas);
    this.scene = null;
  }
}
