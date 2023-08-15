import { Edges } from './edges';
import { GraphNode } from './graphNode';

export class Graph {
  graph: Edges;
  nodes: GraphNode[];

  constructor(numNode?: number) {
    if (typeof numNode !== 'undefined') {
      this.nodes = new Array(numNode);
      this.graph = new Edges(numNode);
    } else {
      this.nodes = new Array();
      this.graph = new Edges();
    }
  }
}
