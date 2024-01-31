import Scene from "./Scene";

export default class Game {
  constructor() {
    this.scene = null;
  }
  async init() {
    this.scene = new Scene();
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
    console.log(inventory.classList[0]);
    if (inventory.classList[0] === "hidden") {
      inventory.classList.replace("hidden", "visible");
      this.pauseTheGame(true);
    } else {
      inventory.classList.replace("visible", "hidden");
      this.pauseTheGame(false);
    }
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
