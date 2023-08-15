import { Coordinate } from '../geometry/coordinate';
import { DistanceMatrixGraph } from './distanceMatrixGraph';
import { GraphConstructor } from './graphConstructor';

export interface DistanceMatrixConstructor extends GraphConstructor {
  getGraph(places: Coordinate[]): Promise<DistanceMatrixGraph>;
}
