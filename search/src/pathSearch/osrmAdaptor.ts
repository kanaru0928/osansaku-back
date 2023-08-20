import { Coordinate } from '../geometry/coordinate';
import { Heading } from '../geometry/heading';
import { Intersection } from '../geometry/intersection';
import { Maneuver } from '../geometry/maneuver';
import { Route } from '../geometry/route';
import { Step } from '../geometry/step';
import { Exception } from '../utils/exception';
import { PathSearcher } from './pathSearcher';

export class OSRMAdaptor implements PathSearcher {
  private static readonly END_POINT = 'http://osrm:5000/route/v1/walking/';

  private createQuery(
    origin: Coordinate,
    destination: Coordinate,
    option?: any,
  ) {
    if (option !== undefined) {
      const query = new URLSearchParams(option);
      return `${
        OSRMAdaptor.END_POINT
      }${origin.toLngLat()};${destination.toLngLat()}?${query}`;
    } else {
      return `${
        OSRMAdaptor.END_POINT
      }${origin.toLngLat()};${destination.toLngLat()}`;
    }
  }

  private createIntersection(obj: any) {
    const bearings = obj['bearings'] as Heading[];
    const ret: Intersection = {
      location: obj['location'],
      bearings,
      in: obj['in'],
      out: obj['out'],
    };
    return ret;
  }

  private createPath(obj: any) {
    return (obj['coordinates'] as [number, number][]).map((v) =>
      Coordinate.fromLngLat(v),
    );
  }

  private createManeuver(obj: any) {
    const location = Coordinate.fromLngLat(obj['location']);
    const ret: Maneuver = {
      bearing_after: obj['bearing_after'],
      bearing_before: obj['bearing_before'],
      location,
      type: obj['type'],
      modifier: obj['modifier'],
    };
    return ret;
  }

  private createStep(obj: any) {
    const intersections = (obj['intersections'] as any[]).map((intersection) =>
      this.createIntersection(intersection),
    );
    const path = this.createPath(obj['geometry']);
    const maneuver = this.createManeuver(obj['maneuver']);
    const ret: Step = {
      intersections,
      distance: obj['distance'],
      name: obj['name'],
      path,
      maneuver,
    };
    return ret;
  }

  private createRoute(obj: any): Route {
    const primary = obj['routes'][0];

    const primaryRoute = (
      primary['geometry']['coordinates'] as [number, number][]
    ).map(Coordinate.fromLngLat);

    const steps = (primary['legs'][0]['steps'] as any[]).map((step) =>
      this.createStep(step),
    );

    // TODO: stepsをキャストして、validationをかける
    const ret: Route = {
      primaryRoute,
      steps,
      allDistance: primary['distance'],
    };

    return ret;
  }

  private errorHandle(response: any) {
    const mes = response['message'];
    switch (response['code'] as OSRMResponse) {
      case 'Ok':
        break;
      case 'InvalidUrl':
        new Error(Exception.INVALID_ENDPOINT + mes);
      case 'InvalidService':
        new Error(Exception.INVALID_ENDPOINT + mes);
      case 'InvalidVersion':
        new Error(Exception.INVALID_ENDPOINT + mes);
      case 'InvalidOptions':
        new Error(Exception.INVALID_VALUE + mes);
      case 'InvalidQuery':
        new Error(Exception.INVALID_VALUE + mes);
      case 'InvalidValue':
        new Error(Exception.INVALID_VALUE + mes);
      case 'NoSegment':
        new Error(Exception.NO_SEGMENT + mes);
      case 'TooBig':
        new Error(Exception.INVALID_VALUE + mes);
      case 'DisabledDataset':
        new Error(Exception.EXTERNAL_ERROR + mes);
      case 'NoRoute':
        new Error(Exception.ROUTE_NOT_FOUND + mes);
      default:
        new Error(Exception.UNKNOWN_ERROR + response);
    }
  }

  async getDistance(
    origin: Coordinate,
    destination: Coordinate,
  ): Promise<number> {
    const endpoint = this.createQuery(origin, destination);
    console.log(`requiesting to ${endpoint}`);
    return await fetch(endpoint)
      .then((response) => response.json())
      .then((response) => {
        this.errorHandle(response);
        return response['routes'][0]['distance'];
      });
  }

  async getDuration(
    origin: Coordinate,
    destination: Coordinate,
  ): Promise<number> {
    const endpoint = this.createQuery(origin, destination);
    console.log(`requiesting to ${endpoint}`);
    return await fetch(endpoint)
      .then((response) => response.json())
      .then((response) => {
        this.errorHandle(response);
        return response['routes'][0]['duration'];
      });
  }

  async search(origin: Coordinate, destination: Coordinate) {
    const endpoint = this.createQuery(origin, destination, {
      steps: 'true',
      // overview: 'full',
      geometries: 'geojson',
    });
    console.log(`requiesting to ${endpoint}`);
    const response = await fetch(endpoint).then((response) => response.json());

    this.errorHandle(response);

    return this.createRoute(response);
  }
}

export type OSRMResponse =
  | 'Ok'
  | 'InvalidUrl'
  | 'InvalidService'
  | 'InvalidVersion'
  | 'InvalidOptions'
  | 'InvalidQuery'
  | 'InvalidValue'
  | 'NoSegment'
  | 'TooBig'
  | 'DisabledDataset'
  | 'NoRoute';
