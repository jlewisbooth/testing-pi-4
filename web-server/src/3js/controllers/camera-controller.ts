import type LeedsManager from "../components/location-mangers/leeds";
import type RaglanCastleManager from "../components/location-mangers/raglan-castle";
import type StEnochManager from "../components/location-mangers/st-enoch";
import type StJamesManager from "../components/location-mangers/st-james";
import type TowerBridgeManager from "../components/location-mangers/tower-bridge";
import type UKMapManager from "../components/location-mangers/uk-map";
import type SceneCamera from "../components/scene/camera";
import { EventEmitter } from "events";
import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

type Location =
  | LeedsManager
  | RaglanCastleManager
  | StEnochManager
  | StJamesManager
  | TowerBridgeManager
  | UKMapManager;

export default class CameraController extends EventEmitter {
  constructor({
    camera,
    controls,
  }: {
    camera: SceneCamera;
    controls: OrbitControls;
  }) {
    super();

    this.camera = camera;
    this.controls = controls;

    this.setMaxListeners(1);
  }

  locations: Location[] = [];
  camera: SceneCamera;
  controls: OrbitControls;

  addLocation(location: Location) {
    this.locations.push(location);
  }

  jumpTo(locationId: string, autoRotate: boolean) {
    this.removeAllListeners();

    this.controls.enabled = false;
    this.controls.autoRotate = false;

    let location = this.locations.find((e) => e.locationId === locationId);
    if (location) {
      let modelCentre = location.getPosition();
      let targetPosition = location.getCameraPosition();

      let currentPosition = this.camera.getPosition();
      let startQuaternion = this.camera.getQuaternion();

      let targetQuaternion = new THREE.Quaternion();

      let pitchStart = new THREE.Vector3(
        modelCentre.x - targetPosition.x,
        0,
        modelCentre.z - targetPosition.z
      ).normalize();

      let pitchEnd = new THREE.Vector3(
        modelCentre.x - targetPosition.x,
        modelCentre.y - targetPosition.y,
        modelCentre.z - targetPosition.z
      ).normalize();

      let pitch = pitchStart.angleTo(pitchEnd);
      let pitchSign = Math.sign(modelCentre.y - targetPosition.y);

      let yawStart = new THREE.Vector3(0, 0, -1);

      let yawEnd = new THREE.Vector3(
        modelCentre.x - targetPosition.x,
        0,
        modelCentre.z - targetPosition.z
      ).normalize();

      let yaw = yawStart.angleTo(yawEnd);
      let yawSign = Math.sign(modelCentre.z - targetPosition.z);

      let rotation = new THREE.Euler(
        pitchSign * pitch,
        yawSign * yaw,
        0,
        "YXZ"
      );
      targetQuaternion.setFromEuler(rotation);

      // create path from current position to new position
      let curve = new THREE.CatmullRomCurve3([currentPosition, targetPosition]);

      const startTime = Date.now();

      const updateListener = () => {
        const time = Date.now();
        let t = (time - startTime) / 1000;

        this.camera.setPosition(curve.getPoint(t));
        const rotation = startQuaternion.clone().slerp(targetQuaternion, t);
        this.camera.setQuaternion(rotation);

        if (t >= 1) {
          t = 1;
          this.camera.setPosition(curve.getPoint(1));

          this.removeListener("render", updateListener);
          this.removeAllListeners();

          if (this.controls) {
            this.controls.target.copy(modelCentre);

            if (autoRotate) {
              this.controls.enablePan = false;
              this.controls.enableZoom = false;
              this.controls.enableRotate = false;
            } else {
              this.controls.enablePan = true;
              this.controls.enableZoom = true;
              this.controls.enableRotate = true;
            }

            this.controls.enabled = true;
            this.controls.autoRotate = autoRotate || false;
          }
        }
      };

      this.addListener("render", updateListener);
    }
  }

  update(timestamp?: number) {
    this.emit("render");
  }
}
