import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as Stats from "stats.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import Player from "../player/Player";
import Loader from "../loader/Loader";
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
    this.rendererElement = null;
    this.composer = null;

    this.instanceList = [];
    this.player = null;
    this.level = null;

    this.playerColliderHelper = null;

    this.solidInstanceList = [];
    this.triggerList = { cameras: [], doors: [], items: [], itemBox: [] };
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

    this.level = await this.loader.loadRoom(this.currentRoom.name);
    await this.setupInterractiveObjectsProperties();
    this.addToScene(this.level);

    //Character
    this.player = new Player(
      this.playerSpawningZoneList[this.playerSpawningZoneNumber],
      this.camera.update.bind(this.camera),
      this.toggleInteractPrompt
    );
    this.instanceList.push(this.player);

    await this.player.init(this.loader).then(() => {
      this.addToScene(this.player.model);
    });
    this.playerColliderHelper = new THREE.Box3Helper(
      this.player.collider,
      0xffff00
    );
    console.log(this.playerColliderHelper);
    this.addToScene(this.playerColliderHelper);

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
          this.playerColliderHelper.box.copy(this.player.collider);
          TWEEN.update();
          this.camera.handleCameraModes();
          this.lastFrameTime =
            currentTime - (elapsedFrameTime % this.frameDelay);
        }
        this.composer.render(this.scene, this.camera.currentCamera.camera);
      }
      requestAnimationFrame(this.animate.bind(this));
      this.stats.end();
    }
  }

  async addToScene(object) {
    this.scene.add(object);
  }

  async setupInterractiveObjectsProperties() {
    const tempCameraTriggerList = [];
    const tempPlayerSpawningZoneList = [];
    const tempDoorTriggerList = [];
    const tempItemBoxTriggerList = [];
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

      //Triggers
      //Camera triggers
      if (node.name.includes("cameraTrigger")) {
        const triggerNumber = node.name.split("_")[1];
        node.userData.collider = new THREE.Box3().setFromObject(node);
        tempCameraTriggerList.push({ node, number: triggerNumber });
      }
      //Door triggers
      if (node.name.includes("doorTrigger")) {
        const triggerNumber = node.name.split("_")[1];
        node.userData.collider = new THREE.Box3().setFromObject(node);
        tempDoorTriggerList.push({ node, number: triggerNumber });
      }
      //Test purpose
      if (node.name.includes("mainDoor")) {
        node.userData.collider = new THREE.Box3().setFromObject(node);
        tempDoorTriggerList.push({ node, number: -1 });
      }
      //Item box
      if (node.name.includes("itemBox")) {
        node.userData.collider = new THREE.Box3().setFromObject(node);
        tempDoorTriggerList.push({ node });
      }
      //Item generation
      if (node.name.includes("itemSlot")) {
        const slotNumber = node.name.split("_")[1];
        const itemsCollider = new THREE.Box3().setFromObject(node);
        const helper = new THREE.Box3Helper(itemsCollider, 0xffff00);

        this.addToScene(helper);
        const currentRoomSlotItem = this.currentRoom.itemSlots[slotNumber];
        if (currentRoomSlotItem !== null) {
          const item = await this.loader.loadItem(currentRoomSlotItem.name);
          item.traverse(async (itemsNode) => {
            if (itemsNode.name.includes("item")) {
              currentRoomSlotItem.uuid = itemsNode.uuid;
              const spawnPosition = node.position.clone();
              const spawnRotation = node.rotation.clone();
              itemsNode.userData.collider = itemsCollider;
              itemsNode.userData.uuid = itemsNode.uuid;
              itemsNode.userData.item = currentRoomSlotItem;
              itemsNode.rotation.copy(spawnRotation);
              itemsNode.position.copy(spawnPosition);
              this.triggerList.items.push(itemsNode);
              await this.addToScene(itemsNode);
            }
          });
        }
      }
    });

    tempPlayerSpawningZoneList.sort((a, b) => a.number - b.number);
    tempCameraTriggerList.sort((a, b) => a.number - b.number);
    tempDoorTriggerList.sort((a, b) => a.number - b.number);

    this.playerSpawningZoneList.push(
      ...tempPlayerSpawningZoneList.map((entry) => entry.node)
    );
    this.triggerList.cameras.push(
      ...tempCameraTriggerList.map((entry) => entry.node)
    );
    this.triggerList.doors.push(
      ...tempDoorTriggerList.map((entry) => entry.node)
    );
    this.triggerList.itemBox.push(
      ...tempItemBoxTriggerList.map((entry) => entry.node)
    );
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    const canvasDomElement = this.renderer.domElement;
    canvasDomElement.id = "renderer";
    this.rendererElement = canvasDomElement;
    document.body.appendChild(canvasDomElement);

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
    this.removeFromSceneWithOptions(null, true);
    const canvas = this.renderer.domElement;

    canvas.parentNode.removeChild(canvas);
    this.scene = null;
  }

  async findNodeByUUID(target) {
    for (let i = 0; i < this.scene.children.length; i++) {
      const child = this.scene.children[i];
      if (child.uuid === target.uuid) {
        return child;
      }
    }
    return null;
  }

  removeFromSceneWithOptions(object, removeAll) {
    for (let i = 0; i < this.scene.children.length; i++) {
      const child = this.scene.children[i];
      if (removeAll) {
        this.deleteNodeFromScene(child);
      } else {
        if (child === object) {
          this.deleteNodeFromScene(child);
        }
      }
    }
  }

  deleteNodeFromScene(node) {
    if (!(node instanceof THREE.Object3D)) return false;
    if (node.geometry) {
      node.geometry.dispose();
    }
    if (node.material) {
      if (node.material instanceof Array) {
        node.material.forEach((material) => material.dispose());
      } else {
        node.material.dispose();
      }
    }
    if (node.parent) {
      node.parent.remove(node);
    }
    return true;
  }
}
