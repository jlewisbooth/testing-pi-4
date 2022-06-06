import BaseLocation from "./base-location";
import { Mesh, Object3D } from "three";

import TrainManager from "../trains/train-manager";

function isMesh(e: any): e is Mesh {
  return typeof e === "object" && e.geometry && e.material;
}

export default class UKMapManager extends BaseLocation {
  constructor() {
    super({
      layer: "first",
    });

    this.trainManager = new TrainManager({
      length: 3,
    });
  }

  locationId: string = "UK_MAP";
  modelName: string = "uk-map-updated-track-v1.gltf";
  modelPath: string = "/models/";

  trainManager?: TrainManager;

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
        if (this.trainManager) {
          let westTrainTrack: Mesh = null!;
          let eastTrainTrack: Mesh = null!;

          // this model has mixed up west and east
          model?.traverse((child) => {
            if (child.name === "east-track" && isMesh(child)) {
              eastTrainTrack = child;
            }
            if (child.name === "west-track" && isMesh(child)) {
              westTrainTrack = child;
            }
          });

          if (isMesh(westTrainTrack) && isMesh(eastTrainTrack)) {
            console.log(westTrainTrack);

            westTrainTrack.visible = false;
            eastTrainTrack.visible = false;

            // west track
            this.trainManager.findTrackCoords(westTrainTrack, "west");

            // west track
            this.trainManager.findTrackCoords(eastTrainTrack, "east");
          }

          this.trainManager?.loadCarriages({
            loader,
            cb: ({ success, details }) => {
              let trainCarriages = this.trainManager?.formTrain();

              if (
                Array.isArray(trainCarriages) &&
                trainCarriages.length > 0 &&
                trainCarriages.every((e) => e.loaded)
              ) {
                for (let carriage of trainCarriages) {
                  this.model.add(carriage.getModel());
                }
              }

              this.trainManager?.highlightTrack(this.model);

              cb({
                errorMessage,
                model,
              });
            },
          });
        } else {
          cb({
            errorMessage,
            model,
          });
        }
      },
    });
  }

  animate(timestamp: number) {
    this.trainManager?.animate(timestamp);
  }
}
