import { Coordinate } from '../geometry/coordinate';

export type Place = {
  location: Coordinate;
  open?: number;
  close?: number;
  stay?: number;
};
