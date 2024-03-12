export default class Inventory {
  constructor(game) {
    this.game = game;
    this.inventory = document.getElementById("inventory");
    this.isInventoryToggled = false;
    this.slots = [];
    this.maxCapacity = 6;
  }
  init() {
    document.removeEventListener("keyup", (event) => this.onKeyUp(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
  }
  display() {
    this.game.pause(true);
    this.inventory.style.display = "flex";
    this.isInventoryToggled = true;
    for (let i = 0; i < this.maxCapacity; i++) {
      if (this.slots[i]) {
        this.inventory.children[i].innerHTML = this.slots[i].name;
      }
    }
  }

  hide() {
    this.game.pause(false);
    this.inventory.style.display = "none";
    this.isInventoryToggled = false;
  }

  onKeyUp(event) {
    const eKeyToUpperCase = event.key.toUpperCase();
    if (eKeyToUpperCase === "E") {
      this.isInventoryToggled ? this.hide() : this.display();
    }
  }
}
