import {
  WebGLRenderer,
  Scene,
  Camera,
  PCFSoftShadowMap,
  PCFShadowMap,
  ReinhardToneMapping,
  Layers,
  Vector2,
  ShaderMaterial,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Material,
  HalfFloatType,
} from "three";

import {
  BlendFunction,
  BloomEffect,
  EdgeDetectionMode,
  EffectPass,
  KernelSize,
  SelectiveBloomEffect,
  SMAAEffect,
  SMAAPreset,
  RenderPass,
  EffectComposer,
  SMAAImageLoader,
} from "postprocessing";

const ENTIRE_SCENE = 0,
  BLOOM_SCENE = 1;

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
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      width || window.innerWidth,
      height || window.innerHeight
    );
    this.renderer.physicallyCorrectLights = true;

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.debug.checkShaderErrors = true;
    this.renderer.toneMapping = ReinhardToneMapping;

    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: HalfFloatType,
    });

    this.container.appendChild(this.renderer.domElement);
  }

  destroy() {
    this.container = undefined;
    this.renderer = undefined;
  }

  renderer?: WebGLRenderer;
  container?: HTMLDivElement;

  // bloom effect objects
  composer: EffectComposer;
  renderPass?: RenderPass;
  bloomLayer: Layers = new Layers();
  bloomOptions = {
    blendFunction: BlendFunction.SCREEN,
    kernelSize: KernelSize.LARGE,
    luminanceThreshold: 0.1,
    luminanceSmoothing: 0.0,
  };
  selectedBloomEffect?: SelectiveBloomEffect;
  effectPass?: EffectPass;

  cacheMaterials: { [key: string]: Material | Material[] } = {};

  setUpBloomEffects(scene: Scene, camera: Camera) {
    if (this.renderer) {
      this.renderPass = new RenderPass(scene, camera);

      this.composer.addPass(this.renderPass);
      this.renderer.shadowMap.needsUpdate = true;

      const smaaEffect = new SMAAEffect({
        edgeDetectionMode: EdgeDetectionMode.DEPTH,
        preset: SMAAPreset.HIGH,
      });
      smaaEffect.edgeDetectionMaterial.edgeDetectionThreshold = 0.01;

      this.selectedBloomEffect = new SelectiveBloomEffect(
        scene,
        camera,
        this.bloomOptions
      );
      this.selectedBloomEffect.inverted = false;
      this.selectedBloomEffect.intensity = 4;
      this.selectedBloomEffect.blurPass.scale = 1.2;
      this.selectedBloomEffect.luminancePass.enabled = true;

      this.effectPass = new EffectPass(
        camera,
        // smaaEffect,
        this.selectedBloomEffect
      );
      this.effectPass.renderToScreen = true;
      this.effectPass.enabled = true;

      this.composer.addPass(this.effectPass);
    }
  }

  getBloomEffect() {
    return this.selectedBloomEffect;
  }

  render(scene: Scene, camera: Camera) {
    if (this.composer) {
      this.composer.render();
    }

    // this.renderer?.render(scene, camera);
  }

  cut(left: number, top: number, width: number, height: number) {
    this.renderer?.setViewport(left, top, width, height);
    this.renderer?.setScissor(left, top, width, height);
    this.renderer?.setScissorTest(true);
  }

  setSize(width: number, height: number) {
    this.renderer?.setSize(width, height);

    if (this.composer) {
      this.composer.setSize(width, height);
    }
  }

  addShadow() {
    if (this.renderer) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap
    }
  }
}
