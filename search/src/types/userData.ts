import websocket from 'ws';
import { RouteSearch } from '../routeSearch/routeSearch';
import { Timezone } from './websocketData';
import { MapRouter } from '../routeSearch/mapRouter';

export type UserData = {
  ws: websocket;
  mapRouter: MapRouter;
  timeZone?: Timezone;
};
