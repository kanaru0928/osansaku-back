/**
 * 座標を表すクラス
 */
export class Coordinate {
  lat: number;
  lng: number;

  /**
   * 初期化関数
   * @param lat 緯度
   * @param lng 経度
   */
  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }

  /**
   * 座標を文字列に変換
   * @param separator 区切り文字
   * @returns 緯度,経度の順の文字列
   */
  toLatLng(separator = ',') {
    return `${this.lat}${separator}${this.lng}`;
  }

  /**
   * 座標を文字列に変換
   * @param separator 区切り文字
   * @returns 経度,緯度の順の文字列
   */
  toLngLat(separator = ',') {
    return `${this.lng}${separator}${this.lat}`;
  }

  clone() {
    return new Coordinate(this.lat, this.lng);
  }

  toString(): string {
    return this.toLatLng();
  }

  /**
   * 配列`[経度,緯度]`から`Coordinate`を生成
   * @param param0 配列
   * @returns `Coordinate`オブジェクト
   */
  static fromLngLat([lng, lat]: [number, number]) {
    return new Coordinate(lat, lng);
  }

  /**
   * 配列`[緯度,経度]`から`Coordinate`を生成
   * @param param0 配列
   * @returns `Coordinate`オブジェクト
   */
  static fromLatLng([lat, lng]: [number, number]) {
    return new Coordinate(lat, lng);
  }
}
