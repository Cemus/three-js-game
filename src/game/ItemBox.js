import InventoryDomHandler from "./InventoryDomHandler";
//TODO
export default class ItemBox {
  constructor(game) {
    this.game = game;
    this.slots = [null, null, null, null, null, null];

    this.domHandler = new InventoryDomHandler(this);

    this.selectedSlot = 0;
    this.prevSelectedSlot = 0;
    this.selectedButton = 0;
    this.prevSelectedButton = 0;

    this.canSelectItem = false;

    this.listenersList = [];
  }
  setupEventListeners() {
    const listener = (event) => this.onKeyUp(event);
    this.listenersList.push(listener);
    document.addEventListener("keyup", this.listenersList[0]);
  }
  removeEventListeners() {
    document.removeEventListener("keyup", this.listenersList[0]);
    this.listenersList = [];
  }
  display() {
    this.createItemBox();
  }

  resetSelection() {
    this.selectedSlot = 0;
    this.prevSelectedSlot = 0;
    this.selectedButton = 0;
    this.prevSelectedButton = 0;
  }

  resetInventory() {
    this.domHandler.removeInventory(true);
    this.domHandler.createInventory(true);
  }

  createItemBox() {
    this.domHandler.createInventory(true);
  }

  hide() {
    this.domHandler.removeInventory(true);
    this.resetSelection();
    this.canSelectItem = false;
  }

  itemBoxActivation() {
    this.setupEventListeners();
    this.canSelectItem = true;
    this.domHandler.updateSelectedButton(true);
    this.domHandler.updateSelectedSlot(true);
  }

  onKeyUp(event) {
    const keyToUpperCase = event.key.toUpperCase();
    switch (keyToUpperCase) {
      //Item selection
      case "D":
        if (this.canSelectItem) {
          this.selectedButton = 0;
          if (this.selectedSlot !== this.slots.length - 1) {
            this.prevSelectedSlot = this.selectedSlot;
            this.selectedSlot++;
          } else {
            this.prevSelectedSlot = this.selectedSlot;
            this.selectedSlot = 0;
          }
          this.domHandler.updateSelectedSlot(true);
        }
        break;
      case "A":
      case "Q":
        if (this.canSelectItem) {
          this.selectedButton = 0;
          if (this.selectedSlot !== 0) {
            this.prevSelectedSlot = this.selectedSlot;
            this.selectedSlot--;
          } else {
            this.prevSelectedSlot = this.selectedSlot;
            this.selectedSlot = this.slots.length - 1;
          }
          this.domHandler.updateSelectedSlot(true);
        }
        break;

      //Button selection
      case "S":
        if (this.canSelectItem && this.slots[this.selectedSlot]) {
          const slotButtonLength = this.domHandler.getSlotButtonLength(true);
          console.log(slotButtonLength);
          if (this.selectedButton !== slotButtonLength - 1) {
            this.prevSelectedButton = this.selectedButton;
            this.selectedButton++;
          } else {
            this.prevSelectedButton = this.selectedButton;
            this.selectedButton = 0;
          }
          this.domHandler.updateSelectedButton(true);
        }
        break;
      case "Z":
      case "W":
        if (this.canSelectItem && this.slots[this.selectedSlot]) {
          const slotButtonLength = this.domHandler.getSlotButtonLength(true);
          if (this.selectedButton !== 0) {
            this.prevSelectedButton = this.selectedButton;
            this.selectedButton--;
          } else {
            this.prevSelectedButton = this.selectedButton;
            this.selectedButton = slotButtonLength - 1;
          }
          this.domHandler.updateSelectedButton(true);
        }
        break;

      //Validation
      case " ":
        if (this.canSelectItem) {
          console.log("exchange itembox");
          this.exchangeItem();
        }
        break;
    }
  }
  exchangeItem() {
    this.removeEventListeners();
    this.canSelectItem = false;
    const item = this.slots[this.selectedSlot];
    const inventory = this.game.inventory;

    inventory.slots[inventory.selectedSlot] = item;
    this.slots.splice(this.selectedSlot, 1, null);

    this.game.inventory.canSelectItem = true;
    this.resetSelection();
    this.resetInventory();
    this.game.inventory.resetSelection();
    this.game.inventory.resetInventory();
  }
}
