import Scene from "../components/scene";
import type { ControlsDispatcher } from "../../util/controls-dispatcher";
import * as THREE from "three";

import LocationManager from "../components/location-mangers";

export default class MainController {
  constructor({
    animationContainer,
    ctrlsContainer,
    controlsDispatcher,
  }: {
    animationContainer: HTMLDivElement;
    ctrlsContainer: HTMLDivElement;
    controlsDispatcher: ControlsDispatcher;
  }) {
    this.container = animationContainer;
    this.ctrlsContainer = ctrlsContainer;
    this.controlsDispatcher = controlsDispatcher;

    this.bgColor = 0xd3d3d3;
    THREE.Cache.enabled = true;

    // start building scene
    this.initiateScene();
    this.setUpListeners();

    // load models
    this.initiateLocations();

    // animate
    this.playAnimation();
  }

  container: HTMLDivElement;
  ctrlsContainer: HTMLDivElement;
  controlsDispatcher: ControlsDispatcher;
  scene?: Scene;
  bgColor: string | number;
  updateAnimation: boolean = false;
  locationManager?: LocationManager;

  initiateScene() {
    this.scene = new Scene({
      container: this.container,
      backgroundColour: this.bgColor,
    });

    this.scene.addControl({
      controlsListener: this.ctrlsContainer,
      enablePan: true,
      enableZoom: true,
      maxDistance: 500,
      minDistance: 40,
      // maxPolarAngle: Math.PI / 2 - Math.PI / 32,
      // minPolarAngle: -Math.PI / 2,
    });
  }

  async initiateLocations() {
    this.locationManager = new LocationManager();

    let loadingResponse = await this.locationManager.loadModels(
      this.controlsDispatcher
    );

    if (this.scene) {
      this.locationManager.addModelsToScene(this.scene);
    }
  }

  setUpListeners() {}

  animateCallback?: (timestamp?: number) => void;
  animationId?: number;

  playAnimation() {
    this.animateCallback = (timestamp?: number) => {
      //animate renderers
      this.scene?.render({ timestamp: timestamp || 0, render: true });

      this.updateAnimation = false;

      if (this.locationManager) {
        this.locationManager.animate(timestamp);
      }

      if (this.animateCallback) {
        this.animationId = requestAnimationFrame(this.animateCallback);
      }
    };

    this.updateAnimation = true;
    this.animateCallback();
  }

  destroy() {
    this.scene?.destroy();

    if (typeof this.animationId === "number") {
      cancelAnimationFrame(this.animationId);
    }
  }
}
