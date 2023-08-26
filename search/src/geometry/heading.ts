export type Heading = number;

export namespace Heading {
  export function angle(h1: Heading, h2: Heading) {
    let ans = h2 - h1;
    ans -= Math.floor(ans / 360.0) * 360.0;
    if (ans > 180) {
      ans -= 360;
    } else if (ans < -180) {
      ans += 360;
    }
    return ans;
  }
}
