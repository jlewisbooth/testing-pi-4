import Scene from "../components/scene";
import type { ControlsDispatcher } from "../../util/controls-dispatcher";
import * as THREE from "three";
import CameraController from "./camera-controller";
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
      maxDistance: 165,
      minDistance: 20,
      maxPolarAngle: Math.PI / 2 - Math.PI / 32,
      minPolarAngle: -Math.PI / 2,
      // autoRotate: true,
    });

    let camera = this.scene.getCamera();
    let controls = this.scene.getControls();

    if (camera && controls) {
      this.cameraController = new CameraController({
        camera: camera,
        controls: controls,
      });
    }
  }

  async initiateLocations() {
    this.locationManager = new LocationManager();

    let loadingResponse = await this.locationManager.loadModels(
      this.controlsDispatcher
    );

    if (this.scene) {
      this.locationManager.addModelsToScene(this.scene);
      this.locationManager.setUpDispatchers(this.controlsDispatcher);

      let locations = this.locationManager.getManagers();
      if (
        Array.isArray(locations) &&
        locations.length > 0 &&
        this.cameraController
      ) {
        for (let location of locations) {
          this.cameraController.addLocation(location);

          let bloomEffect = this.scene.getBloomEffect();
          if (bloomEffect) {
            location.initBloomEffect(bloomEffect, this.scene);
          }
        }
      }
    }
  }

  setUpListeners() {
    this.controlsDispatcher.addEventListener(
      "change-location",
      (message: any) => {
        let locationId = message.locationId;

        if (locationId === "ub.model-uk.tower-bridge") {
          if (this.cameraController) {
            this.cameraController.jumpTo("ub.model-uk.tower-bridge", true);
          }
        }
        if (locationId === "ub.model-uk.uk-map") {
          if (this.cameraController) {
            this.cameraController.jumpTo("ub.model-uk.uk-map", false);
          }
        }
        if (locationId === "ub.model-uk.raglan-castle") {
          if (this.cameraController) {
            this.cameraController.jumpTo("ub.model-uk.raglan-castle", true);
          }
        }
        if (locationId === "ub.model-uk.leeds") {
          if (this.cameraController) {
            this.cameraController.jumpTo("ub.model-uk.leeds", true);
          }
        }
        if (locationId === "ub.model-uk.glasgow-station") {
          if (this.cameraController) {
            this.cameraController.jumpTo("ub.model-uk.glasgow-station", true);
          }
        }
        if (locationId === "ub.model-uk.st-james") {
          if (this.cameraController) {
            this.cameraController.jumpTo("ub.model-uk.st-james", true);
          }
        }
      }
    );
  }

  cameraController?: CameraController;
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

      if (this.cameraController) {
        this.cameraController.update(timestamp);
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
