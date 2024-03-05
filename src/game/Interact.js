export default class Interact {
  constructor(game) {
    this.game = game;

    this.hasInteracted = false;
    this.isInteractPromptToggled = false;
    this.interactMessage = document.getElementById("interactMessage");
    this.inspectionMessage = document.getElementById("inspectionMessage");

    this.nextLevelURL = null;
    this.inspectedObject = null;

    this.changeLevelListeners = [];
    this.inspectListeners = [];
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
      this.isInteractPromptToggled = true;
      this.interactMessage.style.display = "block";
      this.contextualAction(interactiveObjectName);
    }
  }

  contextualAction(interactiveObjectName) {
    this.isInteractPromptToggled = true;
    if (interactiveObjectName.includes("doorTrigger")) {
      const objectFromName = interactiveObjectName.split("_")[1];
      if (objectFromName !== "jammed") {
        this.nextLevelURL = `../../assets/rooms/${objectFromName}.gltf`;
        this.changeLevelListener();
      } else {
        this.inspectedObject = objectFromName;
        this.inspectListener();
      }
    }
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
      this.game.currentRoomURL = this.nextLevelURL;
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

  inspect(event) {
    this.hideInteractPrompt();
    if (event.code == "Space" && !this.hasInteracted) {
      this.game.pause(true);
      this.hasInteracted = true;
      this.inspectionMessage.style.display = "block";
      switch (this.inspectedObject) {
        case "jammed":
          this.inspectionMessage.innerHTML = "It's jammed";
          break;
        default:
      }
    } else if (event.code == "Space" && this.hasInteracted) {
      this.game.pause(false);
      this.hasInteracted = false;
      this.inspectionMessage.style.display = "none";
    }
  }

  clearListeners() {
    for (let i = 0; i < this.inspectListeners.length; i++) {
      document.removeEventListener("keyup", this.inspectListeners[i]);
    }
    for (let i = 0; i < this.changeLevelListeners.length; i++) {
      document.removeEventListener("keyup", this.changeLevelListeners[i]);
    }
    this.inspectListeners = [];
    this.changeLevelListeners = [];
  }

  hidePromptOnKeyPress() {
    document.removeEventListener("keyup", this.hidePromptOnKeyPress);
    this.hideInteractPrompt();
    if (this.isInteractPromptToggled === false && !this.hasInteracted) {
      this.clearListeners();
    }
  }

  hideInteractPrompt() {
    this.interactMessage.style.display = "none";
    this.isInteractPromptToggled = false;
  }
}
