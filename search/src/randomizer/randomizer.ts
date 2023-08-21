import { BBox } from '../geometry/bbox';
import { Coordinate } from '../geometry/coordinate';
import { Route } from '../geometry/route';
import { OSMDistanceMatrixConstructor } from '../graph/osmDistanceMatrixConstructor';
import { ORToolsAdaptor } from '../orderSearch/ortoolsAdaptor';
import { Place } from '../orderSearch/place';
import { Places } from '../orderSearch/places';
import { OSRMAdaptor } from '../pathSearch/osrmAdaptor';
import { OverpassAdaptor } from './overpassAdaptor';
import { RandomizerTemplate } from './randomizerTemplate';

export class Randomizer implements RandomizerTemplate {
  private calcBBox(x1: number, y1: number, x2: number, y2: number): BBox {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const r = Math.sqrt(dx * dx + dy * dy) / 2;
    const p = (x1 + x2) / 2;
    const q = (y1 + y2) / 2;
    const b1 = p - r;
    const b2 = q - r;
    const b3 = p + r;
    const b4 = q + r;
    return BBox.fromArray([
      Math.min(b1, b3),
      Math.min(b2, b4),
      Math.max(b1, b3),
      Math.max(b2, b4),
    ]);
  }

  async randomize(
    locations: Coordinate[],
    time: number,
    option?: { id: number },
  ) {
    // TODO: randomizeは全体を含めて行う

    const overpass = new OverpassAdaptor();
    // let bbox: BBox = BBox.fromArray([90, 180, -90, -180]);
    // for (let i = 0; i < locations.length; i++) {
    //   bbox.south = Math.min(locations[i].lat, bbox.south);
    //   bbox.west = Math.min(locations[i].lng, bbox.west);
    //   bbox.north = Math.max(locations[i].lat, bbox.north);
    //   bbox.east = Math.max(locations[i].lng, bbox.east);
    // }
    // const amenities = await overpass.getAllAmenity(bbox);
    // console.log(`amenities found in ${BBox.toArray(bbox).join()}`);
    // console.log(amenities);

    let amenityReqests: Promise<Coordinate[]>[] = new Array(
      locations.length - 1,
    );
    for (let i = 0; i < locations.length - 1; i++) {
      const p1 = locations[i].toLatLngArray();
      const p2 = locations[i + 1].toLatLngArray();
      amenityReqests[i] = overpass.getAllAmenity(
        this.calcBBox(p1[0], p1[1], p2[0], p2[1]),
      );
    }
    const amenitySet = new Set(
      (await Promise.all(amenityReqests)).flat().map((c) => c.toLatLng()),
    );
    const amenities = Array.from(amenitySet).map(
      (s) =>
        new Coordinate(...(s.split(',').map(parseFloat) as [number, number])),
    );

    console.log(`randomizer ${option?.id}: got amenity`);

    const distanceMatrixConstrutor = new OSMDistanceMatrixConstructor();
    const coordinates = locations.concat(amenities);
    // const coordinates = locations;
    const distanceMatrix = (
      await distanceMatrixConstrutor.getGraph(coordinates)
    ).graph;
    console.log(`randomizer${option?.id}: graphed`);

    const orderSearcher = new ORToolsAdaptor();
    const endNode = locations.length - 1;
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
    places.maxWaiting = 0;
    places.withoutCost = true;
    distanceMatrix[endNode][places.startNode] = 0;

    for (let i = endNode + 1; i < places.places.length; i++) {
      places.places[i].penalty = Math.round(time / 60);
    }
    const order = (await orderSearcher.search(places, distanceMatrix)).order;
    console.log(`randomizer${option?.id}: orderd`);

    const pathSearcher = new OSRMAdaptor();
    const routes: Promise<Route>[] = Array(order.length - 1);
    for (let i = 0; i < order.length - 1; i++) {
      routes[i] = pathSearcher.search(
        places.places[order[i]].location,
        places.places[order[i + 1]].location,
      );
    }

    const ret = await Promise.all(routes);
    console.log(`randomizer${option?.id}: finished`);
    return ret;
  }
}
