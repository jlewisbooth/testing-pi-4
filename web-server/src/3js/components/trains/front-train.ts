import BaseTrain from "./base-train";
import { Object3D, Vector3 } from "three";

export default class FrontTrainManager extends BaseTrain {
  constructor() {
    super({
      layer: "base",
      centerModel: true,
    });
  }

  trainId: string = "FRONT_TRAIN";
  modelName: string = "front-train-v1.gltf";
  modelPath: string = "/models/";

  velocity: number = 0.01;
  targetDirection: Vector3 = new Vector3();
  trackIndex: number = 0;

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
        model?.position.copy(new Vector3(0, 0.01, 0));

        cb({
          errorMessage,
          model,
        });
      },
    });
  }

  clone(trainId: string) {
    let clone = new FrontTrainManager();
    clone.model.name = trainId || this.trainId;
    clone.model = this.model.clone();
    clone.loaded = true;

    return clone;
  }
}
