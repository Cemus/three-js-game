import InventoryDomHandler from "./InventoryDomHandler";

export default class Inventory {
  constructor(game) {
    this.game = game;
    this.isInventoryToggled = false;
    this.slots = [];
    this.maxCapacity = 6;
    this.selectedSlot = 0;
    this.prevSelectedSlot = 0;
    this.selectedButton = 0;
    this.prevSelectedButton = 0;
    this.isInteractingWithItemBox = false;
    this.canSelectItem = false;

    this.itemEquipped = null;
    this.domHandler = new InventoryDomHandler(this);
  }
  init() {
    document.removeEventListener("keyup", (event) => this.onKeyUp(event));
    document.addEventListener("keyup", (event) => this.onKeyUp(event));
  }
  display(isInteractingWithItemBox) {
    if (isInteractingWithItemBox) {
      this.canSelectItem = true;
      this.game.itemBox.display();
      this.isInteractingWithItemBox = true;
    }
    this.game.pause(true);
    this.isInventoryToggled = true;
    this.domHandler.createInventory(false);
  }

  hide() {
    this.game.pause(false);
    this.resetSelection();
    this.game.itemBox.hide();
    this.isInventoryToggled = false;
    this.canSelectItem = false;
    this.domHandler.removeInventory(false);
    this.isInteractingWithItemBox = false;

    //weapon to the player
    this.game.scene.player.handleEquipment(this.itemEquipped);
  }

  resetSelection() {
    this.selectedSlot = 0;
    this.prevSelectedSlot = 0;
    this.selectedButton = 0;
    this.prevSelectedButton = 0;
  }

  resetInventory() {
    this.domHandler.removeInventory(false);
    this.domHandler.createInventory(false);
  }

  onKeyUp(event) {
    const keyToUpperCase = event.key.toUpperCase();
    switch (keyToUpperCase) {
      //Toggle
      case "E":
        if (this.isInventoryToggled) {
          this.hide();
        } else {
          this.display();
          this.canSelectItem = true;
          this.domHandler.updateSelectedSlot(false);
        }

        break;

      //Item selection
      case "D":
        if (this.canSelectItem) {
          this.selectedButton = 0;
          if (this.selectedSlot !== this.maxCapacity - 1) {
            this.prevSelectedSlot = this.selectedSlot;
            this.selectedSlot++;
          } else {
            this.prevSelectedSlot = this.selectedSlot;
            this.selectedSlot = 0;
          }
          this.domHandler.updateSelectedSlot(false);
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
            this.selectedSlot = this.maxCapacity - 1;
          }
          this.domHandler.updateSelectedSlot(false);
        }
        break;

      //Button selection
      case "S":
        if (this.canSelectItem && this.slots[this.selectedSlot]) {
          const slotButtonLength = this.domHandler.getSlotButtonLength(false);
          if (this.selectedButton !== slotButtonLength - 1) {
            this.prevSelectedButton = this.selectedButton;
            this.selectedButton++;
          } else {
            this.prevSelectedButton = this.selectedButton;
            this.selectedButton = 0;
          }
          this.domHandler.updateSelectedButton(false);
        }
        break;
      case "Z":
      case "W":
        if (this.canSelectItem && this.slots[this.selectedSlot]) {
          const slotButtonLength = this.domHandler.getSlotButtonLength(false);
          if (this.selectedButton !== 0) {
            this.prevSelectedButton = this.selectedButton;
            this.selectedButton--;
          } else {
            this.prevSelectedButton = this.selectedButton;
            this.selectedButton = slotButtonLength - 1;
          }
          this.domHandler.updateSelectedButton(false);
        }
        break;

      //Validation
      case " ":
        if (this.canSelectItem) {
          this.handleMenuSelection();
        }
        break;
    }
  }
  handleMenuSelection() {
    const item = this.slots[this.selectedSlot];
    const inventoryElement = document.getElementById("inventory");
    const selectedSlot = inventoryElement.children[this.selectedSlot];
    const inventorySelectedButton =
      selectedSlot.children[1].children[this.selectedButton];
    const inventorySelectedButtonText = inventorySelectedButton.textContent;

    switch (inventorySelectedButtonText) {
      case "Equip":
        this.equipItem(item);
        break;
      case "Unequip":
        this.equipItem(item);
        break;
      case "Use":
        this.useItem(item);
        break;
      case "Examine":
        this.examineItem(item);
        break;
      case "Store":
        this.storeItem(item);
        break;
      case "Exchange":
        this.exchangeItem();
        break;
    }
  }
  exchangeItem() {
    this.canSelectItem = false;
    this.game.itemBox.itemBoxActivation();
  }

  equipItem(item) {
    if (this.itemEquipped === null || this.itemEquipped.index !== item.index) {
      this.itemEquipped = item;
    } else if (this.itemEquipped.index === item.index) {
      this.itemEquipped = null;
    }

    this.domHandler.removeInventory(false);
    this.domHandler.createInventory(false);
  }

  useItem(item) {
    switch (item.name) {
      case "smallHeal":
        console.log("pv + 10");
        if (item.amount - 1 <= 0) {
          this.slots[this.selectedSlot] = null;
        } else {
          item.amount--;
        }
        break;
      case "key":
        console.log("can't use the key");
        break;
    }
    this.domHandler.removeInventory(false);
    this.domHandler.createInventory(false);
  }

  examineItem(item) {
    switch (item.name) {
      case "smallHeal":
        console.log("An healing item.");

        break;
      case "key":
        console.log("An ordinary key to open locked doors.");
        break;
    }
  }

  storeItem(item) {
    const itemBoxSlots = this.game.itemBox.slots;
    for (let i = 0; i < itemBoxSlots.length; i++) {
      const element = itemBoxSlots[i];
      if (!element) {
        this.game.itemBox.slots[i] = item;
        break;
      }
    }
    if (this.itemEquipped.index === item.index) {
      this.itemEquipped = null;
    }
    this.slots.splice(this.selectedSlot, 1);

    this.domHandler.removeInventory(false);
    this.domHandler.createInventory(false);
    this.game.itemBox.resetInventory();
  }
}
