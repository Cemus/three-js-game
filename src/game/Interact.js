export default class Interact {
  constructor(game) {
    this.game = game;

    this.hasInteracted = false;
    this.isInteractPromptToggled = false;
    this.isChoicePromptToggled = false;

    this.interactMessageContainer = document.getElementById(
      "interactMessageContainer"
    );
    this.interactMessage = document.getElementById("interactMessage");
    this.choiceContainer = document.getElementById("choiceContainer");

    this.inspectedObject = null;
    this.inspectedItem = null;
    this.choiceOptions = [];
    this.selectedOption = 0;

    this.changeLevelListeners = [];
    this.inspectListeners = [];
    this.pickUpItemListeners = [];
    this.pickupItemChoiceListeners = [];

    this.doorInteractingWith = null;
  }

  init() {
    document.removeEventListener(
      "keydown",
      this.hidePromptOnKeyPress.bind(this)
    );
    document.addEventListener("keydown", this.hidePromptOnKeyPress.bind(this));
  }

  displayInteractPrompt(interactiveObjectName) {
    if (!this.isInteractPromptToggled) {
      this.showInteractPrompt();
      this.isInteractPromptToggled = true;
      this.interactMessage.innerHTML = "Interact";
      this.contextualAction(interactiveObjectName);
    }
  }

  contextualAction(interactiveObjectName) {
    this.isInteractPromptToggled = true;
    if (typeof interactiveObjectName === "object") {
      this.handleItems(interactiveObjectName);
    } else {
      if (interactiveObjectName.includes("doorTrigger")) {
        this.handleDoors(interactiveObjectName);
      }
    }
  }

  handleDoors(interactiveObjectName) {
    const objectFromName = interactiveObjectName.split("_")[1];
    const findCurrentRoomIndex = this.game.rooms.findIndex(
      (room) => room.roomIndex === this.game.currentRoomIndex
    );
    const currentRoom = this.game.rooms[findCurrentRoomIndex];
    const doorInfo = currentRoom.connectedDoors[objectFromName];
    if (doorInfo) {
      this.doorInteractingWith = doorInfo;
      this.changeLevelListener();
    } else {
      this.inspectedObject = "jammed";
      this.inspectListener();
    }
  }

  handleItems(interactiveObjectName) {
    this.inspectedItem = interactiveObjectName;
    this.pickUpItemListener();
  }

  changeLevelListener() {
    const listener = (event) => this.changeLevel(event);
    if (this.changeLevelListeners.length === 0) {
      document.addEventListener("keyup", listener);
      this.changeLevelListeners.push(listener);
    }
  }

  async changeLevel(event) {
    this.hideInteractPrompt();
    if (event.code == "Space" && !this.hasInteracted) {
      this.isInteractPromptToggled = false;
      this.hasInteracted = true;
      this.game.currentRoomIndex = this.doorInteractingWith.nextRoomIndex;
      this.game.playerSpawningZone = this.doorInteractingWith.nextDoor;
      await this.game.scene.destroy();
      this.game.scene = null;
      this.game.init();
    }
  }

  inspectListener() {
    const listener = (event) => this.inspect(event, this.inspectedObject);
    if (this.inspectListeners.length === 0) {
      document.addEventListener("keyup", listener);
      this.inspectListeners.push(listener);
    }
  }

  pickUpItemListener() {
    const listener = (event) => this.pickUpItem(event, this.inspectedObject);
    if (this.pickUpItemListeners.length === 0) {
      document.addEventListener("keyup", listener);
      this.pickUpItemListeners.push(listener);
    }
  }

  pickupItemChoiceListener() {
    const listener = (event) =>
      this.handlePickupItemChoice(event, this.inspectedObject);
    if (this.pickupItemChoiceListeners.length === 0) {
      document.addEventListener("keyup", listener);
      this.pickupItemChoiceListeners.push(listener);
    }
  }

  inspect(event) {
    this.hideInteractPrompt();
    if (event.code == "Space" && !this.hasInteracted) {
      this.showInteractPrompt();
      this.game.pause(true);
      this.hasInteracted = true;
      switch (this.inspectedObject) {
        case "jammed":
          this.interactMessage.innerHTML = "It's jammed";
          break;
        default:
      }
    } else if (event.code == "Space" && this.hasInteracted) {
      this.game.pause(false);
      this.hasInteracted = false;
      this.hideInteractPrompt();
    }
  }

  pickUpItem(event) {
    const inventory = this.game.inventory;
    this.hideInteractPrompt();
    if (event.code == "Space" && !this.hasInteracted) {
      this.showInteractPrompt();
      this.game.inventory.display();
      this.hasInteracted = true;
      this.isChoicePromptToggled = true;
      if (inventory.slots.length < inventory.maxCapacity) {
        switch (this.inspectedItem.name) {
          case "healSmall":
            this.interactMessage.innerHTML = `Take the <span class="green-text">health drink</span> ?`;
            break;
          case "key":
            this.interactMessage.innerHTML = `Take the <span class="green-text">common key</span> ?`;
            break;
          default:
        }

        this.choiceOptions = ["Yes", "No"];
        this.choiceContainer.innerHTML = `<p class="choice selected">${this.choiceOptions[0]}</p> <p class="choice">${this.choiceOptions[1]}</p>`;
        this.pickupItemChoiceListener();
      } else {
        this.interactMessage.innerHTML = `You have no room for another item.`;
        this.choiceOptions = ["Ok"];
        this.choiceContainer.innerHTML = `<p class="choice selected">${this.choiceOptions[0]}</p> `;
        this.pickupItemChoiceListener();
      }
    }
  }

  handlePickupItemChoice(event) {
    let exit = false;
    switch (event.key.toUpperCase()) {
      case "A":
      case "Q":
        if (this.selectedOption === 0) {
          this.selectedOption = this.choiceOptions.length - 1;
        } else {
          this.selectedOption -= 1;
        }

        break;
      case "D":
        if (this.selectedOption === this.choiceOptions.length - 1) {
          this.selectedOption === 0;
        } else {
          this.selectedOption += 1;
        }
        break;
      case "E":
        this.exitPickUpItem(false);
        exit = true;
        break;
    }
    if (!exit) {
      for (let i = 0; i < this.choiceContainer.children.length; i++) {
        this.choiceContainer.children[i].classList.remove("selected");
      }
      this.choiceContainer.children[this.selectedOption].classList.add(
        "selected"
      );
    }

    if (event.code === "Space") {
      switch (this.choiceOptions[this.selectedOption]) {
        case "Yes":
          this.exitPickUpItem(true);
          break;

        case "Ok":
        case "No":
          this.exitPickUpItem(false);
          break;
      }
    }
  }

  exitPickUpItem(pickItemUp) {
    if (pickItemUp) {
      if (this.game.inventory.slots !== this.game.inventory.maxCapacity) {
        //Add to inventory
        this.addItemToInventory();
        //Delete the item from the room
        this.deleteItemFromRoom();
      }
    }
    this.isChoicePromptToggled = false;
    this.hasInteracted = false;
    this.hideInteractPrompt();
    this.game.inventory.hide();
    this.selectedOption = 0;
  }

  clearListeners() {
    for (let i = 0; i < this.inspectListeners.length; i++) {
      document.removeEventListener("keyup", this.inspectListeners[i]);
    }
    for (let i = 0; i < this.changeLevelListeners.length; i++) {
      document.removeEventListener("keyup", this.changeLevelListeners[i]);
    }
    for (let i = 0; i < this.pickUpItemListeners.length; i++) {
      document.removeEventListener("keyup", this.pickUpItemListeners[i]);
    }
    for (let i = 0; i < this.pickupItemChoiceListeners.length; i++) {
      document.removeEventListener("keyup", this.pickupItemChoiceListeners[i]);
    }
    this.inspectListeners = [];
    this.changeLevelListeners = [];
    this.pickUpItemListeners = [];
    this.pickupItemChoiceListeners = [];
  }

  hidePromptOnKeyPress() {
    document.removeEventListener("keyup", this.hidePromptOnKeyPress);
    this.hideInteractPrompt();
    if (this.isInteractPromptToggled === false && !this.hasInteracted) {
      this.clearListeners();
    }
  }

  hideInteractPrompt() {
    if (!this.isChoicePromptToggled) {
      this.interactMessageContainer.style.display = "none";
      this.isInteractPromptToggled = false;
      this.choiceContainer.innerHTML = "";
    }
  }

  showInteractPrompt() {
    this.interactMessageContainer.style.display = "flex";
  }

  addItemToInventory() {
    this.game.inventory.slots.push(this.inspectedItem);
  }

  async deleteItemFromRoom() {
    this.game.removeItemFromRoom(this.inspectedItem);

    const nodeToDelete = await this.game.scene.findNodeByUUID(
      this.inspectedItem
    );

    if (nodeToDelete) {
      this.game.scene.removeFromSceneWithOptions(nodeToDelete, false);
    }
  }
}
