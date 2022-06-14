import BaseLocation from "./base-location";
import { Object3D, Vector3, Box3 } from "three";

export default class RaglanCastleManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "ub.model-uk.raglan-castle";
  modelName: string = "raglan-castle-v2.gltf";
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

        model?.traverse((child) => {
          child.matrixAutoUpdate = false;
          child.updateMatrix();
        });

        cb({
          errorMessage,
          model,
        });
      },
    });
  }

  getPosition() {
    return new Vector3(
      -8.911333461367494,
      2.419868311747201,
      41.267867122399075
    );
  }

  getCameraPosition() {
    return new Vector3(-11.911333461367494, 15, 64);
  }
}
