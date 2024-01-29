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
    if (inventory.style.display === "none") {
      inventory.style.display = "block";
      console.log("block");
      this.scene.pause = true;
    } else {
      inventory.style.display = "none";
      this.scene.pause = false;
      console.log("none");
    }
  }
}

const game = new Game();

game.init();
