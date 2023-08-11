import { Geocode } from './geocode';

export class Geocoding {
  method: Geocoding.Method;
  private NOMINATIM_URL = 'http://nominatim.openstreetmap.org/search';

  constructor(method: Geocoding.Method) {
    this.method = method;
  }

  private async nominatim(query: string) {
    const request: Geocoding.NominatimRequest = {
      q: query,
      format: 'json',
      limit: '1',
    };
    const params = new URLSearchParams(request);
    const rawResponse = await fetch(`${this.NOMINATIM_URL}?${params}`).then(
      (response) => response.json(),
    );
    const geocode: Geocode = {
      coordinate: {
        lat: rawResponse[0].lat,
        lng: rawResponse[0].lon,
      },
    };
    return geocode;
  }

  public async getGeocode(query: string): Promise<Geocode> {
    switch (this.method) {
      case Geocoding.Method.Nominatim:
        return this.nominatim(query);
      default:
        throw new Error('無効な`method`');
    }
  }
}

export namespace Geocoding {
  export enum Method {
    Unset = 'UNSET',
    Nominatim = 'NOMINATIM',
  }

  export type NominatimRequest = {
    format: 'json';
    q: string;
    limit: '1';
  };
  // export type Method = (typeof Method)[keyof typeof Method];
}
