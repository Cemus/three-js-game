import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as Stats from "stats.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import Floor from "../utils/Floor";
import Player from "../entities/Player";

export default class Scene {
  constructor() {
    this.scene = null;

    this.isTheGamePaused = false;

    this.camera = null;
    this.cameraOffset = new THREE.Vector3(0, 3, 0);

    this.renderer = null;
    this.composer = null;

    this.instanceList = [];
    this.player = null;

    this.clock = new THREE.Clock();

    this.stats = new Stats();

    //Framerate lock
    this.targetFrameRate = 60;
    this.frameDelay = 1000 / this.targetFrameRate;
    this.lastFrameTime = 0;
  }
  async init() {
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("black");

    this.setupCamera();
    this.setupLights();
    this.setupRenderer();

    this.createFloor();

    window.addEventListener("resize", this.handleWindowResize.bind(this));
    this.player = new Player();
    console.log(this.player);
    this.instanceList.push(this.player);
    await this.player.loadGameAssets().then(() => {
      this.scene.add(this.player.model);
    });
  }

  animate() {
    this.stats.begin();
    const currentTime = performance.now();
    const elapsedFrameTime = currentTime - this.lastFrameTime;

    if (elapsedFrameTime > this.frameDelay) {
      this.player.updateAnimations(this.clock);
      if (!this.isTheGamePaused) {
        this.player.updatePlayerPosition();
        TWEEN.update();
        this.composer.render();
        this.dynamicCamera();
        this.lastFrameTime = currentTime - (elapsedFrameTime % this.frameDelay);
      }
    }
    requestAnimationFrame(this.animate.bind(this));
    this.stats.end();
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 3, 5);
  }

  dynamicCamera() {
    const playerPosition = this.player.model.position.clone();
    const cameraTarget = playerPosition.add(this.cameraOffset);
    this.camera.lookAt(cameraTarget);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //Post processing
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass();
    bloomPass.strength = 1;
    bloomPass.radius = 1;
    bloomPass.threshold = 1.5;

    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
  }

  createFloor() {
    const floor = new Floor();
    this.scene.add(floor.getFloor());
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0x303030, 0.1);

    const spotLight = new THREE.SpotLight(0xffffff, 1, 10, Math.PI / 2, 0.5, 1);
    spotLight.position.set(1, 5, 2);
    spotLight.castShadow = true;

    const darkLight = new THREE.PointLight(0x000000, 0.1);
    darkLight.position.set(0, 2, 0);
    darkLight.castShadow = true;
    this.scene.add(spotLight);
    this.scene.add(ambientLight);
    this.scene.add(darkLight);
  }

  handleWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
