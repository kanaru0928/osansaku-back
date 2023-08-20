export type OrderTime = {
  /**
   * 巡回順が`i`番目のノード番号
   */
  order: number[];
  /**
   * ノード`from`からノード`to`への移動にかけられる時間(移動時間を除く)
   */
  times: {
    from: number;
    to: number;
    time: number;
  }[];
};
