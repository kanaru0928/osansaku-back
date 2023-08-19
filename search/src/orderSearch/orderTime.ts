/**
 * `order[i]` - 巡回順が`i`番目のノード番号
 * 
 * `times` - ノード`from`からノード`to`への移動にかけられる時間(移動時間を除く)
 */
export type OrderTime = {
  order: number[];
  times: {
    from: number;
    to: number;
    time: number;
  }[];
};
