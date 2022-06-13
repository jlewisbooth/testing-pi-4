import BaseLocation from "./base-location";
import { Object3D, Vector3 } from "three";

export default class StEnochManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "ST_ENOCH";
  modelName: string = "st-enoch-station-v5.gltf";
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
        model?.position.copy(new Vector3(-15.2, 3.2, -21.5));
        model?.rotateY(Math.PI / 64);

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
