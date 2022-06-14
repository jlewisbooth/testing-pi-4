import BaseLocation from "./base-location";
import {
  Object3D,
  Vector3,
  SphereBufferGeometry,
  MeshBasicMaterial,
  Mesh,
  CylinderBufferGeometry,
} from "three";
import type { ControlsDispatcher } from "../../../util/controls-dispatcher";
import type Scene from "../scene";
import type { SelectiveBloomEffect } from "postprocessing";

export default class StEnochManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "ub.model-uk.glasgow-station";
  modelName: string = "st-enoch-station-v5.gltf";
  modelPath: string = "/models/";

  tofDiscriminator: string = "=>tof";

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
        model?.position.copy(new Vector3(-15.2, 3.2, -21.5));
        model?.rotateY(Math.PI / 64);

        model?.traverse((child) => {
          child.matrixAutoUpdate = false;
          child.updateMatrix();
        });

        cb({
          errorMessage,
          model,
        });
      },
    });
  }

  tunnelLight?: Mesh;
  selection?: any;

  initBloomEffect(bloomEffect: SelectiveBloomEffect, scene?: Scene) {
    this.selection = bloomEffect.selection;

    this.selection;
    const bulbGeometry = new SphereBufferGeometry(0.26, 32, 16);
    const bulbMaterial = new MeshBasicMaterial({ color: 0xff0000 });

    this.tunnelLight = new Mesh(bulbGeometry, bulbMaterial);

    let poleHeight = 1;
    const poleGeometry = new CylinderBufferGeometry(0.1, 0.1, poleHeight);

    poleGeometry.translate(0, -poleHeight / 2, 0);

    const poleMaterial = new MeshBasicMaterial({ color: 0x000000 });

    let pole = new Mesh(poleGeometry, poleMaterial);

    let trainIndicator = new Object3D();

    trainIndicator.add(pole);
    trainIndicator.add(this.tunnelLight);

    trainIndicator.position.set(-11.5, 1, -13.5);

    if (scene) {
      scene.addToScene(trainIndicator);
    }
  }

  setUpDispatcher(dispatcher: ControlsDispatcher) {
    if (dispatcher) {
      dispatcher.addEventListener(
        this.locationId + this.tofDiscriminator,
        ({ packet }: { packet: any }) => {
          if (packet.locationId === this.locationId && packet.type === "tof") {
            let data = packet.data;

            if (data.side === "all" && data.present && this.selection) {
              this.selection.add(this.tunnelLight);
            }
            if (data.side === "all" && !data.present && this.selection) {
              this.selection.delete(this.tunnelLight);
            }
          }
        }
      );
    }
  }

  getPosition() {
    return new Vector3(
      -15.175513170831149,
      3.1799999999999886,
      -21.541136612018846
    );
  }

  getCameraPosition() {
    return new Vector3(-9, 17, -42);
  }
}
