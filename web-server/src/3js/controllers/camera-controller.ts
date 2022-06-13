import type LeedsManager from "../components/location-mangers/leeds";
import type RaglanCastleManager from "../components/location-mangers/raglan-castle";
import type StEnochManager from "../components/location-mangers/st-enoch";
import type StJamesManager from "../components/location-mangers/st-james";
import type TowerBridgeManager from "../components/location-mangers/tower-bridge";
import type UKMapManager from "../components/location-mangers/uk-map";
import type SceneCamera from "../components/scene/camera";

type Location =
  | LeedsManager
  | RaglanCastleManager
  | StEnochManager
  | StJamesManager
  | TowerBridgeManager
  | UKMapManager;

export default class CameraController {
  constructor({ camera }: { camera: SceneCamera }) {
    this.camera = camera;
  }

  locations: Location[] = [];
  camera: SceneCamera;

  addLocation(location: Location) {
    this.locations.push(location);
  }

  jumpTo(locationId: string) {}

  update() {}
}
