// train parts
import FrontTrain from "./front-train";
import MidTrain from "./mid-train";
import EndTrain from "./end-train";
import {
  Mesh,
  Vector3,
  Object3D,
  SphereGeometry,
  MeshBasicMaterial,
  CatmullRomCurve3,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  CylinderGeometry,
} from "three";

// types
import type Scene from "../scene/index";

// train track parser
import { parseTrackModelForPoints } from "./util/train-track-parser";

type LoadResult = { success: boolean; id: string; model: any };

const up = new Vector3(0, 0, -1);

export default class TrainManager {
  constructor({ length }: { length: number }) {
    this.trainLength = length || 0;

    this.trainObjects = {
      front: new FrontTrain(),
      mid: new MidTrain(),
      end: new EndTrain(),
    };
  }

  trainLength: number = 0; // 0 is no mid carriages
  trainObjects: { [key: string]: FrontTrain | MidTrain | EndTrain };
  train?: (FrontTrain | MidTrain | EndTrain)[];
  westTrackCoords?: Vector3[];
  eastTrackCoords?: Vector3[];
  sortedTrackCoords?: Vector3[];
  trackCurve?: CatmullRomCurve3;

  // animation
  progressValue: number = 0;
  trainVelocity: number = 0.000015;
  lastTimestamp: number = 0;

  loadCarriages({
    loader,
    cb,
  }: {
    loader: any;
    cb: ({
      success,
      details,
    }: {
      success: boolean;
      details: LoadResult[];
    }) => void;
  }) {
    let promises: Promise<LoadResult>[] = [];
    Object.values(this.trainObjects).forEach((object: any) => {
      let promise = new Promise<LoadResult>((resolve, reject) => {
        new Promise((_, rej) => {
          object.load({
            loader: loader,
            cb: ({ errorMessage, model }: any) => {
              if (model) {
                let result: LoadResult = {
                  success: true,
                  model,
                  id: object.trainId,
                };

                resolve(result);
              } else {
                console.warn("\nModel load failed :- " + errorMessage + "\n");
                rej(null);
              }
            },
          });
        }).catch((err) => {
          console.log("ERROR", err);

          let result: LoadResult = {
            success: false,
            model: null,
            id: object.trainId,
          };

          resolve(result);
        });
      });

      promises.push(promise);
    });

    Promise.all(promises)
      .then((values) => {
        let success = values.every((e) => e.success);

        return cb({
          success,
          details: values,
        });
      })
      .catch((errMsg) => {
        console.warn(
          "Both model load and error model load failed.. :- " + errMsg
        );

        return cb({
          success: false,
          details: [],
        });
      });
  }

  formTrain() {
    this.train = [this.trainObjects.front];

    for (let i = 0; i < this.trainLength; i++) {
      let trainId = `MID_TRAIN_${i}`;
      if (this.trainObjects.mid) {
        let midTrainClone = this.trainObjects.mid.clone(trainId);

        this.train.push(midTrainClone);
      }
    }

    this.train.push(this.trainObjects.end);

    return this.train;
  }

  findTrackCoords(object: Mesh, trackId: "west" | "east") {
    if (trackId === "west") {
      let startPoint = new Vector3(
        0.3144128465652466,
        0.018175000324845314,
        1.488647681236267
      );
      let coords: Vector3[] | null = parseTrackModelForPoints(
        object,
        startPoint
      );
      if (Array.isArray(coords)) {
        this.westTrackCoords = coords;
      }
    }
    if (trackId === "east") {
      let startPoint = new Vector3(
        0.2544128465652466,
        0.018175000324845314,
        1.482647681236267
      );

      let coords: Vector3[] | null = parseTrackModelForPoints(
        object,
        startPoint
      );
      if (Array.isArray(coords)) {
        this.eastTrackCoords = coords;
      }
    }

    if (
      Array.isArray(this.westTrackCoords) &&
      Array.isArray(this.eastTrackCoords)
    ) {
      this.sortedTrackCoords = [
        ...this.eastTrackCoords.reverse(),
        ...this.westTrackCoords,
      ];
    }
  }

  highlightTrack(parentModel: Object3D) {
    const geometry = new SphereGeometry(0.003, 32, 32);

    // initial start track
    // pink
    // let geometryStartWest = new CylinderGeometry(0.005, 0.005, 0.5);
    // let materialStartWest = new MeshBasicMaterial({ color: 0xff00ff });
    // let startPoleWest = new Mesh(geometryStartWest, materialStartWest);
    // startPoleWest.position.copy(
    //   new Vector3(0.3144128465652466, 0.018175000324845314, 1.488647681236267)
    // );
    // parentModel.add(startPoleWest);

    // // yellow
    // let geometryStartEast = new CylinderGeometry(0.005, 0.005, 0.5);
    // let materialStartEast = new MeshBasicMaterial({ color: 0xffff00 });
    // let startPoleEast = new Mesh(geometryStartEast, materialStartEast);
    // startPoleEast.position.copy(
    //   new Vector3(0.2544128465652466, 0.018175000324845314, 1.482647681236267)
    // );
    // parentModel.add(startPoleEast);

    // if (Array.isArray(this.westTrackCoords)) {
    //   for (let i = 0; i < this.westTrackCoords.length - 1; i++) {
    //     let color = 0xff0000 + i;
    //     let material = new MeshBasicMaterial({ color: color });
    //     let sphere = new Mesh(geometry, material);
    //     let newPosition = new Vector3(
    //       this.westTrackCoords[i].x,
    //       this.westTrackCoords[i].y + i * 0.001,
    //       this.westTrackCoords[i].z
    //     );
    //     sphere.position.copy(newPosition);
    //     parentModel.add(sphere);
    //   }
    // }

    // if (Array.isArray(this.eastTrackCoords)) {
    //   for (let i = 0; i < this.eastTrackCoords.length - 1; i++) {
    //     let color = 0xffff00 + i;
    //     let material = new MeshBasicMaterial({ color: color });
    //     let sphere = new Mesh(geometry, material);
    //     let newPosition = new Vector3(
    //       this.eastTrackCoords[i].x,
    //       this.eastTrackCoords[i].y + i * 0.001,
    //       this.eastTrackCoords[i].z
    //     );
    //     sphere.position.copy(newPosition);
    //     parentModel.add(sphere);
    //   }
    // }

    // if (Array.isArray(this.sortedTrackCoords)) {
    //   for (let i = 0; i < this.sortedTrackCoords.length - 1; i++) {
    //     let color = 0xffff00 + i;
    //     let material = new MeshBasicMaterial({ color: color });
    //     let sphere = new Mesh(geometry, material);
    //     let newPosition = new Vector3(
    //       this.sortedTrackCoords[i].x,
    //       this.sortedTrackCoords[i].y,
    //       this.sortedTrackCoords[i].z
    //     );
    //     sphere.position.copy(newPosition);
    //     parentModel.add(sphere);
    //   }
    // }

    // if (
    //   !(
    //     Array.isArray(this.sortedTrackCoords) &&
    //     this.sortedTrackCoords.length > 3
    //   )
    // ) {
    //   return false;
    // }

    let formattingCurve = new CatmullRomCurve3(this.sortedTrackCoords);

    const points = formattingCurve.getPoints(400);

    this.trackCurve = new CatmullRomCurve3(points);

    // console.log("CATMULL POINTS", points);
    // let points2 = this.trackCurve.getPoints(400);

    // if (Array.isArray(points2)) {
    //   for (let i = 0; i < points2.length - 1; i++) {
    //     let color = 0xffff00 + i;
    //     let material = new MeshBasicMaterial({ color: color });
    //     let sphere = new Mesh(geometry, material);
    //     let newPosition = new Vector3(
    //       points2[i].x,
    //       points2[i].y + i * 0.001,
    //       points2[i].z
    //     );
    //     sphere.position.copy(newPosition);
    //     parentModel.add(sphere);
    //   }
    // }

    // const geometry1 = new BufferGeometry().setFromPoints(points2);
    // const material1 = new LineBasicMaterial({ color: 0xff0000 });

    // // Create the final object to add to the scene
    // const curveObject = new Line(geometry1, material1);
    // parentModel.add(curveObject);
  }

  trainSpacingMid: number = 0.0145;
  trainSpacingEnd: number = 0.0287;

  animate(timestamp: number) {
    let dt = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    if (this.train && this.train?.length > 0) {
      if (this.trackCurve) {
        let newPosition = this.trackCurve.getPoint(this.progressValue);
        let tangent = this.trackCurve.getTangent(this.progressValue);

        let axis = new Vector3();
        axis.crossVectors(up, tangent).normalize();
        let radians = Math.acos(up.dot(tangent));

        for (let i = 0; i < this.train.length; i++) {
          let carriage = this.train[i];
          if (carriage.trainId === "FRONT_TRAIN") {
            carriage.moveTo(newPosition);
            carriage.rotateFromAxisAngle(axis, radians);
          }

          if (carriage.trainId === "MID_TRAIN") {
            let midFraction =
              this.progressValue - i * this.trainSpacingMid < 0
                ? 1 + this.progressValue - i * this.trainSpacingMid
                : this.progressValue - i * this.trainSpacingMid;

            let midPosition = this.trackCurve.getPoint(midFraction);
            let tangent2 = this.trackCurve.getTangent(midFraction);

            let midAxis = new Vector3();
            midAxis.crossVectors(up, tangent2).normalize();
            let midRadians = Math.acos(up.dot(tangent2));

            carriage.moveTo(midPosition);
            carriage.rotateFromAxisAngle(midAxis, midRadians);
          }

          if (carriage.trainId === "END_TRAIN") {
            let endFraction =
              this.progressValue -
                ((this.trainLength - 1) * this.trainSpacingMid +
                  this.trainSpacingEnd) <
              0
                ? 1 +
                  this.progressValue -
                  ((this.trainLength - 1) * this.trainSpacingMid +
                    this.trainSpacingEnd)
                : this.progressValue -
                  ((this.trainLength - 1) * this.trainSpacingMid +
                    this.trainSpacingEnd);

            let endPosition = this.trackCurve.getPoint(endFraction);
            let endTagent = this.trackCurve.getTangent(endFraction);

            let endAxis = new Vector3();
            endAxis.crossVectors(up, endTagent).normalize();
            let endRadians = Math.acos(up.dot(endTagent));

            carriage.moveTo(endPosition);
            carriage.rotateFromAxisAngle(endAxis, endRadians);
          }
        }
      }

      this.progressValue = this.progressValue + dt * this.trainVelocity;

      if (this.progressValue > 1) {
        this.progressValue = 0;
      }
    }
  }
}
