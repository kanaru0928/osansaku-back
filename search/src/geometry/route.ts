import { Coordinate } from './coordinate';
import { Step } from './step';

export type Route = {
  primaryRoute: Coordinate[];
  steps: Step[];
  allDistance: number;
};

export namespace Route{
  function toGeojson(){
    
  }
}
