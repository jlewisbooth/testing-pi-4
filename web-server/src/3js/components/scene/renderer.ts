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
} from "three";

import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

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

    this.bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    this.bloomPass.threshold = this.bloomParameters.bloomThreshold;
    this.bloomPass.strength = this.bloomParameters.bloomStrength;
    this.bloomPass.radius = this.bloomParameters.bloomRadius;
  }

  destroy() {
    this.container = undefined;
    this.renderer = undefined;
  }

  renderer?: WebGLRenderer;
  container?: HTMLDivElement;

  // bloom effect objects
  bloomLayer: Layers = new Layers();
  bloomPass?: UnrealBloomPass;
  bloomParameters = {
    exposure: 1,
    bloomStrength: 5,
    bloomThreshold: 0,
    bloomRadius: 0,
  };
  renderScene?: RenderPass;
  finalPass?: ShaderPass;
  bloomComposer?: EffectComposer;
  finalComposer?: EffectComposer;
  darkMaterial: MeshBasicMaterial = new MeshBasicMaterial({ color: "black" });

  cacheMaterials: { [key: string]: Material | Material[] } = {};

  setUpBloomEffects(scene: Scene, camera: Camera) {
    if (this.renderer && this.bloomPass) {
      this.renderScene = new RenderPass(scene, camera);
      this.bloomComposer = new EffectComposer(this.renderer);

      this.bloomComposer.renderToScreen = false;
      this.bloomComposer.addPass(this.renderScene);
      this.bloomComposer.addPass(this.bloomPass);

      this.finalPass = new ShaderPass(
        new ShaderMaterial({
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
          },
          vertexShader: [
            "varying vec2 vUv;",
            "void main() {",
            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "}",
          ].join("\n"),
          fragmentShader: [
            "uniform sampler2D baseTexture;",
            "uniform sampler2D bloomTexture;",
            "varying vec2 vUv;",
            "void main() {",
            "gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );",
            "}",
          ].join("\n"),
        }),
        "baseTexture"
      );
      this.finalPass.needsSwap = true;

      this.finalComposer = new EffectComposer(this.renderer);
      this.finalComposer.addPass(this.renderScene);
      this.finalComposer.addPass(this.finalPass);

      // test objects
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ color: 0x00ff00 });

      let cube1 = new Mesh(geometry, material);
      cube1.position.set(10, 10, 10);

      cube1.layers.enable(BLOOM_SCENE);

      scene.add(cube1);
    }
  }

  darkenNonBloomed(o: any) {
    if (o.isMesh && this.bloomLayer.test(o.layers) === false) {
      this.cacheMaterials[o.uuid] = o.material;
      o.material = this.darkMaterial;
      o.visible = false;
    }
  }

  restoreMaterial(o: any) {
    if (this.cacheMaterials[o.uuid]) {
      o.material = this.cacheMaterials[o.uuid];
      o.visible = true;
    }
  }

  renderBloom(scene: Scene) {
    scene.traverse(this.darkenNonBloomed.bind(this));
    this.bloomComposer?.render();
    scene.traverse(this.restoreMaterial.bind(this));
  }

  render(scene: Scene, camera: Camera) {
    if (this.finalComposer) {
      this.renderBloom(scene);
      this.finalComposer?.render();
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

    if (this.bloomComposer) {
      this.bloomComposer.setSize(width, height);
    }

    if (this.finalComposer) {
      this.finalComposer.setSize(width, height);
    }
  }

  addShadow() {
    if (this.renderer) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap
    }
  }
}
