import { Coordinate } from './coordinate';
import { Intersection } from './intersection';
import { Maneuver } from './maneuver';

export type Step = {
  intersections: Intersection[];
  distance: number;
  name: string;
  path: Coordinate[];
  maneuver: Maneuver;
};
