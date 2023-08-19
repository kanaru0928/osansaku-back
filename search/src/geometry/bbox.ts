export type BBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export namespace BBox {
  export function toArray(bbox: BBox) {
    return [bbox.south, bbox.east, bbox.north, bbox.west];
  }
  export function fromArray(arr: [number, number, number, number]): BBox {
    return { south: arr[0], east: arr[1], north: arr[2], west: arr[3] };
  }
}
