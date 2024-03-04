import Scene from "./Scene";

export default class Game {
  constructor() {
    this.scene = null;
    this.playerSpawningZone = 0;

    this.currentRoomURL = "../../assets/rooms/entranceRoom.gltf";

    //Inventory
    this.isInventoryToggled = false;

    this.hasInteracted = false;
    //prompt
    this.isInteractPromptToggled = false;
  }
  async init() {
    this.scene = new Scene(
      this.currentRoomURL,
      this.playerSpawningZone,
      this.setPlayerSpawningZone.bind(this),
      this.displayInteractPrompt.bind(this)
    );
    await this.scene.init();
    this.startGame();
  }
  startGame() {
    this.scene.animate();
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
  }

  toggleInventory() {
    const inventory = document.getElementById("inventory");
    this.isInventoryToggled = !this.isInventoryToggled;
    this.scene.isTheGamePaused = this.isInventoryToggled;
    this.isInventoryToggled
      ? (inventory.style.display = "block")
      : (inventory.style.display = "none");
  }

  onKeyUp(event) {
    const eKeyToUpperCase = event.key.toUpperCase();
    if (eKeyToUpperCase === "E") {
      this.toggleInventory();
    }
  }

  async changeLevel(event, nextLevel) {
    if (event.code == "Space" && !this.hasInteracted) {
      this.isInteractPromptToggled = false;
      this.hasInteracted = true;
      document.removeEventListener("keyup", (e) => this.onKeyUp(e));
      this.currentRoomURL = nextLevel;
      await this.scene.destroy();
      this.scene = null;
      this.init();
    }
  }

  contextualAction(interactiveObjectName) {
    const objectFromName = interactiveObjectName.split("_")[1];
    document.removeEventListener("keyup", this.changeLevelListener);
    this.changeLevelListener = (event) =>
      this.changeLevel(event, `../../assets/rooms/${objectFromName}.gltf`);
    document.addEventListener("keyup", this.changeLevelListener);
  }

  displayInteractPrompt(interactiveObjectName) {
    this.isInteractPromptToggled = true;
    const interactMessage = document.getElementById("interactMessage");
    console.log(interactiveObjectName);
    if (this.isInteractPromptToggled) {
      interactMessage.style.display = "block";
      this.contextualAction(interactiveObjectName);
      const hidePromptOnKeyPress = () => {
        this.isInteractPromptToggled = false;
        document.removeEventListener("keyup", hidePromptOnKeyPress);
        interactMessage.style.display = "none";
      };
      document.addEventListener("keyup", hidePromptOnKeyPress);
    }
  }

  setPlayerSpawningZone(zone) {
    this.playerSpawningZone = zone;
  }

  pauseTheGame(boolean) {
    this.scene.isTheGamePaused = boolean;
    this.scene.instanceList.forEach((instance) => {
      instance.isTheGamePaused = boolean;
    });
  }
}

const game = new Game();

game.init();
