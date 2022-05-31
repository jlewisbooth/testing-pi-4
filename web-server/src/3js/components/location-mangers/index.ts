// location managers
import LeedsManager from "./leeds";
import RaglanCastleManager from "./raglan-castle";
import StEnochManager from "./st-enoch";
import StJamesManager from "./st-james";
import TowerBridgeManager from "./tower-bridge";
import UKMapManager from "./uk-map";

// model loader manager
import ModelLoader from "../loaders/model-loader";

// types
import type Scene from "../scene/index";
import type { ControlsDispatcher } from "../../../util/controls-dispatcher";

export default class LocationManager {
  constructor() {
    this.modelLoader = new ModelLoader();

    this.managers = {
      leeds: new LeedsManager(),
      raglanCastle: new RaglanCastleManager(),
      stEnoch: new StEnochManager(),
      stJames: new StJamesManager(),
      towerBridge: new TowerBridgeManager(),
      ukMap: new UKMapManager(),
    };
  }

  managers: {
    [key: string]:
      | LeedsManager
      | RaglanCastleManager
      | StEnochManager
      | StJamesManager
      | TowerBridgeManager
      | UKMapManager;
  };
  modelLoader: ModelLoader;

  async loadModels(controlsDispatcher?: ControlsDispatcher) {
    let modelsLoaded = await new Promise((res, rej) => {
      this.modelLoader.load(
        {
          objects: this.managers,
          controlsDispatcher,
        },
        ({ success, details }) => {
          if (success) {
            console.log("ALL MODELS LOADED", details);
          }

          res(success);
        }
      );
    });

    return modelsLoaded;
  }

  addModelsToScene(scene: Scene) {
    Object.values(this.managers).forEach((manager) => {
      let managerModel = manager.getModel();
      if (managerModel) {
        scene.addToScene(managerModel);
      }
    });
  }

  animate(timestamp?: number) {
    if (typeof timestamp === "number") {
      Object.values(this.managers).forEach((manager) => {
        manager.animate(timestamp);
      });
    }
  }
}
