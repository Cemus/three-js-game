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

  findRoomFromIndex() {
    return this.rooms.findIndex(
      (room) => room.roomIndex === this.currentRoomIndex
    );
  }

  async init() {
    if (this.firstInitialisation) {
      this.rooms = await this.labyrinth.init();
      const currentRoomDoorCount =
        this.rooms[this.findRoomFromIndex()].doorCount;
      this.playerSpawningZone = Math.floor(
        Math.random() * currentRoomDoorCount
      );
    }
    this.scene = new Scene(
      this.rooms[this.findRoomFromIndex()],
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

  pause(pause) {
    this.scene.isTheGamePaused = pause;
    this.scene.instanceList.forEach((instance) => {
      instance.isTheGamePaused = pause;
    });
    if (!pause) {
      this.scene.player.setupListeners();
    }
  }
}

const game = new Game();

game.init();
