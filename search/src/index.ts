import { inspect } from 'util';
import { Geocoding } from './geocoding/geocoding';
import { OSMDistanceMatrixConstructor } from './graph/osmDistanceMatrixConstructor';

(async () => {
  const geocoding = new Geocoding(Geocoding.Method.NominatimLocal);
  const places = [
    (await geocoding.getGeocode('university of electro-communications'))
      .coordinate,
    (
      await geocoding.getGeocode(
        'tokyo university of agriculture and technology',
      )
    ).coordinate,
    (await geocoding.getGeocode('chofu station')).coordinate,
    (await geocoding.getGeocode('fuchu station')).coordinate,
  ];
  const distanceMatrixConstructor = new OSMDistanceMatrixConstructor();
  console.log(
    inspect(await distanceMatrixConstructor.getGraph(places), { depth: null }),
  );
})();
