import { Vector3, Mesh } from "three";

function getSpacedPoints(points: Vector3[], numOfEqualSpaces: number) {
  // Assuming points are formatted as a connected, ordered graph

  // first find the total length of the track
  let trackLength: number = 0;
  let pointDistances: number[] = [0];

  let spacedPoints: Vector3[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    let dist = points[i].distanceTo(points[i + 1]);
    trackLength += dist;

    pointDistances.push(dist);
  }

  let pointDistance = trackLength / numOfEqualSpaces;
  let distanceCovered = 0;
  let lastSpacedNode: Vector3 = points[0];
  let spacedPoint: Vector3 = points[0];

  spacedPoints.push(spacedPoint);

  for (let i = 0; i < pointDistances.length; i++) {
    // dist is the distance between i+1 and i
    let dis = pointDistances[i];
    distanceCovered += dis;

    if (distanceCovered > pointDistance) {
      // add steps between points to cover distance
      let step = 1;

      while (distanceCovered > pointDistance) {
        let node1 = lastSpacedNode;
        let node2 = points[i];

        let direction = new Vector3(
          node2.x - node1.x,
          node2.y - node1.y,
          node2.z - node1.z
        ).normalize();

        spacedPoint = new Vector3(
          direction.x * pointDistance * step + node1.x,
          direction.y * pointDistance * step + node1.y,
          direction.z * pointDistance * step + node1.z
        );
        spacedPoints.push(spacedPoint);

        distanceCovered -= pointDistance;
        step++;
      }

      lastSpacedNode = spacedPoint;
    }
  }

  return spacedPoints;
}

function laymansEuclideanGraph(startPoint: Vector3, points: Vector3[]) {
  let currentNode: Vector3 = startPoint;
  let sortedPoints: Vector3[] = [];
  let suspectPoints: Vector3[] = points.slice();

  while (suspectPoints.length > 0) {
    // find closest point
    let suspectIndex: number = -1;
    let minDis: number = Infinity;
    for (let i = 0; i < suspectPoints.length; i++) {
      let dis = currentNode.distanceTo(suspectPoints[i]);
      if (dis < minDis) {
        minDis = dis;
        suspectIndex = i;
      }
    }

    if (suspectIndex === -1) {
      console.log("SORTING ERROR");
      break;
    }

    let candidate = new Vector3().copy(suspectPoints[suspectIndex]);
    sortedPoints.push(candidate);
    currentNode = candidate;

    suspectPoints.splice(suspectIndex, 1);
  }

  return sortedPoints;
}

export function parseTrackModelForPoints(
  model: Mesh,
  startPoint: Vector3
): Vector3[] | null {
  if (!model.geometry) {
    console.log("PARSING ERROR: NO GEOMETRY");
    return null;
  }

  if (model.geometry && !model.geometry.isBufferGeometry) {
    console.log("PARSING ERROR: NOT BUFFER GEOMETRY");
    return null;
  }

  let points = model.geometry.attributes.position.array;
  let indexArray = model.geometry?.index?.array;
  /* 
      This function should only parse objects that have one single line
      on top of the other, this is just a fast way to transfer
      the track lines from a model to js object and use it to make
      the track lines in software.
    */

  let maxY = -Infinity;

  let coords: [number, number, number][] = [];
  let vecCoords: Vector3[] = [];
  let seenIndexes: number[] = [];

  let max: [number, number, number] = [0, 0, -Infinity];

  if (indexArray) {
    // @ts-ignore
    for (let index of indexArray) {
      if (!seenIndexes.includes(index)) {
        coords.push([
          points[3 * index],
          points[3 * index + 1],
          points[3 * index + 2],
        ]);

        if (points[3 * index] > max[2]) {
          max = [
            points[3 * index],
            points[3 * index + 1],
            points[3 * index + 2],
          ];
        }

        if (points[3 * index + 1] > maxY) {
          maxY = points[3 * index + 1];
        }
      }
      seenIndexes.push(index);
    }

    for (let coord of coords) {
      if (coord[1] === maxY) {
        let vec = new Vector3(coord[0], coord[1], coord[2]);
        vecCoords.push(vec);
      }
    }

    let sortedPoints = laymansEuclideanGraph(startPoint, vecCoords);

    let spacedPoints = getSpacedPoints(sortedPoints, 800);

    return spacedPoints;
  } else {
    console.log("PARSING ERROR: NO INDEX ARRAY");

    return null;
  }
}

function dist(
  [x1, y1, z1]: [number, number, number],
  [x2, y2, z2]: [number, number, number]
) {
  let x = x1 - x2;
  let z = z1 - z2;
  return Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));
}
