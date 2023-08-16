import { Coordinate } from '../geometry/coordinate';
import { Route } from '../geometry/route';

export interface PathSearcher {
  getDistance(
    origin: Coordinate,
    destination: Coordinate,
  ): number | Promise<number>;
  getDuration(
    origin: Coordinate,
    destination: Coordinate,
  ): number | Promise<number>;
  search(origin: Coordinate, destination: Coordinate): Route | Promise<Route>;
}
