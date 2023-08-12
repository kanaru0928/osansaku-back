import { Coordinate } from '../geometry/coordinate';
import { Route } from '../geometry/route';

export interface PathSearcher {
  search(origin: Coordinate, destination: Coordinate): Route | Promise<Route>;
}
