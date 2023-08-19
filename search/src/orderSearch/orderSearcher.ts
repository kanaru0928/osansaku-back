import { OrderTime } from './orderTime';
import { Places } from './places';

export interface OrderSearcher {
  search(places: Places, distanceMatrix: any[][]): Promise<OrderTime> | OrderTime;
}
