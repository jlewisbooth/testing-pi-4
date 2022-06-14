import BaseLocation from "./base-location";
import {
  Object3D,
  SphereBufferGeometry,
  MeshBasicMaterial,
  Mesh,
  CylinderBufferGeometry,
  Vector3,
} from "three";
import type { ControlsDispatcher } from "../../../util/controls-dispatcher";

import type Scene from "../scene";

import type { SelectiveBloomEffect } from "postprocessing";

function isMesh(e: any): e is Mesh {
  return typeof e === "object" && e.geometry && e.material;
}

export default class TowerBridgeManager extends BaseLocation {
  constructor() {
    super({
      layer: "first",
    });

    this.leftTowerId = "Tower_1stl_1";
    this.leftTowerCapId = "Tower_Capstl_1";

    this.rightTowerId = "Tower_1stl";
    this.rightTowerCapId = "Tower_Capstl";

    this.leftBasculeId = "Bridge_2stl";
    this.rightBasculeId = "Bridge_1stl";

    // rotate in local axis
    this.towerAxis = new Vector3(0, 0, 1);
    this.towerAxis.applyAxisAngle(new Vector3(0, 1, 0), -0.27);
  }

  locationId: string = "ub.model-uk.tower-bridge";
  modelName: string = "tower-bridge-v6.gltf";
  modelPath: string = "/models/";

  tofDiscriminator: string = "=>tof";

  towerAxis: Vector3 = new Vector3();

  tiltDiscriminator: string = "=>tilt";

  leftTowerId: string;
  leftTowerCapId: string;
  rightTowerId: string;
  rightTowerCapId: string;
  leftBasculeId: string;
  rightBasculeId: string;

  leftTower?: Object3D;
  leftTowerCap?: Object3D;

  rightTower?: Object3D;
  rightTowerCap?: Object3D;

  leftBascule?: Object3D;
  rightBascule?: Object3D;

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
        model?.position.copy(new Vector3(23, 4.8, 49.25));

        model?.traverse((child) => {
          if (child.name === this.leftTowerId) {
            this.leftTower = child;
            this.recenterMesh(this.leftTower, 0.158, -0.03, 0.025);
          }
          if (child.name === this.leftTowerCapId) {
            this.leftTowerCap = child;

            this.leftTowerCap.translateX(0.158);
            this.leftTowerCap.translateY(-0.03);
            this.leftTowerCap.translateZ(0.025);
          }

          if (child.name === this.rightTowerId) {
            this.rightTower = child;
            this.recenterMesh(this.rightTower, -0.158, -0.03, -0.025);
          }
          if (child.name === this.rightTowerCapId) {
            this.rightTowerCap = child;

            this.rightTowerCap.translateX(-0.158);
            this.rightTowerCap.translateY(-0.03);
            this.rightTowerCap.translateZ(-0.025);
          }

          if (child.name === this.leftBasculeId) {
            this.leftBascule = child;
            this.recenterMesh(this.leftBascule, 0.11, -0.05, 0.014);
          }
          if (child.name === this.rightBasculeId) {
            this.rightBascule = child;
            this.recenterMesh(this.rightBascule, -0.11, -0.05, -0.025);
          }
        });

        if (this.leftTower && this.leftTowerCap) {
          this.leftTower.add(this.leftTowerCap);
        }

        if (this.rightTower && this.rightTowerCap) {
          this.rightTower.add(this.rightTowerCap);
        }

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

    trainIndicator.position.set(33.4, 5.9, 44);

    if (scene) {
      scene.addToScene(trainIndicator);
    }

    // selection.add(this.eastTunnelLight);
  }

  setUpDispatcher(dispatcher: ControlsDispatcher) {
    if (dispatcher) {
      dispatcher.addEventListener(
        this.locationId + this.tiltDiscriminator,
        ({ packet }: { packet: any }) => {
          if (packet.locationId === this.locationId && packet.type === "tilt") {
            let data = packet.data;
            this.onPacket(data);
          }
        }
      );

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

  onPacket(data: {
    leftTower?: number;
    rightTower?: number;
    leftBridge?: number;
    rightBridge?: number;
  }) {
    if (this.leftTower && typeof data.leftTower === "number") {
      this.leftTower.setRotationFromAxisAngle(this.towerAxis, -data.leftTower);
    }
    if (this.rightTower && typeof data.rightTower === "number") {
      this.rightTower.setRotationFromAxisAngle(
        this.towerAxis,
        -data.rightTower
      );
    }
    if (this.rightBascule && typeof data.rightBridge === "number") {
      this.rightBascule.setRotationFromAxisAngle(
        this.towerAxis,
        -data.rightBridge
      );
    }
    if (this.leftBascule && typeof data.leftBridge === "number") {
      this.leftBascule.setRotationFromAxisAngle(
        this.towerAxis,
        data.leftBridge
      );
    }
  }

  recenterMesh(obj: Object3D, x: number, y: number, z: number) {
    for (let child of obj.children) {
      if (isMesh(child)) {
        child.translateX(x);
        child.translateY(y);
        child.translateZ(z);
      }
    }

    obj.translateX(-x);
    obj.translateY(-y);
    obj.translateZ(-z);
  }

  getPosition() {
    return new Vector3(23, 7, 50);
  }

  getCameraPosition() {
    return new Vector3(18, 17, 74);
  }
}
