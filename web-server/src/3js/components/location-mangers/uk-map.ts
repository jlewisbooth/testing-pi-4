import BaseLocation from "./base-location";
import { Mesh, Object3D } from "three";
import type { ControlsDispatcher } from "../../../util/controls-dispatcher";

import TrainManager from "../trains/train-manager";

function isMesh(e: any): e is Mesh {
  return e && typeof e === "object" && e.geometry && e.material;
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

  locationId: string = "ub.model-uk.uk-map";
  modelName: string = "uk-map-with-legs.gltf";
  modelPath: string = "/models/";

  trainManager?: TrainManager;

  tofDiscriminator: string = "=>tof";
  leedsId: string = "ub.model-uk.leeds";
  towerBridgeId: string = "ub.model-uk.tower-bridge";
  glasgowStationId: string = "ub.model-uk.glasgow-station";

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
            child.matrixAutoUpdate = false;

            if (child.name === "east-track" && isMesh(child)) {
              eastTrainTrack = child;
            }
            if (child.name === "west-track" && isMesh(child)) {
              westTrainTrack = child;
            }

            child.updateMatrix();
          });

          if (isMesh(westTrainTrack) && isMesh(eastTrainTrack)) {
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

  setUpDispatcher(dispatcher: ControlsDispatcher) {
    if (dispatcher) {
      dispatcher.addEventListener(
        this.leedsId + this.tofDiscriminator,
        ({ packet }: { packet: any }) => {
          if (packet.locationId === this.leedsId && packet.type === "tof") {
            let data = packet.data;

            if (data.side === "west" && data.present) {
              this.trainManager?.updateTrainPosition(0.675);
            }
            if (data.side === "east" && data.present) {
              this.trainManager?.updateTrainPosition(0.265);
            }
          }
        }
      );

      dispatcher.addEventListener(
        this.towerBridgeId + this.tofDiscriminator,
        ({ packet }: { packet: any }) => {
          if (
            packet.locationId === this.towerBridgeId &&
            packet.type === "tof"
          ) {
            let data = packet.data;

            if (data.present) {
              this.trainManager?.updateTrainPosition(0.41);
            }
          }
        }
      );

      dispatcher.addEventListener(
        this.glasgowStationId + this.tofDiscriminator,
        ({ packet }: { packet: any }) => {
          if (
            packet.locationId === this.glasgowStationId &&
            packet.type === "tof"
          ) {
            let data = packet.data;

            if (data.present) {
              this.trainManager?.updateTrainPosition(0.815);
            }
          }
        }
      );
    }
  }
}
