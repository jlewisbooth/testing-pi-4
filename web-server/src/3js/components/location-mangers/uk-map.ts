import BaseLocation from "./base-location";
import { Mesh, Object3D } from "three";

import TrainManager from "../trains/train-manager";

export default class UKMapManager extends BaseLocation {
  constructor() {
    super({
      layer: "first",
    });

    this.trainManager = new TrainManager({
      length: 1,
    });
  }

  locationId: string = "UK_MAP";
  modelName: string = "uk-map-east-west-track-v1.gltf";
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
          let westTrainTrack: Object3D | null = null;
          let eastTrainTrack: Object3D | null = null;

          // this model has mixed up west and east
          model?.traverse((child) => {
            if (child.name === "west-track") {
              eastTrainTrack = child;
            }
            if (child.name === "east-track") {
              westTrainTrack = child;
            }
          });

          if (westTrainTrack && eastTrainTrack) {
            console.log(westTrainTrack);

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
