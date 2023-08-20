import { inspect } from 'util';

(async () => {
  console.log(
    inspect(
      await (
        await fetch(
          'http://osrm:5000/route/v1/walking/139.4854585229244,35.66369855;139.49186493178433,35.67657235?steps=true&overview=full&geometries=geojson',
        )
      ).json(),
      { depth: null },
    ),
  );
})();
