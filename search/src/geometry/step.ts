import { Coordinate } from './coordinate';
import { Intersection } from './intersection';

export type Step = {
  intersections: Intersection[];
  distance: number;
  name: string;
  path: Coordinate[];
};
