import BaseTrain from "./base-train";
import { Object3D, Vector3 } from "three";

export default class MidTrainManager extends BaseTrain {
  constructor() {
    super({
      layer: "base",
      centerModel: true,
    });
  }

  trainId: string = "MID_TRAIN";
  modelName: string = "mid-train-v2.gltf";
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

        cb({
          errorMessage,
          model,
        });
      },
    });
  }

  clone(trainId: string) {
    let clone = new MidTrainManager();
    clone.model.name = trainId || this.trainId;
    clone.model = this.model.clone();
    clone.loaded = true;

    return clone;
  }
}
