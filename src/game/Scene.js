import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import * as Stats from "stats.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import Floor from "../utils/Floor";
import Player from "../entities/Player";

export default class Scene {
  constructor() {
    this.scene = null;

    this.isTheGamePaused = false;

    this.camera = null;
    this.cameraOffset = new THREE.Vector3(0, 3, 0);
    this.shadowHelper = null;

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

    //Objects
    this.createFloor();
    this.player = new Player();
    console.log(this.player);

    //Cube test
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;

    cube.position.set(2, 2, 1);
    this.scene.add(cube);
    console.log(cube);

    this.instanceList.push(this.player);
    await this.player.loadGameAssets().then(() => {
      this.scene.add(this.player.model);
    });

    //Render
    this.setupCamera();
    this.setupLights();
    this.setupRenderer();
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
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    //Post processing

    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);

    console.log(renderPass);
    const bloomPass = new UnrealBloomPass();
    console.log(bloomPass);
    bloomPass.resolution.x = 2048;
    bloomPass.resolution.y = 2048;
    bloomPass.strength = 1;
    bloomPass.radius = 0.5;
    bloomPass.threshold = 0.1;

    this.composer.addPass(bloomPass);
    this.composer.addPass(renderPass);

    console.log(this.composer);
  }

  createFloor() {
    const floor = new Floor();
    console.log(floor.getFloor());
    this.scene.add(floor.getFloor());
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

    this.scene.add(directionalLight);
    const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    this.scene.add(shadowHelper);
    console.log(this.scene);
  }

  handleWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
