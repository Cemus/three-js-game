export default class PlayerAnimation {
  constructor(player) {
    this.player = player;
  }

  async setupAnimations(walkingAnim, idleAnim, runningAnim) {
    const animations = [...walkingAnim, ...idleAnim, ...runningAnim];
    if (animations && animations.length > 0) {
      this.player.playerWalkingAnim = this.player.mixer.clipAction(
        animations[0]
      );
      this.player.playerIdleAnim = this.player.mixer.clipAction(animations[1]);
      this.player.playerRunningAnim = this.player.mixer.clipAction(
        animations[2]
      );
      this.player.playerIdleAnim.play();
    }
  }

  update(clock) {
    const delta = clock.getDelta();
    if (this.player.mixer) {
      if (!this.player.isTheGamePaused) {
        this.player.mixer.update(delta);
      } else {
        this.player.animationTimeOnPause += delta;
      }
    }
  }

  stateTransitionTrigger() {
    if (
      this.player.moveForward ||
      this.player.moveBackward ||
      this.player.rotateLeft ||
      this.player.rotateRight
    ) {
      if (this.player.moveForward && this.player.isRunning) {
        this.handleStateTransition("running");
      } else {
        this.handleStateTransition("walking");
      }
    } else {
      this.handleStateTransition("idle");
    }
  }

  handleStateTransition(newState) {
    const transitionDuration = 0.25;
    if (this.player.currentState !== newState) {
      const prevState = this.player.currentState;
      this.player.currentState = newState;
      let prevAnim;

      switch (prevState) {
        case "idle":
          prevAnim = this.player.playerIdleAnim;
          break;
        case "walking":
          prevAnim = this.player.playerWalkingAnim;
          break;
        case "running": {
          prevAnim = this.player.playerRunningAnim;
        }
      }

      switch (this.player.currentState) {
        case "idle":
          this.player.playerIdleAnim.time = this.player.animationTimeOnPause;
          this.player.playerIdleAnim.play();
          this.player.playerIdleAnim.setEffectiveTimeScale(1);
          prevAnim.crossFadeTo(
            this.player.playerIdleAnim,
            transitionDuration,
            true
          );
          break;

        case "walking":
          this.player.playerWalkingAnim.time = this.player.animationTimeOnPause;
          this.player.playerWalkingAnim.play();
          this.player.playerWalkingAnim.setEffectiveTimeScale(1);
          prevAnim.crossFadeTo(
            this.player.playerWalkingAnim,
            transitionDuration,
            true
          );
          break;

        case "running":
          this.player.playerRunningAnim.time = this.player.animationTimeOnPause;
          this.player.playerRunningAnim.play();
          this.player.playerRunningAnim.setEffectiveTimeScale(1);
          prevAnim.crossFadeTo(
            this.player.playerRunningAnim,
            transitionDuration,
            true
          );
          break;
      }
      switch (this.player.currentState) {
        case "idle":
          this.player.playerIdleAnim.enabled = true;
          break;
        case "walking":
          this.player.playerWalkingAnim.enabled = true;
          break;
        case "running":
          this.player.playerRunningAnim.enabled = true;
          break;
        default:
          this.player.playerIdleAnim.enabled = true;
          break;
      }
    }
  }
}
