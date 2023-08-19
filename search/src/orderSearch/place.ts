import { Coordinate } from '../geometry/coordinate';

export type Place = {
  location: Coordinate;
  open: number | undefined;
  close: number | undefined;
  stay: number | undefined;
};
