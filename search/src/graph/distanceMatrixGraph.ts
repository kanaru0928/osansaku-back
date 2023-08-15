import { DistanceMatrix } from './distanceMatrix';
import { Edges } from './edges';
import { Graph } from './graph';

export class DistanceMatrixGraph extends Graph {
  graph: DistanceMatrix = new DistanceMatrix();

  constructor(numNode?: number) {
    super(numNode);
    if (typeof numNode !== 'undefined') {
      for (let i = 0; i < numNode; i++) {
        this.graph[i] = new Array(numNode);
      }
    }
  }
}
