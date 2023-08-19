import { OrderSearcher } from './orderSearcher';
import { OrderTime } from './orderTime';
import { Places } from './places';
import { z } from 'zod';

const responseSchema = z.object({
  nodes: z.array(
    z.object({
      order: z.number(),
      time: z.number(),
    }),
  ),
});

export class ORToolsAdaptor implements OrderSearcher {
  private async sendRequest(timeMatrix: number[][], places: Places) {
    await (
      await fetch('http://optimization:8000/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: places.toJson(timeMatrix),
      })
    ).json();
  }

  search(places: Places, distanceMatrix: number[][]): OrderTime {
    const rawResponse = this.sendRequest(distanceMatrix, places);
    const response = responseSchema.parse(rawResponse);
    const order = new Array(response.nodes.length);
    for (let i = 0; i < response.nodes.length; i++) {
      order[response.nodes[i].order] = i;
    }

    const times: { from: number; to: number; time: number }[] = [];

    const stayed = 0;
    const lastSpecified = 0;
    for (let i = 0; i < order.length; i++) {
      const index = order[i];
      const place = places.places[index];
      const node = response.nodes[index];
      if (place.open != undefined || place.close != undefined) {
        times.push({
          from: lastSpecified,
          to: order[i - 1],
          time: stayed
        })
      }
    }
    const ret: OrderTime = {
      order,
    };
  }
}
