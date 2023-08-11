import { Graph } from './graph';

export interface GraphConstructor {
  getGraph(option: any): Graph | Promise<Graph>;
}
