import { inspect } from 'util';
import { Geocoding } from './geocoding/geocoding';
import { OSMDistanceMatrixConstructor } from './graph/osmDistanceMatrixConstructor';

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
  console.log(
    inspect(await distanceMatrixConstructor.getGraph(places), { depth: null }),
  );
})();
