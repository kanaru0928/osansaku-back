import { Coordinate } from '../geometry/coordinate';
import { Route } from '../geometry/route';
import { Step } from '../geometry/step';
import { PathSearcher } from './pathSearcher';

export class OSRMAdaptor implements PathSearcher {
  private static readonly END_POINT = 'http://osrm:5000/route/v1/walking/';
  private static readonly END_POINT_OPTION = {
    steps: 'true',
    overview: 'full',
    geometries: 'geojson',
  };

  private createQuery(origin: Coordinate, destination: Coordinate) {
    const query = new URLSearchParams(OSRMAdaptor.END_POINT_OPTION);
    return `${OSRMAdaptor.END_POINT}${origin.toLngLat};${destination.toLngLat}?${query}`;
  }

  private createStep(obj: any) {
    
  }

  private createRoute(obj: any): Route {
    const primary = obj['routes'][0];
    const primaryRoute = (primary['coordinates'] as [number, number][]).map(
      Coordinate.fromLngLat,
    );

    const steps = primary['legs']['steps'] as any[];

    // TODO: stepsをキャストして、validationをかける
    const ret: Route = {
      primaryRoute,
    };
  }

  async search(origin: Coordinate, destination: Coordinate): Promise<Route> {
    const response = await fetch(this.createQuery(origin, destination)).then(
      (response) => response.json(),
    );
  }
}
