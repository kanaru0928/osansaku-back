import { Coordinate } from './coordinate';
import { Step } from './step';

export type Route = {
  primaryRoute: Coordinate[];
  steps: Step[];
  allDistance: number;
};

export namespace Route {
  export function toGeojson(route: Route) {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Featrue',
          geometry: {
            type: 'LineString',
            coordinates: route.primaryRoute.map((c) => c.toLngLatArray()),
          },
          properties: {
            _color: '#00ff00',
            _opacity: 1,
            _weight: 5,
          },
        },
      ],
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
}
