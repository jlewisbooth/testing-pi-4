import BaseLocation from "./base-location";
import {
  Object3D,
  Vector3,
  SphereBufferGeometry,
  MeshBasicMaterial,
  Mesh,
  CylinderBufferGeometry,
  BoxBufferGeometry,
  Color,
  MeshStandardMaterial,
  Camera,
} from "three";

import type Scene from "../scene";
import type { ControlsDispatcher } from "../../../util/controls-dispatcher";
import type { SelectiveBloomEffect } from "postprocessing";

function isMesh(e: any): e is Mesh {
  return typeof e === "object" && e.geometry && e.material;
}

const EAST_SIDE_INDEX = [
  9, 10, 11, 12, 13, 22, 23, 24, 25, 34, 35, 36, 37, 45, 46, 47, 48, 49,
];
const EAST_SIDE_LEDS = EAST_SIDE_INDEX.map((e) => "led-" + e);

const WEST_SIDE_INDEX = [
  2, 3, 4, 5, 6, 7, 15, 16, 17, 18, 19, 20, 27, 28, 29, 30, 31, 32, 38, 39, 40,
  41, 43, 44,
];
const WEST_SIDE_LEDS = WEST_SIDE_INDEX.map((e) => "led-" + e);

const SOUTH_SIDE_INDEX = [8, 21, 33];
const SOUTH_SIDE_LEDS = SOUTH_SIDE_INDEX.map((e) => "led-" + e);

export default class LeedsManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "ub.model-uk.leeds";
  modelName: string = "leeds-office-v9.gltf";
  modelPath: string = "/models/";

  load({
    loader,
    cb,
  }: {
    loader: any;
    cb: ({
      errorMessage,
      model,
    }: {
      errorMessage: string | null;
      model: Object3D | null;
    }) => void;
  }) {
    // overload load function for model manipulation
    super.load({
      loader,
      cb: ({ errorMessage, model }) => {
        // move model to correct position
        model?.position.copy(new Vector3(-22.5, 0, 60));

        model?.traverse((child) => {
          child.matrixAutoUpdate = false;
          child.updateMatrix();

          child.frustumCulled = true;

          if (child.name.startsWith("led") && isMesh(child)) {
            child.material = new MeshBasicMaterial({
              color: new Color().setRGB(
                Math.random(),
                Math.random(),
                Math.random()
              ),
            });

            if (EAST_SIDE_LEDS.includes(child.name)) {
              this.eastLeds.push(child);

              child.visible = false;
            } else if (WEST_SIDE_LEDS.includes(child.name)) {
              this.westLeds.push(child);
            } else if (SOUTH_SIDE_LEDS.includes(child.name)) {
              this.southLeds.push(child);
            }
          }
        });

        // add train tunnel lights
        const geometry = new BoxBufferGeometry(0.04, 0.1, 0.1);
        const material = new MeshStandardMaterial({
          color: 0x000000,
        });
        const cube = new Mesh(geometry, material);
        cube.position.copy(new Vector3(0.85, 0.17, -1.2));

        cb({
          errorMessage,
          model,
        });
      },
    });
  }

  eastTunnelLight?: Mesh;
  westTunnelLight?: Mesh;
  selection?: any;

  leds: Mesh[] = [];

  westLeds: Mesh[] = [];
  eastLeds: Mesh[] = [];
  southLeds: Mesh[] = [];

  tofDiscriminator: string = "=>tof";

  initBloomEffect(bloomEffect: SelectiveBloomEffect, scene?: Scene) {
    this.selection = bloomEffect.selection;

    const bulbGeometry = new SphereBufferGeometry(0.26, 32, 16);
    const bulbMaterial = new MeshBasicMaterial({ color: 0xff0000 });

    this.eastTunnelLight = new Mesh(bulbGeometry, bulbMaterial);
    this.westTunnelLight = new Mesh(bulbGeometry, bulbMaterial);

    let poleHeight = 1;
    const poleGeometry = new CylinderBufferGeometry(0.1, 0.1, poleHeight);

    poleGeometry.translate(0, -poleHeight / 2, 0);

    const poleMaterial = new MeshBasicMaterial({ color: 0x000000 });

    let poleEast = new Mesh(poleGeometry, poleMaterial);
    let poleWest = new Mesh(poleGeometry, poleMaterial);

    let trainIndicatorEast = new Object3D();

    trainIndicatorEast.add(poleEast);
    trainIndicatorEast.add(this.eastTunnelLight);

    trainIndicatorEast.position.set(10, 5.1, 7.2);

    let trainIndicatorWest = new Object3D();

    trainIndicatorWest.add(poleWest);
    trainIndicatorWest.add(this.westTunnelLight);

    trainIndicatorWest.position.set(9.3, 5.1, 19.2);

    if (scene) {
      scene.addToScene(trainIndicatorEast);
      scene.addToScene(trainIndicatorWest);
    }

    if (Array.isArray(this.westLeds) && this.westLeds.length > 0) {
      this.westLeds.forEach((led) => {
        this.selection.add(led);
      });
    }
    if (Array.isArray(this.eastLeds) && this.eastLeds.length > 0) {
      this.eastLeds.forEach((led) => {
        this.selection.add(led);
      });
    }
    if (Array.isArray(this.southLeds) && this.southLeds.length > 0) {
      this.southLeds.forEach((led) => {
        this.selection.add(led);
      });
    }
  }

  setUpDispatcher(dispatcher: ControlsDispatcher) {
    if (dispatcher) {
      dispatcher.addEventListener(
        this.locationId + this.tofDiscriminator,
        ({ packet }: { packet: any }) => {
          if (packet.locationId === this.locationId && packet.type === "tof") {
            let data = packet.data;

            if (data.side === "west" && data.present && this.selection) {
              this.selection.add(this.westTunnelLight);
            }
            if (data.side === "west" && !data.present && this.selection) {
              this.selection.delete(this.westTunnelLight);
            }

            if (data.side === "east" && data.present && this.selection) {
              this.selection.add(this.eastTunnelLight);
            }
            if (data.side === "east" && !data.present && this.selection) {
              this.selection.delete(this.eastTunnelLight);
            }
          }
        }
      );
    }
  }

  getPosition() {
    return this.position;
  }

  getCameraPosition() {
    return new Vector3(5, 17, 32);
  }

  westLedsOn: boolean = false;
  eastLedsOn: boolean = false;
  southLedsOn: boolean = false;

  northVector: Vector3 = new Vector3(0, 0, -1);
  position: Vector3 = new Vector3(
    11.348892699429562,
    4.674465423011901,
    12.932085149333965
  );

  animate(_: number, camera?: Camera) {
    if (camera) {
      let position = camera?.position;

      if (position) {
        let { x, y, z } = position;

        let cameraVector = new Vector3(
          x - this.position.x,
          0,
          z - this.position.z
        ).normalize();

        let sign = Math.sign(x - this.position.x);
        let angle = sign * this.northVector.angleTo(cameraVector);

        if (
          (angle < -0.8 && angle > -Math.PI) ||
          (angle < Math.PI && angle > 2.42)
        ) {
          if (!this.westLedsOn) {
            this.westLedsOn = true;
            this.westLeds.forEach((led) => (led.visible = true));
          }
        } else {
          if (this.westLedsOn) {
            this.westLedsOn = false;
            this.westLeds.forEach((led) => (led.visible = false));
          }
        }

        if (angle > -0.15 && angle < 2.86) {
          if (!this.eastLedsOn) {
            this.eastLedsOn = true;
            this.eastLeds.forEach((led) => (led.visible = true));
          }
        } else {
          if (this.eastLedsOn) {
            this.eastLedsOn = false;
            this.eastLeds.forEach((led) => (led.visible = false));
          }
        }

        if (angle > Math.PI / 16 || angle < -Math.PI / 2) {
          if (!this.southLedsOn) {
            this.southLedsOn = true;
            this.southLeds.forEach((led) => (led.visible = true));
          }
        } else {
          if (this.southLedsOn) {
            this.southLedsOn = false;
            this.southLeds.forEach((led) => (led.visible = false));
          }
        }
      }
    }
  }
}
