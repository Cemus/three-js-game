import Scene from "./Scene";

export default class Game {
  constructor() {
    this.scene = null;
    this.playerSpawningZone = 0;

    //Inventory
    this.isInventoryToggled = false;

    //prompt
    this.isInteractPromptToggled = false;
  }
  async init() {
    this.scene = new Scene(
      this.playerSpawningZone,
      this.setPlayerSpawningZone.bind(this),
      this.toggleInteractPrompt.bind(this)
    );
    await this.scene.init();
    this.startGame();
  }
  startGame() {
    this.scene.animate();
    document.addEventListener("keyup", (event) => {
      const eKeyToUpperCase = event.key.toUpperCase();
      if (eKeyToUpperCase === "E") {
        this.toggleInventory();
      }
    });
  }

  toggleInventory() {
    const inventory = document.getElementById("inventory");
    this.isInventoryToggled = !this.isInventoryToggled;
    this.scene.isTheGamePaused = this.isInventoryToggled;
    this.isInventoryToggled
      ? (inventory.style.display = "block")
      : (inventory.style.display = "none");
  }

  toggleInteractPrompt(boolean) {
    this.isInteractPromptToggled = boolean;
    this.displayInteractPrompt();
  }

  displayInteractPrompt() {
    const interactMessage = document.getElementById("interactMessage");
    this.isInteractPromptToggled
      ? (interactMessage.style.display = "block")
      : (interactMessage.style.display = "none");
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
