import BaseLocation from "./base-location";
import { Object3D, Vector3 } from "three";

export default class LeedsManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "LEEDS";
  modelName: string = "leeds-office-v3.gltf";
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
        model?.position.copy(new Vector3(12, 4.8, 10));

        cb({
          errorMessage,
          model,
        });
      },
    });
  }
}
