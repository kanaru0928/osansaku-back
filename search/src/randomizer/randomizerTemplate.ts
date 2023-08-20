import { Coordinate } from "../geometry/coordinate";
import { Route } from "../geometry/route";

export interface RandomizerTemplate {
  randomize(locations: Coordinate[], time: number): Promise<Route[]>;
}
