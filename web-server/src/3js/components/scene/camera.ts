import { PerspectiveCamera, Vector3 } from "three";

export default class Camera {
  constructor({
    FOV,
    width,
    height,
    near,
    far,
  }: {
    FOV: number;
    width: number;
    height: number;
    near: number;
    far: number;
  }) {
    this.camera = new PerspectiveCamera(
      FOV || 45, // FOV
      width / height || window.innerWidth / window.innerHeight, // aspect ratio
      near || 1, // near plane
      far || 2000 // far plane
    );

    this.enabled = true;

    this.width = width;
    this.height = height;

    this.left = 0;
    this.top = 0;
  }

  camera?: PerspectiveCamera;
  enabled: boolean;
  width: number;
  height: number;
  left: number;
  top: number;

  resize({ width, height }: { width: number; height: number }) {
    if (this.camera) {
      this.camera.aspect =
        width / height || window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }

    this.width = width;
    this.height = height;
  }

  setPosition({ x, y, z }: { x: number; y: number; z: number }) {
    if (this.camera) this.camera.position.copy(new Vector3(x, y, z));
  }

  setTarget({ x, y, z }: { x: number; y: number; z: number }) {
    if (this.camera) this.camera.lookAt(new Vector3(x, y, z));
  }

  getCameraObject() {
    return this.camera || null;
  }

  getPosition() {
    return new Vector3().copy(this.camera?.position || new Vector3());
  }

  destroy() {
    this.camera = undefined;
    this.enabled = false;
  }
}
