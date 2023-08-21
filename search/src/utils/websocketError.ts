export const WebsocketError = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
};

export type WebsocketError = (typeof WebsocketError)[keyof typeof WebsocketError]
