import BaseLocation from "./base-location";
import { Object3D, Vector3 } from "three";

export default class StJamesManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "ST_JAMES";
  modelName: string = "st-james-centre-v2.gltf";
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
        model?.position.copy(new Vector3(4, 0, -19.5));

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
}
