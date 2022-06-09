import BaseTrain from "./base-train";
import { Object3D, Vector3 } from "three";

export default class EndTrainManager extends BaseTrain {
  constructor() {
    super({
      layer: "base",
      centerModel: true,
    });
  }

  trainId: string = "END_TRAIN";
  modelName: string = "fb-train-v1.gltf";
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
        model?.rotation.set(0, Math.PI, 0);

        cb({
          errorMessage,
          model,
        });
      },
    });
  }

  clone(trainId: string, rotation?: number) {
    let clone = new EndTrainManager();
    clone.model.name = trainId || this.trainId;
    clone.model = this.model.clone();
    clone.loaded = true;
    clone.trainId = trainId || this.trainId;
    clone.model.rotation.set(0, rotation || 0, 0);

    return clone;
  }
}
