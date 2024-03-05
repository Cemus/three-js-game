import Scene from "./Scene";
import Inventory from "./Inventory";
import Interact from "./Interact";
import LabyrinthGenerator from "./LabyrinthGenerator";

export default class Game {
  constructor() {
    this.scene = null;
    this.playerSpawningZone = null;
    this.currentRoomIndex = 0;
    this.firstInitialisation = true;
    this.inventory = new Inventory(this);
    this.interact = new Interact(this);
    this.labyrinth = new LabyrinthGenerator();
    this.rooms = [];
  }

  async init() {
    if (this.firstInitialisation) {
      this.rooms = await this.labyrinth.init();
    }
    const potentialSpawningZones = Object.keys(
      this.rooms[this.currentRoomIndex].connectedDoors
    );
    this.playerSpawningZone = parseInt(potentialSpawningZones[0]);

    console.log("game p spawning zone:", this.playerSpawningZone);
    console.log("game rooms", this.rooms);
    this.scene = new Scene(
      this.rooms[this.currentRoomIndex].roomURL,
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
    if (this.firstInitialisation) {
      this.interact.init();
      this.inventory.init();
    }
    this.firstInitialisation = false;
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
