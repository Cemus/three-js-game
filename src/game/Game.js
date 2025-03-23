import Scene from "./Scene";
import Inventory from "./Inventory";
import Interact from "./Interact";
import LabyrinthGenerator from "./LabyrinthGenerator";
import ItemBox from "./ItemBox";
import LoadingScreen from "./LoadingScreen";

export default class Game {
  constructor() {
    this.loading = new LoadingScreen();
    this.scene = null;
    this.inventory = null;
    this.playerSpawningZone = null;
    this.currentRoomIndex = 0;
    this.firstInitialisation = true;

    this.labyrinth = new LabyrinthGenerator();
    this.itemBox = new ItemBox(this);
    this.inventory = new Inventory(this);

    this.interact = new Interact(this);
    this.rooms = [];
  }

  findRoomFromIndex() {
    return this.rooms.findIndex((room) => room.index === this.currentRoomIndex);
  }

  async init() {
    this.loading.setMessage("Loading level...");
    if (this.firstInitialisation) {
      document.addEventListener("keydown", this.preventBrowserShortcuts);
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
    this.loading.setMessage("Loading assets...");

    await this.scene.init().then(() => {
      this.loading.setMessage("Loading successfull");
      this.loading.displayLoadingScreen(false);

      this.startGame();
    });
  }
  startGame() {
    this.loading.setMessage("Assets loaded...");

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
    this.scene.player.resetPlayerStateDuringPause();
    const rendererElement = this.scene.rendererElement;
    rendererElement.style.filter = `blur(2px)`;
    this.scene.isTheGamePaused = pause;

    this.scene.instanceList.forEach((instance) => {
      instance.isTheGamePaused = pause;
    });
    if (!pause) {
      rendererElement.style.filter = "none";
      this.scene.player.resumePlayerStateAfterPause();
    }
  }

  removeItemFromRoom(item) {
    const currentRoom = this.rooms[this.findRoomFromIndex()];
    for (let i = 0; i < currentRoom.itemSlots.length; i++) {
      if (currentRoom.itemSlots[i]) {
        if (currentRoom.itemSlots[i].index === item.index) {
          currentRoom.itemSlots[i] = null;
          break;
        }
      }
    }
  }
  preventBrowserShortcuts(event) {
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === "d" ||
        event.key === "w" ||
        event.key === "z" ||
        event.key === " " ||
        event.key === "s")
    ) {
      event.preventDefault();
    }
  }
}

const game = new Game();

game.init();
