export const WebsocketError = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
  NO_SETTINGS: 'NO_SETTINGS',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
};

export type WebsocketError =
  (typeof WebsocketError)[keyof typeof WebsocketError];
