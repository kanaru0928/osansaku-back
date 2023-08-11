import { Geocoding } from './geocoding/geocoding';

(async () => {
  const geocoding = new Geocoding(Geocoding.Method.Nominatim);
  console.log(
    await geocoding.getGeocode('University of Electro-Communications'),
  );
})();
