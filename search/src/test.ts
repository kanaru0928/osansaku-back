import { inspect } from 'util';
import { Geocoding } from './geocoding/geocoding';
import { OSMDistanceMatrixConstructor } from './graph/osmDistanceMatrixConstructor';
import { ORToolsAdaptor } from './orderSearch/ortoolsAdaptor';
import { Places } from './orderSearch/places';
import { Randomizer } from './randomizer/randomizer';
import { Route } from './geometry/route';
import { Coordinate } from './geometry/coordinate';
import { writeFile } from 'fs';

(async () => {
  const geocoding = new Geocoding(Geocoding.Method.NominatimLocal);
  const placesPromise = [
    geocoding.getGeocode('府中駅'),
    geocoding.getGeocode('府中の森'),
    geocoding.getGeocode('東京競馬場'),
    geocoding.getGeocode('関戸橋'),
    geocoding.getGeocode('東京農工大'),
    geocoding.getGeocode('府中駅'),
  ];

  const places = (await Promise.all(placesPromise)).map((g) => g.coordinate);
  const distanceMatrixConstructor = new OSMDistanceMatrixConstructor();
  const distanceMatrix = await distanceMatrixConstructor.getGraph(places);
  console.log(inspect(distanceMatrix, { depth: null }));

  const ortoolsAdaptor = new ORToolsAdaptor();
  const placeCollection = new Places();
  placeCollection.places = places.map((v) => {
    return { location: v };
  });

  const END_TIME = 18000;

  placeCollection.startNode = 0;
  placeCollection.endNode = places.length - 1;
  placeCollection.places[placeCollection.startNode].open = 0;
  placeCollection.places[placeCollection.endNode].open = END_TIME;
  placeCollection.places[placeCollection.endNode].close = END_TIME;
  placeCollection.places[2].open = 9000;

  const order = await ortoolsAdaptor.search(
    placeCollection,
    distanceMatrix.graph,
  );
  console.log(order);

  const randomizer = new Randomizer();
  const routes: Promise<Route>[] = new Array(order.times.length);
  for (let i = 0; i < routes.length; i++) {
    let randomizeLocation: Coordinate[] = [];
    for (let j = order.times[i].from; j <= order.times[i].to; j++) {
      randomizeLocation.push(places[order.order[j]]);
    }
    routes[i] = randomizer.randomize(randomizeLocation, order.times[i].time, {
      id: i,
    });
  }
  const route = await Promise.all(routes);
  // console.log(JSON.stringify(Route.toGeojson(route)));
  writeFile('out.json', JSON.stringify(Route.toGeojson(...route)), () => {
    console.log('write end');
  });
  console.log(
    `duration: ${route.reduce((prev, r) => prev + r.allDistance, 0)}`,
  );
})();
