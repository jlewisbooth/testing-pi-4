import { Vector3 } from "three";

export default class TrainTrackInterpretor {
  constructor({ trainTrack }: { trainTrack: Vector3[] }) {
    this.trainTrack = trainTrack;
  }

  trainTrack: Vector3[];

  getPositionAndDirection(fraction: number /* fraction is between 0 & 1 */) {}
}
