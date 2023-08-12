import { Coordinate } from './coordinate';
import { Heading } from './heading';

export type Intersection = {
  location: Coordinate;
  bearings: Heading[];
  in: number;
  out: number;
};
