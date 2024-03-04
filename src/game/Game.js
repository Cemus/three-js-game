import Scene from "./Scene";
import Inventory from "./Inventory";
import Interact from "./Interact";

export default class Game {
  constructor() {
    this.scene = null;
    this.playerSpawningZone = 0;
    this.currentRoomURL = "../../assets/rooms/entranceRoom.gltf";
    this.inventory = new Inventory(this);
    this.interact = new Interact(this);
  }
  async init() {
    this.scene = new Scene(
      this.currentRoomURL,
      this.playerSpawningZone,
      this.setPlayerSpawningZone.bind(this),
      this.interact.displayInteractPrompt.bind(this.interact)
    );
    await this.scene.init();
    this.startGame();
  }
  startGame() {
    this.interact.hasInteracted = false;
    this.scene.animate();
    this.interact.init();
    this.inventory.init();
  }

  setPlayerSpawningZone(zone) {
    this.playerSpawningZone = zone;
  }

  pause(boolean) {
    this.scene.isTheGamePaused = boolean;
    this.scene.instanceList.forEach((instance) => {
      instance.isTheGamePaused = boolean;
    });
  }
}

const game = new Game();

game.init();
