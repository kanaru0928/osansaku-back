export enum Exception {
  GEOCODE_NOT_FOUND = '地理情報が見つかりませんでした。',
  ROUTE_NOT_FOUND = 'ルートが見つかりませんでした。',
  INVALID_VALUE = '入力値が不正です。',
  INVALID_ENDPOINT = 'エンドポイントが無効です。',
  NO_SEGMENT = '道路が見つかりませんでした。',
  EXTERNAL_ERROR = '外部エラー。',
  UNKNOWN_ERROR = '不明なエラー。',
  NOT_INITIALIZED = '初期化不良です。',
  NOT_PREPARED = '処理中にリクエストされました。',
}
