import {
  Scene,
  DirectionalLight,
  Vector3,
  AmbientLight,
  PointLight,
} from "three";

export default class Lighting {
  constructor({ scene }: { scene: Scene }) {
    this.scene = scene;

    this.addDirectionalLight({
      x: -100,
      y: 100,
      z: 100,
      name: "main",
      d: 200,
      far: 500,
      near: 0,
    });

    this.addAmbientLight({
      intensity: 0.5,
      name: "ambient",
    });
  }

  lights?: { [key: string]: DirectionalLight | PointLight | AmbientLight } = {};
  scene?: Scene;

  has(lightName: string) {
    return Boolean(this.lights && this.lights[lightName]);
  }

  destroy() {
    this.scene = undefined;
    if (this.lights) {
      Object.values(this.lights).forEach((light) => {
        light.dispose();
      });

      this.lights = undefined;
    }
  }

  addDirectionalLight({
    x,
    y,
    z,
    name,
    d,
    far,
    near,
  }: {
    x: number;
    y: number;
    z: number;
    name: string;
    d: number;
    far: number;
    near: number;
  }) {
    let directionalLight = new DirectionalLight(0xffffff, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.bottom = -d || -100;
    directionalLight.shadow.camera.top = d || 100;
    directionalLight.shadow.camera.right = d || 100;
    directionalLight.shadow.camera.left = -d || -100;
    directionalLight.shadow.camera.far = far || 500000;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = near || 0;
    directionalLight.position.copy(new Vector3(x || 100, y || 100, z || 100));

    if (this.lights) {
      this.lights[name || directionalLight.id] = directionalLight;
    }

    this.scene?.add(directionalLight);
  }

  addAmbientLight({ intensity, name }: { intensity: number; name: string }) {
    let ambientLight = new AmbientLight(0xffffff, intensity || 0.15);

    if (this.lights) {
      this.lights[name || ambientLight.id] = ambientLight;
    }

    this.scene?.add(ambientLight);
  }

  addPointLight({
    name,
    x,
    y,
    z,
  }: {
    name: string;
    x: number;
    y: number;
    z: number;
  }) {
    let pointLight = new PointLight(0xffffff, 0.3, 800);
    pointLight.position.copy(new Vector3(x || 0, y || 100, z || 0));

    if (this.lights) {
      this.lights[name || pointLight.id] = pointLight;
    }

    this.scene?.add(pointLight);
  }

  move({ x, y, z, name }: { x: number; y: number; z: number; name: string }) {
    if (this.lights && this.lights[name]) {
      this.lights[name].position.copy(
        new Vector3(x || 100, y || 100, z || 100)
      );
    }
  }

  toggleVisibility({ visible, name }: { visible: boolean; name: string }) {
    if (this.lights && this.lights[name]) {
      this.lights[name].visible = typeof visible === "boolean" ? visible : true;
    }
  }
}
