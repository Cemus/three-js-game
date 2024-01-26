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
  }
}

const game = new Game();

game.init();
