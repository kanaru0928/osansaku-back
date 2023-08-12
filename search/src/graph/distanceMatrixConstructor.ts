import { DistanceMatrixGraph } from './distanceMatrixGraph';
import { GraphConstructor } from './graphConstructor';

export class DistanceMatrixConstructor implements GraphConstructor {
  async getGraph(option: any): Promise<DistanceMatrixGraph> {}
}
