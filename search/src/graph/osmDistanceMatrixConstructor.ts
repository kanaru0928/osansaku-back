import { Coordinate } from '../geometry/coordinate';
import { OSRMAdaptor } from '../pathSearch/osrmAdaptor';
import { DistanceMatrixConstructor } from './distanceMatrixConstructor';
import { DistanceMatrixGraph } from './distanceMatrixGraph';

export class OSMDistanceMatrixConstructor implements DistanceMatrixConstructor {
  private pathSearcher = new OSRMAdaptor();

  async getGraph(places: Coordinate[]): Promise<DistanceMatrixGraph> {
    const numNodes = places.length;

    const ret = new DistanceMatrixGraph(numNodes);
    ret.nodes = places.map((v) => {
      return { coordinate: v.clone() };
    });

    for (let i = 0; i < numNodes; i++) {
      for (let j = 0; j < numNodes; j++) {
        if (i !== j) {
          ret.graph[i][j] = await this.pathSearcher.getDistance(
            places[i],
            places[j],
          );
        } else {
          ret.graph[i][j] = 0;
        }
      }
    }

    return ret;
  }
}
