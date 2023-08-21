import { Coordinate } from './coordinate';
import { Step } from './step';
import * as turf from '@turf/turf';

export type Route = {
  primaryRoute: Coordinate[];
  steps: Step[];
  allDistance: number;
};

export namespace Route {
  export function toGeojson(...route: Route[]) {
    let features = [];
    for (let i = 0; i < route.length; i++) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: route[i].primaryRoute.map((c) => c.toLngLatArray()),
        },
        properties: {
          _color: '#00ff00',
          _opacity: 1,
          _weight: 5,
        },
      });
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  }

  function concat(r1: Route, r2: Route): Route {
    if (
      r1.primaryRoute.length > 0 &&
      r1.primaryRoute[r1.primaryRoute.length - 1].isEquals(r2.primaryRoute[0])
    ) {
      r1.primaryRoute.pop();
    }
    const primaryRoute = r1.primaryRoute.concat(r2.primaryRoute);
    const steps = r1.steps.concat(r2.steps);
    const allDistance = r1.allDistance + r2.allDistance;
    return {
      primaryRoute,
      steps,
      allDistance,
    };
  }

  export function join(...routes: Route[]) {
    const init: Route = { primaryRoute: [], steps: [], allDistance: 0 };
    const ret = routes.reduce((prev, route) => concat(prev, route), init);
    return ret;
  }

  export function lastCoordinate(route: Route) {
    return route.primaryRoute[route.primaryRoute.length - 1];
  }

  export function getDistanceFromGeojson(geojson: any) {
    const distance = turf.length(geojson) * 1000;
    return distance;
  }
}
