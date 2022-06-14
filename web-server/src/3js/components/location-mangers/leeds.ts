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
} from "three";

import type Scene from "../scene";
import type { ControlsDispatcher } from "../../../util/controls-dispatcher";
import type { SelectiveBloomEffect } from "postprocessing";

function isMesh(e: any): e is Mesh {
  return typeof e === "object" && e.geometry && e.material;
}

export default class LeedsManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "ub.model-uk.leeds";
  modelName: string = "leeds-office-v8.gltf";
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

        console.log(model);

        model?.traverse((child) => {
          child.matrixAutoUpdate = false;
          child.updateMatrix();

          if (child.name.startsWith("led") && isMesh(child)) {
            child.material = new MeshBasicMaterial({
              color: new Color().setRGB(
                Math.random(),
                Math.random(),
                Math.random()
              ),
            });

            child.frustumCulled = true;

            this.leds.push(child);
          } else {
            if (child.name === "mesh_2" && isMesh(child)) {
              console.log(child.material.color);
              child.material = new MeshBasicMaterial({
                color: new Color(0.01, 0.01, 0.01),
              });
            }
            if (child.name === "mesh_4" && isMesh(child)) {
              console.log(child.material.color);
              child.material = new MeshBasicMaterial({
                color: child.material.color,
              });
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

    // selection.add(this.eastTunnelLight);

    if (Array.isArray(this.leds) && this.leds.length > 0) {
      this.leds.forEach((led) => {
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
    return new Vector3(
      11.348892699429562,
      4.674465423011901,
      12.932085149333965
    );
  }

  getCameraPosition() {
    return new Vector3(5, 17, 32);
  }
}
