import {
  Mesh,
  Object3D,
  Box3,
  AnimationClip,
  Group,
  Camera,
  Vector3,
} from "three";

interface GLTF {
  animations: AnimationClip[];
  scene: Group;
  scenes: Group[];
  cameras: Camera[];
}

type Layer = "base" | "first" | "second" | "third";

export default class BaseTrain {
  constructor({ layer, centerModel }: { layer: Layer; centerModel?: boolean }) {
    this.layer = layer;

    if (centerModel) {
      this.centerModel = centerModel;
    }
  }

  trainId?: string;
  modelName?: string;
  modelPath?: string;
  loaded: boolean = false;
  model: Object3D = new Object3D();
  layer: Layer = "base";
  centerModel: boolean = false;

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
    let modelURL = `${this.modelPath}${this.modelName}`;

    try {
      loader.load(
        modelURL,
        (model: GLTF) => {
          let box, center;
          let centerVec = new Vector3();

          switch (this.layer) {
            case "base":
              if (this.centerModel) {
                box = new Box3().setFromObject(model.scene);
                center = box.getCenter(centerVec);

                let dm = new Vector3(-center.x, 0, -center.z);
                model.scene.position.copy(dm);
              }

              this.model.add(model.scene);
              break;
            case "first":
              if (this.centerModel) {
                box = new Box3().setFromObject(model.scene.children[0]);
                center = box.getCenter(centerVec);

                let dm = new Vector3(-center.x, 0, -center.z);
                model.scene.children[0].position.copy(dm);
              }

              this.model.add(model.scene.children[0]);
              break;
            case "second":
              if (this.centerModel) {
                box = new Box3().setFromObject(model.scene.children[1]);
                center = box.getCenter(centerVec);

                let dm = new Vector3(-center.x, 0, -center.z);
                model.scene.children[0].position.copy(dm);
              }

              this.model.add(model.scene.children[1]);
              break;
            case "third":
              if (this.centerModel) {
                box = new Box3().setFromObject(model.scene.children[2]);
                center = box.getCenter(centerVec);

                let dm = new Vector3(-center.x, 0, -center.z);
                model.scene.children[0].position.copy(dm);
              }

              this.model.add(model.scene.children[2]);
              break;
            default:
              if (this.centerModel) {
                box = new Box3().setFromObject(model.scene.children[0]);
                center = box.getCenter(centerVec);

                let dm = new Vector3(-center.x, 0, -center.z);
                model.scene.children[0].position.copy(dm);
              }

              this.model.add(model.scene.children[0]);
              break;
          }

          this.loaded = true;

          this.model.traverse((child) => {
            child.receiveShadow = true;
            child.castShadow = true;
          });

          // this.model.scale.set(40, 40, 40);

          if (this.trainId) {
            this.model.name = this.trainId;
          }

          cb({
            model: this.model,
            errorMessage: null,
          });
        },
        null,
        (err: any) => {
          this.loaded = false;
          if (typeof cb === "function") {
            cb({
              model: null,
              errorMessage: err.target?.statusText,
            });
          }
        }
      );
    } catch (error: any) {
      this.loaded = false;
      cb({
        errorMessage: error.message,
        model: null,
      });
    }
  }

  getModel() {
    return this.model || null;
  }

  moveTo(position: Vector3) {
    this.model.position.copy(position);
  }

  rotateFromAxisAngle(axis: Vector3, rotation: number) {
    this.model.quaternion.setFromAxisAngle(axis, rotation);
  }
}
