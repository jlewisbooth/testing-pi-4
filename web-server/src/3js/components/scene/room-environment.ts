import * as THREE from "three";

class Room extends THREE.Object3D {
  constructor({ scene }: { scene: THREE.Scene }) {
    super();

    let width = 290;
    let length = 290;
    let height = 180;

    const bulbGeometry = new THREE.SphereBufferGeometry(1.5, 16, 8);
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(
        new THREE.Vector2(Math.sin(i * (Math.PI / 18) + Math.PI / 2) * 6, i - 3)
      );
    }
    const shadeGeometry = new THREE.LatheBufferGeometry(points);
    const wireGeometry = new THREE.CylinderBufferGeometry(1, 1, 100);
    wireGeometry.translate(0, 50, 0);

    this.bulbLightNorth = new THREE.PointLight(0xffee88, 0, 500, 1.3);
    this.bulbLightNorth.shadow.mapSize.width = 4096 / 4;
    this.bulbLightNorth.shadow.mapSize.height = 4096 / 4;
    this.bulbLightNorth.power = 50700;

    this.bulbLightSouth = new THREE.PointLight(0xffee88, 0, 500, 1.3);
    this.bulbLightSouth.shadow.mapSize.width = 4096 / 4;
    this.bulbLightSouth.shadow.mapSize.height = 4096 / 4;
    this.bulbLightSouth.power = 50700;

    let bulbMat = new THREE.MeshStandardMaterial({
      emissive: 0xffffff,
      emissiveIntensity: 3,
      color: 0xffffff,
    });
    let shadeMat = new THREE.MeshStandardMaterial({
      color: 0x540096,
      side: THREE.DoubleSide,
    });

    let shadeMeshNorth = new THREE.Mesh(shadeGeometry, shadeMat);
    let shadeMeshSouth = new THREE.Mesh(shadeGeometry, shadeMat);

    let wireMeshNorth = new THREE.Mesh(wireGeometry, shadeMat);
    let wireMeshSouth = new THREE.Mesh(wireGeometry, shadeMat);

    // shadeMeshNorth.receiveShadow = true;
    shadeMeshNorth.castShadow = true;
    shadeMeshSouth.castShadow = true;

    this.bulbLightNorth.add(new THREE.Mesh(bulbGeometry, bulbMat));
    this.bulbLightNorth.add(shadeMeshNorth);
    this.bulbLightNorth.add(wireMeshNorth);

    this.bulbLightNorth.position.set(-10, 45, -20);
    this.bulbLightNorth.castShadow = true;

    this.bulbLightSouth.add(new THREE.Mesh(bulbGeometry, bulbMat));
    this.bulbLightSouth.add(shadeMeshSouth);
    this.bulbLightSouth.add(wireMeshSouth);

    this.bulbLightSouth.position.set(18, 45, 55);
    this.bulbLightSouth.castShadow = true;

    scene.add(this.bulbLightNorth);
    scene.add(this.bulbLightSouth);

    let hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 10);
    scene.add(hemiLight);

    // floor
    let floorMat = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      color: 0xffffff,
      metalness: 0.2,
      bumpScale: 0.004,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/textures/hardwood2_diffuse.jpeg", function (map) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(10, 24);
      map.encoding = THREE.sRGBEncoding;
      floorMat.map = map;
      floorMat.needsUpdate = true;
    });
    textureLoader.load("/textures/hardwood2_bump.jpeg", function (map) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(10, 24);
      floorMat.bumpMap = map;
      floorMat.needsUpdate = true;
    });
    textureLoader.load("/textures/hardwood2_roughness.jpeg", function (map) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 4;
      map.repeat.set(10, 24);
      floorMat.roughnessMap = map;
      floorMat.needsUpdate = true;
    });

    const floorGeometry = new THREE.PlaneGeometry(width, length);
    this.floorMesh = new THREE.Mesh(floorGeometry, floorMat);
    this.floorMesh.receiveShadow = true;
    this.floorMesh.rotation.x = -Math.PI / 2.0;
    this.floorMesh.position.set(0, -27, 0);

    this.add(this.floorMesh);

    // room walls
    const geometry = new THREE.CylinderGeometry(
      width / 2 + 12,
      length / 2 + 12,
      height,
      8
    );
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xfffdd0,
      side: THREE.BackSide,
    });
    const cube = new THREE.Mesh(geometry, material);

    cube.rotateY(Math.PI / 8);
    this.add(cube);

    // wall artwork - ublogo
    const ubLogo = new THREE.PlaneGeometry(93, 20);
    let ubLogoMat = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load(
      "/textures/utterberry-logo-standard.png",
      function (map) {
        ubLogoMat.map = map;
        ubLogoMat.needsUpdate = true;
      }
    );

    let ubMesh = new THREE.Mesh(ubLogo, ubLogoMat);
    ubMesh.position.set(0, 35, -(width - 1) / 2);

    this.add(ubMesh);

    // wall artwork - ai head
    const aiHead = new THREE.PlaneGeometry(40, 55);
    let aiHeadMat = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/ai.png", function (map) {
      aiHeadMat.map = map;
      aiHeadMat.needsUpdate = true;
    });

    let aiHeadMesh = new THREE.Mesh(aiHead, aiHeadMat);
    aiHeadMesh.position.set(0, 35, (width - 1) / 2);
    aiHeadMesh.rotateY(Math.PI);

    this.add(aiHeadMesh);

    // wall artwork - ai head
    const leeds = new THREE.PlaneGeometry(40 * 2, 55 * 2);
    let leedsMat = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/leeds-building-nobg.png", function (map) {
      leedsMat.map = map;
      leedsMat.needsUpdate = true;
    });

    let leedsMesh = new THREE.Mesh(leeds, leedsMat);
    leedsMesh.position.set((width - 1) / 2, 28, 0);
    leedsMesh.rotateY(-Math.PI / 2);

    this.add(leedsMesh);

    // wall artwork - ai head
    const london = new THREE.PlaneGeometry(40 * 2, 55 * 2);
    let londonMat = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/london-building-nobg.png", function (map) {
      londonMat.map = map;
      londonMat.needsUpdate = true;
    });

    let londonMesh = new THREE.Mesh(london, londonMat);
    londonMesh.position.set(-(width - 1) / 2, 28, 0);
    londonMesh.rotateY(Math.PI / 2);

    this.add(londonMesh);
  }

  bulbLightNorth: THREE.PointLight;
  bulbLightSouth: THREE.PointLight;
  floorMesh: THREE.Mesh;
}

export default Room;
