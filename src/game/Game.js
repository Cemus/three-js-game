import Scene from "./Scene";

export default class Game {
  constructor() {
    this.scene = null;
    this.playerSpawningZone = 0;
  }
  async init() {
    this.scene = new Scene(this.playerSpawningZone, this.setPlayerSpawningZone);
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
