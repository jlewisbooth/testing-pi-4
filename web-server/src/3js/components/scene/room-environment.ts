import * as THREE from "three";

class Room extends THREE.Object3D {
  constructor({ scene }: { scene: THREE.Scene }) {
    super();

    let width = 305;
    let length = 305;
    let height = 180;

    const bulbGeometry = new THREE.SphereBufferGeometry(1.5, 16, 8);
    const points = [];
    for (let i = 0; i < 10; i++) {
      points.push(
        new THREE.Vector2(Math.sin(i * (Math.PI / 18) + Math.PI / 2) * 6, i - 3)
      );
    }
    const shadeGeometry = new THREE.LatheBufferGeometry(points, 32);
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
      color: 0xb87333,
      side: THREE.DoubleSide,
      metalness: 0.5,
      roughness: 0,
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

    this.bulbLightNorth.position.set(-10, 55, -20);
    this.bulbLightNorth.castShadow = true;

    this.bulbLightSouth.add(new THREE.Mesh(bulbGeometry, bulbMat));
    this.bulbLightSouth.add(shadeMeshSouth);
    this.bulbLightSouth.add(wireMeshSouth);

    this.bulbLightSouth.position.set(18, 55, 55);
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

    const floorGeometry = new THREE.PlaneBufferGeometry(width, length);
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
    const material = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      side: THREE.BackSide,
    });
    const cube = new THREE.Mesh(geometry, material);

    cube.rotateY(Math.PI / 8);
    this.add(cube);

    // wall artwork - ublogo
    const ubLogo = new THREE.PlaneBufferGeometry(93, 20);
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
    ubMesh.position.set(0, 31, 0);

    const ubLogo2 = new THREE.PlaneBufferGeometry(93, 20);
    let ubLogoMat2 = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/utterberry-logo-0F9645.png", function (map) {
      ubLogoMat2.map = map;
      ubLogoMat2.needsUpdate = true;
    });

    let ubMesh2 = new THREE.Mesh(ubLogo2, ubLogoMat2);
    ubMesh2.position.set(0, 53, 0);

    const ubLogo3 = new THREE.PlaneBufferGeometry(93, 20);
    let ubLogoMat3 = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/utterberry-logo-044A20.png", function (map) {
      ubLogoMat3.map = map;
      ubLogoMat3.needsUpdate = true;
    });

    let ubMesh3 = new THREE.Mesh(ubLogo3, ubLogoMat3);
    ubMesh3.position.set(0, 9, 0);

    const ubLogo4 = new THREE.PlaneBufferGeometry(93, 20);
    let ubLogoMat4 = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/utterberry-logo-2D074A.png", function (map) {
      ubLogoMat4.map = map;
      ubLogoMat4.needsUpdate = true;
    });

    let ubMesh4 = new THREE.Mesh(ubLogo4, ubLogoMat4);
    ubMesh4.position.set(0, -13, 0);

    const ubLogo5 = new THREE.PlaneBufferGeometry(93, 20);
    let ubLogoMat5 = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/utterberry-logo-96640F.png", function (map) {
      ubLogoMat5.map = map;
      ubLogoMat5.needsUpdate = true;
    });

    let ubMesh5 = new THREE.Mesh(ubLogo5, ubLogoMat5);
    ubMesh5.position.set(0, 75, 0);

    let ubBannerWall = new THREE.Object3D();
    ubBannerWall.add(ubMesh);
    ubBannerWall.add(ubMesh2);
    ubBannerWall.add(ubMesh3);
    ubBannerWall.add(ubMesh4);
    ubBannerWall.add(ubMesh5);

    ubBannerWall.position.set(0, 0, -(width - 2) / 2);

    this.add(ubBannerWall);

    let ubBannerWall2 = ubBannerWall.clone();

    ubBannerWall2.position.set(0, 0, (width - 2) / 2);
    ubBannerWall2.rotateY(Math.PI);
    this.add(ubBannerWall2);

    let ubBannerWall3 = ubBannerWall.clone();

    ubBannerWall3.position.set((width - 2) / 2, 0, 0);
    ubBannerWall3.rotateY(-Math.PI / 2);
    this.add(ubBannerWall3);

    let ubBannerWall4 = ubBannerWall.clone();

    ubBannerWall4.position.set(-(width - 2) / 2, 0, 0);
    ubBannerWall4.rotateY(Math.PI / 2);
    this.add(ubBannerWall4);

    // wall artwork - ai head
    const aiHead = new THREE.PlaneBufferGeometry(40 * 1.5, 55 * 1.5);
    let aiHeadMat = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/ai.png", function (map) {
      aiHeadMat.map = map;
      aiHeadMat.needsUpdate = true;
    });

    let aiHeadMesh = new THREE.Mesh(aiHead, aiHeadMat);
    aiHeadMesh.position.set(0, 33, (width - 2) / 2);
    aiHeadMesh.rotateY(Math.PI);

    let aiHeadPivot = new THREE.Object3D();
    aiHeadPivot.add(aiHeadMesh);
    aiHeadPivot.rotateY(-Math.PI / 4);

    this.add(aiHeadPivot);

    // wall artwork - ai head
    const leeds = new THREE.PlaneBufferGeometry(40 * 1.5, 55 * 1.5);
    let leedsMat = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/leeds-building-nobg.png", function (map) {
      leedsMat.map = map;
      leedsMat.needsUpdate = true;
    });

    let leedsMesh = new THREE.Mesh(leeds, leedsMat);
    leedsMesh.position.set((width - 2) / 2, 30, 0);
    leedsMesh.rotateY(-Math.PI / 2);

    let leedsPivot = new THREE.Object3D();
    leedsPivot.add(leedsMesh);
    leedsPivot.rotateY(-Math.PI / 4);

    this.add(leedsPivot);

    // wall artwork - ai head
    const london = new THREE.PlaneBufferGeometry(40 * 1.6, 55 * 1.6);
    let londonMat = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/london-building-nobg.png", function (map) {
      londonMat.map = map;
      londonMat.needsUpdate = true;
    });

    let londonMesh = new THREE.Mesh(london, londonMat);
    londonMesh.position.set(-(width - 2) / 2, 30, 0);
    londonMesh.rotateY(Math.PI / 2);

    let londonPivot = new THREE.Object3D();
    londonPivot.add(londonMesh);
    londonPivot.rotateY(-Math.PI / 4);

    this.add(londonPivot);

    // wall artwork - 5g
    const fiveG = new THREE.PlaneBufferGeometry(40 * 1.6, 30 * 1.6);
    let fiveGMat = new THREE.MeshStandardMaterial({
      color: 0xfffdd0,
      transparent: true,
    });

    textureLoader.load("/textures/5g-logo.png", function (map) {
      fiveGMat.map = map;
      fiveGMat.needsUpdate = true;
    });

    let fiveGMesh = new THREE.Mesh(fiveG, fiveGMat);
    fiveGMesh.position.set(0, 30, -(width - 2) / 2);
    fiveGMesh.rotateY(0);

    let fiveGPivot = new THREE.Object3D();
    fiveGPivot.add(fiveGMesh);
    fiveGPivot.rotateY(-Math.PI / 4);

    this.add(fiveGPivot);

    // skirting board to break up floor to walls
    const skirtGeometry = new THREE.TorusBufferGeometry(
      width / 2 + 13.5,
      2,
      30,
      8
    );

    const skirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x434a00,
      metalness: 0.4,
      roughness: 0.1,
    });

    const bottomSkirt = new THREE.Mesh(skirtGeometry, skirtMaterial);
    const topSkirt = new THREE.Mesh(skirtGeometry, skirtMaterial);

    bottomSkirt.position.copy(new THREE.Vector3(0, -27.4, 0));
    bottomSkirt.setRotationFromEuler(
      new THREE.Euler(Math.PI / 2, 0, -Math.PI / 8, "XYZ")
    );

    topSkirt.position.copy(new THREE.Vector3(0, 90.7, 0));
    topSkirt.setRotationFromEuler(
      new THREE.Euler(Math.PI / 2, 0, -Math.PI / 8, "XYZ")
    );

    this.add(bottomSkirt);
    this.add(topSkirt);

    // shirting board for walls

    const skirtWallGeometry = new THREE.CylinderBufferGeometry(
      0.5,
      0.5,
      90 + 27,
      6
    );
    skirtWallGeometry.translate(0, 90 / 2 - 27 / 2, 0);

    let skirtWallPivot = new THREE.Object3D();

    for (let i = 0; i < Math.PI * 2; i += Math.PI / 4) {
      let skirtWall = new THREE.Mesh(skirtWallGeometry, skirtMaterial);
      let position = new THREE.Vector3(
        (Math.cos(i) * (width + 23.5)) / 2,
        0,
        (Math.sin(i) * (width + 23.5)) / 2
      );

      skirtWall.position.copy(position);

      skirtWallPivot.add(skirtWall);
    }

    skirtWallPivot.rotateY(Math.PI / 8);

    this.add(skirtWallPivot);

    this.matrixAutoUpdate = false;
    this.updateMatrix();
  }

  bulbLightNorth: THREE.PointLight;
  bulbLightSouth: THREE.PointLight;
  floorMesh: THREE.Mesh;
}

export default Room;
