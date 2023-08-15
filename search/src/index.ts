import { Geocoding } from './geocoding/geocoding';

(async () => {
  const geocoding = new Geocoding(Geocoding.Method.NominatimLocal);
  const origin = (
    await geocoding.getGeocode('university of electro-communications')
  ).coordinate;
  const destination = (
    await geocoding.getGeocode('tokyo university of agriculture and technology')
  ).coordinate;
  console.log(`${origin.toLngLat()};${destination.toLngLat()}`);
})();
