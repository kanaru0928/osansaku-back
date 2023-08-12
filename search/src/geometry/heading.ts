export type Heading = number;

export namespace Heading {
  export function angle(h1: Heading, h2: Heading) {
    let ans = (h2 - h1) % 360;
    if (ans > 180) {
      ans -= 180;
    } else if (ans < -180) {
      ans += 180;
    }
    return ans;
  }
}
