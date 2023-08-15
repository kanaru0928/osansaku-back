import { Coordinate } from './coordinate';

export type Maneuver = {
  bearing_after: number;
  type: string;
  modifier: string;
  bearing_before: number;
  location: Coordinate;
};
