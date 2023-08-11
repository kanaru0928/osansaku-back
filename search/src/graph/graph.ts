import { Edges } from './edges';
import { GraphNode } from './graphNode';

export class Graph {
  graph: Edges = new Edges();
  nodes: GraphNode[] = new Array();
}
