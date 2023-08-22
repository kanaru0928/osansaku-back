import { Coordinate } from '../geometry/coordinate';
import { Route } from '../geometry/route';
import { DistanceMatrixConstructor } from '../graph/distanceMatrixConstructor';
import { Graph } from '../graph/graph';
import { GraphConstructor } from '../graph/graphConstructor';
import { OrderSearcher } from '../orderSearch/orderSearcher';
import { Place } from '../orderSearch/place';
import { Places } from '../orderSearch/places';
import { PathSearcher } from '../pathSearch/pathSearcher';
import { RandomizerTemplate } from '../randomizer/randomizerTemplate';

export class RouteSearch {
  private graph?: Graph;
  private timeMatrixConstructor?: DistanceMatrixConstructor;
  private orderSearcher?: OrderSearcher;
  private randomizer?: RandomizerTemplate;
  private pathSearcher?: PathSearcher;

  setGraphConstructor(graphConstructor: DistanceMatrixConstructor) {
    this.timeMatrixConstructor = graphConstructor;
  }

  setOrderSearcher(orderSearcher: OrderSearcher) {
    this.orderSearcher = orderSearcher;
  }

  setRandomizer(randomizer: RandomizerTemplate) {
    this.randomizer = randomizer;
  }

  setPathSearcher(pathSearcher: PathSearcher) {
    this.pathSearcher = pathSearcher;
  }

  async search(places: Places) {
    console.assert(
      this.timeMatrixConstructor != undefined &&
        this.orderSearcher != undefined &&
        this.randomizer != undefined &&
        this.pathSearcher != undefined,
    );

    const coordinates = places.places.map((place) => place.location);

    const timeMatrix = await this.timeMatrixConstructor!.getGraph(coordinates);

    timeMatrix.graph[places.endNode][places.startNode] = 0;

    const orderTime = await this.orderSearcher!.search(
      places,
      timeMatrix.graph,
    );

    const randomizes: Promise<Route[]>[] = new Array(orderTime.times.length);
    for (let i = 0; i < randomizes.length; i++) {
      let randomizeLocations: Coordinate[] = [];
      for (let j = orderTime.times[i].from; j <= orderTime.times[i].to; j++) {
        randomizeLocations.push(coordinates[orderTime.order[j]]);
      }
      randomizes[i] = this.randomizer!.randomize(
        randomizeLocations,
        orderTime.times[i].time,
      );
    }

    return await Promise.all(randomizes);
  }
}
