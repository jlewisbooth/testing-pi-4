import BaseLocation from "./base-location";
import { Object3D, Vector3 } from "three";

export default class TowerBridgeManager extends BaseLocation {
  constructor() {
    super({
      layer: "first",
    });
  }

  locationId: string = "TOWER_BRIDGE";
  modelName: string = "tower-bridge-v2.gltf";
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
        model?.position.copy(new Vector3(20, 4.8, 50));

        cb({
          errorMessage,
          model,
        });
      },
    });
  }
}
