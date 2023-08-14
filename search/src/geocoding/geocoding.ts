import { Coordinate } from '../geometry/coordinate';
import { Exception } from '../utils/exception';
import { Geocode } from './geocode';

/**
 * 地理情報を取得する
 */
export class Geocoding {
  /**
   * 取得する方法
   */
  private method: Geocoding.Method;
  private NOMINATIM_URL = 'http://nominatim.openstreetmap.org/search';

  /**
   * クラスの初期化
   * @param method 取得する方法
   */
  constructor(method: Geocoding.Method) {
    this.method = method;
  }

  /**
   * nominatim APIを用いたGeocoding
   * @param query 検索文字列
   * @returns 地理情報の`Promise`
   */
  private async nominatim(query: string) {
    const request: Geocoding.NominatimRequest = {
      q: query,
      format: 'json',
      limit: '1',
    };
    const params = new URLSearchParams(request);
    console.log(`requesting to ${this.NOMINATIM_URL}?${params} ...`);
    const rawResponse = await fetch(`${this.NOMINATIM_URL}?${params}`).then(
      (response) => response.json(),
    );
    if (rawResponse.length === 0) {
      console.log(rawResponse);
      throw new Error(Exception.GEOCODE_NOT_FOUND);
    }
    const geocode: Geocode = {
      coordinate: new Coordinate(rawResponse[0].lat, rawResponse[0].lon),
    };
    return geocode;
  }

  /**
   * 文字列から地理情報を取得
   * @param query 検索する文字列
   * @returns 地理情報の`Promise`
   */
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
  /**
   * 取得方法の列挙
   */
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
