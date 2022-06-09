import {
  WebGLRenderer,
  Scene,
  Camera,
  PCFSoftShadowMap,
  PCFShadowMap,
  ReinhardToneMapping,
} from "three";

export default class Renderer {
  constructor({
    container,
    width,
    height,
  }: {
    container: HTMLDivElement;
    width: number;
    height: number;
  }) {
    this.container = container;
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      width || window.innerWidth,
      height || window.innerHeight
    );
    this.renderer.physicallyCorrectLights = true;

    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.toneMapping = ReinhardToneMapping;

    this.container.appendChild(this.renderer.domElement);
  }

  destroy() {
    this.container = undefined;
    this.renderer = undefined;
  }

  renderer?: WebGLRenderer;
  container?: HTMLDivElement;

  render(scene: Scene, camera: Camera) {
    this.renderer?.render(scene, camera);

    // console.log(this.renderer?.info.render);
  }

  cut(left: number, top: number, width: number, height: number) {
    this.renderer?.setViewport(left, top, width, height);
    this.renderer?.setScissor(left, top, width, height);
    this.renderer?.setScissorTest(true);
  }

  setSize(width: number, height: number) {
    this.renderer?.setSize(width, height);
  }

  addShadow() {
    if (this.renderer) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap
    }
  }
}
