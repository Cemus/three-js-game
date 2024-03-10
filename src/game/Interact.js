export default class Interact {
  constructor(game) {
    this.game = game;

    this.hasInteracted = false;
    this.isInteractPromptToggled = false;

    this.interactMessageContainer = document.getElementById(
      "interactMessageContainer"
    );
    this.interactMessage = document.getElementById("interactMessage");
    this.choiceContainer = document.getElementById("choiceContainer");

    this.inspectedObject = null;

    this.changeLevelListeners = [];
    this.inspectListeners = [];
    this.takeItemListeners = [];

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
    console.log(interactiveObjectName);
    if (interactiveObjectName.includes("doorTrigger")) {
      this.handleDoors(interactiveObjectName);
    }

    if (interactiveObjectName.includes("item")) {
      this.handleItems(interactiveObjectName);
    }
  }

  handleDoors(interactiveObjectName) {
    console.log("test");
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
    const objectFromName = interactiveObjectName.split("_")[1];
    this.inspectedObject = objectFromName;
    this.takeItemListener();
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

  takeItemListener() {
    const listener = (event) => this.takeItem(event, this.inspectedObject);
    if (this.takeItemListeners.length === 0) {
      document.addEventListener("keyup", listener);
      this.takeItemListeners.push(listener);
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

  takeItem(event) {
    this.hideInteractPrompt();
    if (event.code == "Space" && !this.hasInteracted) {
      this.showInteractPrompt();
      this.game.pause(true);
      this.hasInteracted = true;
      console.log(this.inspectedObject);
      switch (this.inspectedObject) {
        case "healSmall":
          this.interactMessage.innerHTML = `Take the <span class="green-text">health drink</span> ?`;
          break;
        case "key":
          this.interactMessage.innerHTML = "Take the key ?";
          break;
        default:
      }
      this.choiceContainer.innerHTML = `<p class="choice selected">Yes</p> <p class="choice">No</p>`;
    } else if (event.code == "Space" && this.hasInteracted) {
      this.game.pause(false);
      this.hasInteracted = false;
      this.hideInteractPrompt();
    }
  }

  clearListeners() {
    for (let i = 0; i < this.inspectListeners.length; i++) {
      document.removeEventListener("keyup", this.inspectListeners[i]);
    }
    for (let i = 0; i < this.changeLevelListeners.length; i++) {
      document.removeEventListener("keyup", this.changeLevelListeners[i]);
    }
    for (let i = 0; i < this.takeItemListeners.length; i++) {
      document.removeEventListener("keyup", this.takeItemListeners[i]);
    }
    this.inspectListeners = [];
    this.changeLevelListeners = [];
    this.takeItemListeners = [];
  }

  hidePromptOnKeyPress() {
    document.removeEventListener("keyup", this.hidePromptOnKeyPress);
    this.hideInteractPrompt();
    if (this.isInteractPromptToggled === false && !this.hasInteracted) {
      this.clearListeners();
    }
  }

  hideInteractPrompt() {
    this.interactMessageContainer.style.display = "none";
    this.choiceContainer.style.display = "none";
    this.isInteractPromptToggled = false;
  }

  showInteractPrompt() {
    this.interactMessageContainer.style.display = "flex";
  }
}
