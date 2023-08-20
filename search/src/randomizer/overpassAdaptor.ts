import { BBox } from '../geometry/bbox';
import { Coordinate } from '../geometry/coordinate';

export class OverpassAdaptor {
  static readonly LIMIT = 5;
  static readonly ENDPOINT = 'https://overpass-api.de/api/interpreter';

  async getAllAmenity(bbox: BBox) {
    const query =
      `[out:json];node[amenity](${BBox.toArray(bbox).join()});` +
      `out ${OverpassAdaptor.LIMIT};`;
    const param = new URLSearchParams({ data: query });
    const url = `${OverpassAdaptor.ENDPOINT}?${param}`;
    console.log(`requesting to ${url}`);
    const response = await (await fetch(url)).json();
    const ret: Coordinate[] = (response['elements'] as any[]).map(
      (v) => new Coordinate(v['lat'], v['lon']),
    );
    return ret;
  }
}
