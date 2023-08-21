import { Coordinate } from './coordinate';

export type Maneuver = {
  bearing_after: number;
  type:
    | 'turn'
    | 'new name'
    | 'depart'
    | 'arrive'
    | 'merge'
    | 'ramp'
    | 'on ramp'
    | 'off ramp'
    | 'fork'
    | 'end of road'
    | 'use lane'
    | 'continue'
    | 'roundabout'
    | 'rotary'
    | 'roundabout turn'
    | 'notification'
    | 'exit roundabout'
    | 'exit rotary';
  modifier:
    | 'uturn'
    | 'sharp right'
    | 'right'
    | 'slight right'
    | 'straight'
    | 'slight left'
    | 'left'
    | 'sharp left';
  bearing_before: number;
  location: Coordinate;
};
