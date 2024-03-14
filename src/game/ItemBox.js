export default class ItemBox {
  constructor(inventory) {
    this.inventory = inventory;
    this.items = [];
    this.itemBoxElement = document.getElementById("itemBox");
  }

  display() {
    this.inventory.canSelectItem = true;
    this.inventory.display();
    this.itemBoxElement.style.display = "flex";
  }
  hide() {
    this.inventory.hide();
    this.itemBoxElement.style.display = "none";
  }
}
