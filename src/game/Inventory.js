export default class Inventory {
  constructor(game) {
    this.game = game;
    this.inventoryElement = document.getElementById("inventory");
    this.isInventoryToggled = false;
    this.slots = [];
    this.maxCapacity = 6;
    this.selectedSlot = 0;
    this.prevSlot = 0;
    this.canSelectItem = false;
  }
  init() {
    document.removeEventListener("keyup", (event) => this.onKeyUp(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
  }
  display() {
    this.game.pause(true);
    this.inventoryElement.style.display = "flex";
    this.isInventoryToggled = true;
    for (let i = 0; i < this.maxCapacity; i++) {
      const item = this.inventoryElement.children[i];
      if (this.slots[i]) {
        item.innerHTML = this.slots[i].name;
      } else {
        item.innerHTML = "No item";
      }

      item.className = "slot";
    }
    this.updateSelectedSlot();
  }

  updateSelectedSlot() {
    if (this.canSelectItem) {
      this.inventoryElement.children[this.prevSlot].classList.remove(
        "selectedSlot"
      );
      this.inventoryElement.children[this.selectedSlot].classList.add(
        "selectedSlot"
      );
    }
  }

  hide() {
    this.game.pause(false);
    this.inventoryElement.style.display = "none";
    this.isInventoryToggled = false;
    this.selectedSlot = 0;
    this.prevSlot = 0;
    this.canSelectItem = false;
  }
  e;
  onKeyUp(event) {
    const keyToUpperCase = event.key.toUpperCase();
    switch (keyToUpperCase) {
      case "E":
        this.isInventoryToggled ? this.hide() : this.display();
        this.canSelectItem = true;
        break;
      case "D":
        if (this.canSelectItem) {
          if (this.selectedSlot !== this.maxCapacity - 1) {
            this.prevSlot = this.selectedSlot;
            this.selectedSlot++;
          } else {
            this.prevSlot = this.selectedSlot;
            this.selectedSlot = 0;
          }
        }
        break;
      case "A":
      case "Q":
        if (this.canSelectItem) {
          if (this.selectedSlot !== 0) {
            this.prevSlot = this.selectedSlot;
            this.selectedSlot--;
          } else {
            this.prevSlot = this.selectedSlot;
            this.selectedSlot = this.maxCapacity - 1;
          }
        }
        break;
    }
    this.updateSelectedSlot();
  }
}
