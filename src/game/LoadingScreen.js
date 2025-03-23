export default class LoadingScreen {
  message = "";
  loadingElement = document.getElementById("loading");
  messageElement = this.loadingElement.children[1];
  constructor() {}

  getMessage() {
    return this.message;
  }

  setMessage(newMessage) {
    this.message = newMessage;
    this.messageElement.textContent = this.message;
    return this.message;
  }

  displayLoadingScreen(isOn) {
    console.log(this.loadingElement);
    isOn
      ? (this.loadingElement.style.display = "flex")
      : (this.loadingElement.style.display = "none");
  }
}
