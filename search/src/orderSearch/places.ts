import { DistanceMatrix } from '../graph/distanceMatrix';
import { Place } from './place';

export class Places {
  places: Place[] = [];
  startNode: number = 0;
  endNode: number = 0;
  maxWaiting?: number;
  zeroBinding?: boolean;
  withoutCost?: boolean;

  toJson(timeMatrix: DistanceMatrix) {
    const nodes: {
      [key: number]: {
        open_time?: number;
        close_time?: number;
        stay?: number;
        penalty?: number;
      };
    } = {};
    for (let i = 0; i < this.places.length; i++) {
      if (
        this.places[i].close != undefined ||
        this.places[i].open != undefined ||
        this.places[i].penalty != undefined ||
        this.places[i].stay != undefined
      ) {
        nodes[i] = {
          open_time: this.places[i].open,
          close_time: this.places[i].close,
          stay: this.places[i].stay,
          penalty: this.places[i].penalty,
        };
      }
    }
    return JSON.stringify({
      nodes,
      time_matrix: timeMatrix,
      start_node: this.startNode,
      end_node: this.endNode,
      max_waiting_time: this.maxWaiting,
      zero_bind: this.zeroBinding,
      without_cost: this.withoutCost,
    });
  }
}
