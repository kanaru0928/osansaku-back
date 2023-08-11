import { DistanceMatrix } from "./distanceMatrix";
import { Graph } from "./graph";

export class DistanceMatrixGraph extends Graph{
  graph: DistanceMatrix = new DistanceMatrix();
}
