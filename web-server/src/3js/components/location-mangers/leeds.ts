import BaseLocation from "./base-location";
import {
  Object3D,
  Vector3,
  PointLight,
  PointLightHelper,
  SphereGeometry,
  MeshBasicMaterial,
  Mesh,
  MeshPhysicalMaterial,
  Color,
} from "three";

function isMesh(e: any): e is Mesh {
  return typeof e === "object" && e.geometry && e.material;
}

export default class LeedsManager extends BaseLocation {
  constructor() {
    super({
      layer: "base",
    });
  }

  locationId: string = "LEEDS";
  modelName: string = "leeds-office-v6.gltf";
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
        model?.position.copy(new Vector3(-22.5, 0, 60));

        model?.traverse((child) => {
          child.matrixAutoUpdate = false;

          child.updateMatrix();
        });

        // const light = new PointLight(0xff0000, 10, 5, 2);
        // light.position.copy(new Vector3(0.8, 0.2, -1.2));
        // model?.add(light);

        // light.castShadow = true;

        // const geometry = new SphereGeometry(0.1, 32, 16);
        // const material = new MeshBasicMaterial({ color: 0xffff00 });
        // const sphere = new Mesh(geometry, material);

        // light.add(sphere);
        // light.scale.set(1 / 40, 1 / 40, 1 / 40);

        cb({
          errorMessage,
          model,
        });
      },
    });
  }
}
