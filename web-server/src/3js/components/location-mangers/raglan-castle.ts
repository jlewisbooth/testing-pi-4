import BaseLocation from "./base-location";
import { Object3D, Vector3 } from "three";

export default class RaglanCastleManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "RAGLAN_CASTLE";
  modelName: string = "raglan-castle-v1.gltf";
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
        model?.position.copy(new Vector3(-7, 0.6, 42));

        cb({
          errorMessage,
          model,
        });
      },
    });
  }
}
