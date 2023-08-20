export type BBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export namespace BBox {
  export function toArray(bbox: BBox) {
    return [bbox.south, bbox.west, bbox.north, bbox.east];
  }
  export function fromArray(arr: [number, number, number, number]): BBox {
    return { south: arr[0], west: arr[1], north: arr[2], east: arr[3] };
  }
}
