export class Coordinate {
  lat: number;
  lng: number;

  constructor(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  }

  toLatLng(separator = ',') {
    return `${this.lat}${separator}${this.lng}`;
  }

  toLngLat(separator = ',') {
    return `${this.lng}${separator}${this.lat}`;
  }

  static fromLngLat([lng, lat]: [number, number]) {
    return new Coordinate(lat, lng);
  }

  static fromLatLng([lat, lng]: [number, number]) {
    return new Coordinate(lat, lng);
  }
}
