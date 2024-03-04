export default class Interact {
  constructor(game) {
    this.game = game;

    this.hasInteracted = false;
    this.isInteractPromptToggled = false;
    this.isInspectionMessageToggled = false;
    this.interactMessage = document.getElementById("interactMessage");
    this.inspectionMessage = document.getElementById("inspectionMessage");
  }

  init() {
    document.removeEventListener("keyup", this.hidePromptOnKeyPress.bind(this));
    document.addEventListener("keyup", this.hidePromptOnKeyPress.bind(this));
  }

  contextualAction(interactiveObjectName) {
    if (interactiveObjectName.includes("doorTrigger")) {
      const objectFromName = interactiveObjectName.split("_")[1];
      console.log(objectFromName);
      if (objectFromName !== "jammed") {
        this.changeLevelListener(objectFromName);
      } else {
        this.inspectListener(objectFromName);
      }
    }
  }

  changeLevelListener(level) {
    document.removeEventListener("keyup", (event) =>
      this.changeLevel(event, `../../assets/rooms/${level}.gltf`).bind(this)
    );
    document.addEventListener("keyup", (event) =>
      this.changeLevel(event, `../../assets/rooms/${level}.gltf`).bind(this)
    );
  }
  inspectListener(objectFromName) {
    document.removeEventListener("keyup", (event) =>
      this.inspect(event, objectFromName)
    );
    document.addEventListener("keyup", (event) =>
      this.inspect(event, objectFromName)
    );
  }

  inspect(event, object) {
    if (
      event.code == "Space" &&
      !this.hasInteracted &&
      !this.isInspectionMessageToggled
    ) {
      this.game.pause(true);
      this.hasInteracted = true;
      this.isInspectionMessageToggled = true;
      this.inspectionMessage.style.display = "block";
      switch (object) {
        case "jammed":
          this.inspectionMessage.innerHTML = "It's jammed";
          break;
        default:
      }
    } else if (
      event.code == "Space" &&
      this.isInspectionMessageToggled &&
      this.hasInteracted
    ) {
      this.game.pause(false);
      this.hasInteracted = false;
      this.isInspectionMessageToggled = false;
      this.inspectionMessage.style.display = "none";
    }
  }

  async changeLevel(event, nextLevelURL) {
    console.log(nextLevelURL);
    if (event.code == "Space" && !this.hasInteracted) {
      this.isInteractPromptToggled = false;
      this.hasInteracted = true;
      this.game.currentRoomURL = nextLevelURL;
      await this.game.scene.destroy();
      this.game.scene = null;
      this.game.init();
    }
  }

  displayInteractPrompt(interactiveObjectName) {
    this.isInteractPromptToggled = true;
    if (this.isInteractPromptToggled) {
      this.interactMessage.style.display = "block";
      this.contextualAction(interactiveObjectName);
    }
  }
  hidePromptOnKeyPress() {
    this.interactMessage.style.display = "none";
  }
}
