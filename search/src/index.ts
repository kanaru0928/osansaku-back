import { inspect } from 'util';
import { Geocoding } from './geocoding/geocoding';
import { OSMDistanceMatrixConstructor } from './graph/osmDistanceMatrixConstructor';
import { ORToolsAdaptor } from './orderSearch/ortoolsAdaptor';
import { Places } from './orderSearch/places';

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
  placeCollection.startNode = 0;
  placeCollection.endNode = places.length - 1;
  placeCollection.places[placeCollection.startNode].open = 0;
  placeCollection.places[placeCollection.endNode].open = 18000;
  placeCollection.places[placeCollection.endNode].close = 18000;
  placeCollection.places[2].open = 9000;

  const order = await ortoolsAdaptor.search(placeCollection, distanceMatrix.graph);
  console.log(order);
})();
