import BaseLocation from "./base-location";
import {
  Object3D,
  Vector3,
  MeshBasicMaterial,
  Mesh,
  Color,
  BufferGeometry,
  BufferAttribute,
  SphereBufferGeometry,
  MeshStandardMaterial,
} from "three";

import type Scene from "../scene";
import type { ControlsDispatcher } from "../../../util/controls-dispatcher";
import type { SelectiveBloomEffect } from "postprocessing";

function isMesh(e: any): e is Mesh {
  return typeof e === "object" && e.geometry && e.material;
}

export default class StJamesManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "ub.model-uk.st-james";
  modelName: string = "st-james-centre-v4.gltf";
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
        model?.position.copy(new Vector3(4, 0, -19.5));

        console.log(model);

        model?.traverse((child) => {
          child.matrixAutoUpdate = false;
          child.updateMatrix();

          child.frustumCulled = true;

          if (child.name === "mesh_1") {
            if (isMesh(child)) {
              // child.material = new MeshStandardMaterial({
              //   transparent: true,
              //   opacity: 0.2,
              //   color: new Color(0.9, 0.9, 0.9),
              // });
            }
          }

          if (child.name.startsWith("led") && isMesh(child)) {
            const material = new MeshBasicMaterial({
              color: new Color().setRGB(
                Math.random(),
                Math.random(),
                Math.random()
              ),
            });

            let led = this.getLedObject(child.geometry, material);

            child.visible = false;

            if (led) {
              this.leds.push(led);
            }
          }
        });

        this.leds.forEach((led) => {
          model?.add(led);
        });

        cb({
          errorMessage,
          model,
        });
      },
    });
  }

  leds: Mesh[] = [];
  selection?: any;

  getLedObject(meshGeometry: BufferGeometry, material: MeshBasicMaterial) {
    const geometry = new BufferGeometry();

    let meshPosition = meshGeometry.attributes.position.array;
    let objIndexPosition = meshGeometry.index?.array;

    let positions: number[] = [];
    if (objIndexPosition && objIndexPosition.length > 0) {
      for (let i = 0; i < objIndexPosition.length; i++) {
        let index = objIndexPosition[i] * 3;
        if (typeof meshPosition[index] === "number") {
          positions.push(meshPosition[index]);
          positions.push(meshPosition[index + 1]);
          positions.push(meshPosition[index + 2]);
        }
      }
    }

    if (positions.length > 0) {
      const vertices = new Float32Array(positions);
      geometry.setAttribute("position", new BufferAttribute(vertices, 3));

      geometry.computeBoundingSphere();

      let center = geometry.boundingSphere?.center;
      if (center) {
        let geometrySphere = new SphereBufferGeometry(0.005);

        const mesh = new Mesh(geometrySphere, material);
        mesh.position.copy(center);

        return mesh;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  initBloomEffect(bloomEffect: SelectiveBloomEffect, scene?: Scene) {
    this.selection = bloomEffect.selection;

    if (Array.isArray(this.leds) && this.leds.length > 0) {
      this.leds.forEach((led) => {
        this.selection.add(led);
      });
    }
  }

  getPosition() {
    return new Vector3(4, 5.913254418780314, -19.389659023284914);
  }

  getCameraPosition() {
    return new Vector3(4, 17, -42);
  }
}
