import { DistanceMatrix } from '../graph/distanceMatrix';
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
  private async sendRequest(timeMatrix: DistanceMatrix, places: Places) {
    return (
      await fetch('http://optimization:8000/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: places.toJson(timeMatrix),
      })
    ).json();
  }

  async search(places: Places, distanceMatrix: DistanceMatrix) {
    const rawResponse = await this.sendRequest(distanceMatrix, places);
    let response: { nodes: { order: number; time: number }[] };
    console.log(`requesting to http://optimization:8000/optimize with`);
    console.log(places.toJson(distanceMatrix));
    try {
      response = responseSchema.parse(rawResponse);
    } catch (e) {
      console.error(rawResponse);
      throw new Error('parse error');
    }
    const numActiveNode = response.nodes.reduce((prev, val) => {
      if(val.order !== -1) return prev + 1;
      else return prev;
    }, 0)
    const order = new Array(numActiveNode);
    for (let i = 0; i < response.nodes.length; i++) {
      if (response.nodes[i].order !== -1) {
        order[response.nodes[i].order] = i;
      }
    }
    console.log(`got order: ${order}`);

    const times: { from: number; to: number; time: number }[] = [];

    let stayed = 0;
    let lastSpecified = 0;
    for (let i = 0; i < order.length; i++) {
      const index = order[i];
      const place = places.places[index];
      const node = response.nodes[index];
      if (
        stayed !== 0 &&
        (place.open != undefined || place.close != undefined)
      ) {
        times.push({
          from: lastSpecified,
          to: i,
          time: stayed,
        });
        lastSpecified = i;
        stayed = 0;
      }

      if (i >= order.length - 1) continue;

      const timeDifference = response.nodes[order[i + 1]].time - node.time;
      const distanceTime = distanceMatrix[index][order[i + 1]];
      if (typeof distanceTime !== 'number') {
        throw new Error('Not implemented');
      }
      const nowStayed =
        timeDifference - (place.stay != undefined ? place.stay : 0);
      stayed += nowStayed;
    }
    const ret: OrderTime = {
      order,
      times,
    };

    return ret;
  }
}
