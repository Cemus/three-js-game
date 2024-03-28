export default class InventoryDomHandler {
  constructor(parent) {
    this.parent = parent; //Inventory or ItemBox
    this.inventoryElement = document.getElementById("inventory");
    this.itemBoxElement = document.getElementById("itemBox");
  }

  createInventory(isItemBox) {
    const parentElement = isItemBox
      ? this.itemBoxElement
      : this.inventoryElement;

    let maxCapacity;
    if (isItemBox) {
      this.itemBoxElement.style.display = "flex";
      maxCapacity = this.parent.slots.length;
    } else {
      this.inventoryElement.style.display = "flex";
      maxCapacity = this.parent.maxCapacity;
    }

    for (let i = 0; i < maxCapacity; i++) {
      const slotContainerElement = this.createSlotContainer();
      const slotElement = this.createSlot();

      const itemNameElement = this.createItemNameElement(this.parent.slots[i]);

      slotElement.appendChild(itemNameElement);
      slotContainerElement.appendChild(slotElement);
      if (!isItemBox && this.parent.slots[i] && this.parent.itemEquipped) {
        if (this.parent.slots[i].index === this.parent.itemEquipped.index) {
          this.createEquippedSlot(slotElement);
        }
      }
      parentElement.appendChild(slotContainerElement);
    }
    this.updateSelectedSlot(isItemBox);
  }

  removeInventory(isItemBox) {
    const parentElement = isItemBox
      ? this.itemBoxElement
      : this.inventoryElement;
    while (parentElement.firstChild) {
      parentElement.removeChild(parentElement.firstChild);
    }

    parentElement.style.display = "none";
  }

  updateSelectedSlot(isItemBox) {
    const prevSelectedSlot = isItemBox
      ? this.itemBoxElement.children[this.parent.prevSelectedSlot]
      : this.inventoryElement.children[this.parent.prevSelectedSlot];
    const currentlySelectedSlot = isItemBox
      ? this.itemBoxElement.children[this.parent.selectedSlot]
      : this.inventoryElement.children[this.parent.selectedSlot];

    if (this.parent.canSelectItem) {
      prevSelectedSlot.children[0].classList.remove("selected-slot");
      currentlySelectedSlot.children[0].classList.add("selected-slot");
      this.removeSlotMenu(prevSelectedSlot);
      this.createSlotMenu(
        isItemBox,
        currentlySelectedSlot,
        this.parent.slots[this.parent.selectedSlot]
      );
      this.updateSelectedButton(isItemBox);
    }
  }
  updateSelectedButton(isItemBox) {
    const parentElement = isItemBox
      ? this.itemBoxElement
      : this.inventoryElement;
    const selectedSlot = parentElement.children[this.parent.selectedSlot];

    if (selectedSlot.children[1]) {
      const parentPrevButtonSelected =
        selectedSlot.children[1].children[this.parent.prevSelectedButton];
      const parentSelectedButton =
        selectedSlot.children[1].children[this.parent.selectedButton];

      if (this.parent.canSelectItem) {
        parentPrevButtonSelected.classList.remove("slot-button-selected");
        parentSelectedButton.classList.add("slot-button-selected");
      }
    }
  }
  createSlotContainer() {
    const slotContainerElement = document.createElement("div");
    slotContainerElement.classList.add("slot-container");
    return slotContainerElement;
  }

  createSlot() {
    const slotElement = document.createElement("div");
    slotElement.classList.add("slot");

    return slotElement;
  }

  createEquippedSlot(slotElement) {
    slotElement.classList.add("equipped-slot");
  }

  createItemNameElement(item) {
    const itemNameElement = document.createElement("p");
    itemNameElement.textContent = item ? item.name : "No item";
    return itemNameElement;
  }

  createSlotMenu(isItemBox, slotSelected, item) {
    if (item || this.parent.isInteractingWithItemBox) {
      const slotMenuContainerElement = document.createElement("div");
      slotMenuContainerElement.classList.add("slot-button-container");
      slotSelected.appendChild(slotMenuContainerElement);

      if (this.parent.isInteractingWithItemBox || isItemBox) {
        let storeOrTakeButton;
        if (isItemBox) {
          storeOrTakeButton = this.createInventoryMenuButton("take");
        }
        if (!isItemBox) {
          item
            ? (storeOrTakeButton = this.createInventoryMenuButton("store"))
            : (storeOrTakeButton = this.createInventoryMenuButton("exchange"));
        }
        slotMenuContainerElement.appendChild(storeOrTakeButton);
      } else {
        let equipButton;

        this.parent.itemEquipped &&
        item.index === this.parent.itemEquipped.index
          ? (equipButton = this.createInventoryMenuButton("unequip"))
          : (equipButton = this.createInventoryMenuButton("equip"));

        const useButton = this.createInventoryMenuButton("use");
        const examineButton = this.createInventoryMenuButton("examine");
        switch (item.name) {
          case "smallHeal":
          case "key":
            slotMenuContainerElement.appendChild(useButton);
            slotMenuContainerElement.appendChild(examineButton);
            break;

          case "9mmAmmo":
            slotMenuContainerElement.appendChild(examineButton);
            break;

          case "nambu14":
            slotMenuContainerElement.appendChild(equipButton);
            slotMenuContainerElement.appendChild(examineButton);
            break;
        }
      }
    }
  }

  createInventoryMenuButton(type) {
    const buttonTextElement = document.createElement("p");
    buttonTextElement.classList.add("slot-button-text");
    const buttonElement = document.createElement("button");
    buttonElement.classList.add("slot-button");
    switch (type) {
      case "equip":
        buttonTextElement.innerHTML = "Equip";
        break;
      case "unequip":
        buttonTextElement.innerHTML = "Unequip";
        break;
      case "use":
        buttonTextElement.innerHTML = "Use";
        break;
      case "examine":
        buttonTextElement.innerHTML = "Examine";
        break;
      case "store":
        buttonTextElement.innerHTML = "Store";
        break;
      case "take":
        buttonTextElement.innerHTML = "Take";
        break;
      case "exchange":
        buttonTextElement.innerHTML = "Exchange";
        break;
    }
    buttonElement.appendChild(buttonTextElement);
    return buttonElement;
  }

  removeSlotMenu(inventorySlot) {
    for (let i = 0; i < inventorySlot.children.length; i++) {
      const element = inventorySlot.children[i];
      if (element.className === "slot-button-container") {
        inventorySlot.removeChild(element);
      }
    }
  }

  getSlotButtonLength(isItemBox) {
    const parentElement = isItemBox
      ? this.itemBoxElement
      : this.inventoryElement;
    const selectedSlot = parentElement.children[this.parent.selectedSlot];
    if (selectedSlot.children[1]) {
      return selectedSlot.children[1].children.length;
    }
  }
}
