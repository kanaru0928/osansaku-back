import { BBox } from '../geometry/bbox';
import { Coordinate } from '../geometry/coordinate';
import { Route } from '../geometry/route';
import { OSMDistanceMatrixConstructor } from '../graph/osmDistanceMatrixConstructor';
import { ORToolsAdaptor } from '../orderSearch/ortoolsAdaptor';
import { Place } from '../orderSearch/place';
import { Places } from '../orderSearch/places';
import { OverpassAdaptor } from './overpassAdaptor';
import { RandomizerTemplate } from './randomizerTemplate';

export class Randomizer implements RandomizerTemplate {
  private calcBBox(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): [number, number, number, number] {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const m = dy / dx;
    const theta = Math.PI / 4 - Math.atan(m);
    const s = Math.sin(theta);
    const c = Math.cos(theta);
    const b1 = (-dx * c - -dy * s + x1 + x2) / 2;
    const b2 = (-dx * s + -dy * c + y1 + y2) / 2;
    const b3 = (dx * c - dy * s + x1 + x2) / 2;
    const b4 = (dx * s + dy * c + y1 + y2) / 2;
    return [
      Math.min(b1, b3),
      Math.min(b2, b4),
      Math.max(b1, b3),
      Math.max(b2, b4),
    ];
  }

  async randomize(from: Coordinate, to: Coordinate, time: number) {

    // TODO: randomizeは全体を含めて行う

    const overpass = new OverpassAdaptor();

    const bbox = BBox.fromArray(
      this.calcBBox(from.lat, from.lng, to.lat, to.lng),
    );
    const amenities = await overpass.getAllAmenity(bbox);

    const distanceMatrixConstrutor = new OSMDistanceMatrixConstructor();
    const coordinates = [from].concat(amenities, [to]);
    const distanceMatrix = (
      await distanceMatrixConstrutor.getGraph(coordinates)
    ).graph;

    const orderSearcher = new ORToolsAdaptor();
    const endNode = coordinates.length - 1;
    const places = new Places();
    places.startNode = 0;
    places.endNode = endNode;
    places.places = coordinates.map((c) => {
      return {
        location: c,
      };
    });
    places.places[places.startNode].open = 0;
    places.places[endNode].open = time;
    places.places[endNode].close = time;
    distanceMatrix[endNode][places.startNode] = 0;
    const orderTime = await orderSearcher.search(places, distanceMatrix);
  }
}
