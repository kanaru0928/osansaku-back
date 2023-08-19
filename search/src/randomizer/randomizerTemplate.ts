import { Coordinate } from "../geometry/coordinate";
import { Route } from "../geometry/route";

export interface RandomizerTemplate {
  randomize(from: Coordinate, to: Coordinate): Route | Promise<Route>;
}
