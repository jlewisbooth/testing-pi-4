import * as THREE from "three";
import { Object3D, Mesh, Scene as ThreeScene, Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

// scene classes
import Camera from "./camera";
import Renderer from "./renderer";
import Lighting from "./lighting";
import RoomEnvironment from "./room-environment";

type ControlOpts = {
  autoRotate?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  maxDistance?: number;
  minDistance?: number;
  controlsListener?: HTMLDivElement;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  initTarget?: Vector3;
};

export default class Scene {
  constructor({
    container,
    width,
    height,
    backgroundColour,
  }: {
    container: HTMLDivElement;
    width?: number;
    height?: number;
    backgroundColour?: string | number;
  }) {
    this.container = container;
    this.backgroundColour = backgroundColour;

    this.stats = Stats();
    document.body.appendChild(this.stats.dom);

    this.scene = new ThreeScene();
    // this.scene.overrideMaterial = new THREE.MeshBasicMaterial();

    // this.scene.background = backgroundColour
    //   ? new THREE.Color(backgroundColour)
    //   : null;

    this.lighting = new Lighting({ scene: this.scene });

    if (width && height) {
      this.width = width;
      this.height = height;
    } else {
      this.width = this.container.getBoundingClientRect().width;
      this.height = this.container.getBoundingClientRect().height;
    }

    this.renderer = new Renderer({
      container,
      width: this.width,
      height: this.height,
    });

    this.renderer.addShadow();

    this.camera = new Camera({
      FOV: 45,
      width: this.width,
      height: this.height,
      near: 0.25,
      far: 10000,
    });

    // add room environment
    this.room = new RoomEnvironment({
      scene: this.scene,
    });

    this.scene.add(this.room);

    // this.toggleHelpers();

    window.addEventListener(
      "resize",
      () => {
        this.width = this.container.getBoundingClientRect().width;
        this.height = this.container.getBoundingClientRect().height;

        this.camera?.resize({
          width: this.width,
          height: this.height,
        });

        this.renderer?.setSize(this.width, this.height);
      },
      false
    );
  }

  container: HTMLDivElement;
  width: number;
  height: number;
  backgroundColour?: string | number;
  scene?: ThreeScene;
  room?: RoomEnvironment;
  camera?: Camera;
  perspectiveCameras: Camera[] = [];
  renderer?: Renderer;
  lighting?: Lighting;
  ctrls?: OrbitControls;
  ctrlsTarget?: Vector3;
  stats?: Stats;

  addToScene(model: Object3D | Mesh): boolean {
    if (model) {
      this.scene?.add(model);
    }

    return true;
  }

  removeFromScene(model: Object3D | Mesh): boolean {
    return true;
  }

  render({ timestamp, render }: { timestamp: number; render: boolean }) {
    if (render) {
      if (this.ctrls) {
        this.ctrls.update();
      }

      if (this.stats) {
        this.stats.update();
      }

      let width = this.camera?.width || this.width;
      let height = this.camera?.height || this.height;

      const left = this.camera?.left || 0;
      const top = this.camera?.top || 0;

      // The important functions are called here
      // Sets which area on canvas to fill and turn other areas transparent
      this.renderer?.cut(left, top, width, height);
      if (this.camera?.enabled && this.scene && this.camera.camera) {
        this.renderer?.render(this.scene, this.camera.camera);
      }

      this.perspectiveCameras.forEach((camera) => {
        if (camera) {
          let width = camera.width || this.width;
          let height = camera.height || this.height;

          const left = camera.left || 0;
          const top = camera.top || 0;

          // The important functions are called here
          // Sets which area on canvas to fill and turn other areas transparent
          this.renderer?.cut(left, top, width, height);
          if (camera.enabled && this.scene && camera.camera) {
            this.renderer?.render(this.scene, camera.camera);
          }
        }
      });
    }
  }

  addControl({
    autoRotate,
    enablePan,
    enableZoom,
    maxDistance,
    minDistance,
    controlsListener,
    minPolarAngle,
    maxPolarAngle,
    initTarget,
  }: ControlOpts) {
    // ======= Orbital controls for controlled circular orbit ======
    if (controlsListener) {
      let camera = this.camera?.getCameraObject();

      if (camera) {
        this.ctrls = new OrbitControls(camera, controlsListener);
      }
    }

    if (this.ctrls) {
      this.ctrls.enabled = true;
      this.ctrls.autoRotate = autoRotate || false;
      this.ctrls.enablePan = enablePan || false;
      this.ctrls.enableZoom = enableZoom || false;
      this.ctrls.maxDistance = maxDistance || 300;
      this.ctrls.minDistance = minDistance || 300;
      this.ctrls.minPolarAngle = minPolarAngle || 0;
      this.ctrls.maxPolarAngle = maxPolarAngle || Math.PI;

      if (initTarget?.isVector3) {
        this.ctrlsTarget = initTarget;
        this.ctrls.target = initTarget;
      }
    }
  }

  destroy() {
    this.ctrls?.dispose();
    this.ctrls = undefined;

    this.camera?.camera?.removeFromParent();
    this.camera?.destroy();
    this.camera = undefined;

    this.scene?.clear();
    this.scene = undefined;

    this.renderer?.renderer?.dispose();
    this.renderer?.destroy();
    this.renderer = undefined;

    this.lighting?.destroy();
    this.lighting = undefined;

    if (this.container) {
      let lastChildId = this.container.lastElementChild?.id;

      while (lastChildId !== "controls-listener") {
        if (this.container.lastChild) {
          this.container.removeChild(this.container.lastChild);
        }

        lastChildId = this.container.lastElementChild?.id;
      }
    }
  }

  axesHelper?: THREE.AxesHelper;
  planeGrid?: THREE.Mesh;
  boxShadow?: THREE.Mesh;

  toggleHelpers() {
    if (!this.axesHelper) {
      this.axesHelper = new THREE.AxesHelper(400);
      this.axesHelper.visible = false;
      this.scene?.add(this.axesHelper);
    }

    // if (!this.planeGrid && !this.boxShadow) {
    //   let planeGeo = new THREE.CircleBufferGeometry(1000, 50);
    //   let planeMat = new THREE.MeshStandardMaterial({
    //     color: 0x0000ff,
    //     side: THREE.DoubleSide,
    //   });

    //   this.planeGrid = new THREE.Mesh(planeGeo, planeMat);
    //   this.planeGrid.rotateX(Math.PI / 2);
    //   this.planeGrid.position.copy(new THREE.Vector3(0, -10, 0));
    //   this.planeGrid.receiveShadow = true;
    //   this.planeGrid.visible = false;
    //   this.scene?.add(this.planeGrid);

    //   let boxGeo = new THREE.BoxBufferGeometry(10, 10, 10);
    //   let boxMat = new THREE.MeshStandardMaterial({
    //     color: 0x00ff00,
    //     side: THREE.DoubleSide,
    //   });
    //   this.boxShadow = new THREE.Mesh(boxGeo, boxMat);
    //   this.boxShadow.castShadow = true;
    //   this.boxShadow.receiveShadow = true;
    //   this.boxShadow.visible = false;
    //   this.boxShadow.position.copy(new THREE.Vector3(50, 0, -50));
    //   this.scene?.add(this.boxShadow);
    // }

    if (!this.axesHelper.visible) {
      this.axesHelper.visible = true;
    } else {
      this.axesHelper.visible = false;
    }

    if (this.planeGrid && this.boxShadow) {
      if (!this.planeGrid.visible) {
        this.planeGrid.visible = true;
        this.boxShadow.visible = true;
      } else {
        this.planeGrid.visible = false;
        this.boxShadow.visible = false;
      }
    }
  }

  getCamera() {
    return this.camera;
  }
}
