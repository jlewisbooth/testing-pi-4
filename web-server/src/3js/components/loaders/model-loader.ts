import { TextureLoader, LoadingManager } from "three";
import { GLTFLoader } from "./GLTFLoader.js";
import { DRACOLoader } from "./DRACOLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

type LoadResult = { success: boolean; id: string; model: any };

class BaseLoader {
  modelManager = new LoadingManager();
  textureManager = new LoadingManager();
  managers = [this.modelManager, this.textureManager];

  // loaders
  GLTFLoader: any = new GLTFLoader(this.modelManager);
  textureLoader = new TextureLoader(this.textureManager);
  // this solves an authentication issue

  fontLoader = new FontLoader();

  // allocating draco loader
  DRACOLoader: any = new DRACOLoader();

  constructor() {
    this.textureLoader.setCrossOrigin("use-credentials");
    this.DRACOLoader.setDecoderPath("/draco/");
    this.GLTFLoader.setDRACOLoader(this.DRACOLoader);
  }

  load(
    { objects, controlsDispatcher }: any,
    cb: ({
      success,
      details,
    }: {
      success: boolean;
      details: LoadResult[];
    }) => void
  ) {
    let promises: Promise<LoadResult>[] = [];

    Object.values(objects).forEach((object: any) => {
      let promise = new Promise<LoadResult>((resolve, reject) => {
        new Promise((_, rej) => {
          object.load({
            loader: this.GLTFLoader,
            textureLoader: this.textureLoader,
            fontLoader: this.fontLoader,
            cb: ({ errorMessage, model }: any) => {
              if (model) {
                let result: LoadResult = {
                  success: true,
                  model,
                  id: object.locationId,
                };

                if (controlsDispatcher) {
                  controlsDispatcher.dispatchEvent({
                    type: "MODEL_LOADED",
                    locationId: object.locationId,
                    success: true,
                  });
                }

                resolve(result);
              } else {
                console.warn("\nModel load failed :- " + errorMessage + "\n");
                rej(null);
              }
            },
          });
        }).catch((err) => {
          console.log("ERROR", err);
          let result: LoadResult = {
            success: false,
            model: null,
            id: object.locationId,
          };

          if (controlsDispatcher) {
            controlsDispatcher.dispatchEvent({
              type: "MODEL_LOADED",
              locationId: object.locationId,
              success: false,
            });
          }

          resolve(result);
        });
      });

      promises.push(promise);
    });

    Promise.all(promises)
      .then((values) => {
        let success = values.every((e) => e.success);

        return cb({
          success,
          details: values,
        });
      })
      .catch((errMsg) => {
        console.warn(
          "Both model load and error model load failed.. :- " + errMsg
        );

        return cb({
          success: false,
          details: [],
        });
      });
  }
}

export default BaseLoader;
