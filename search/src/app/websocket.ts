import websocket from 'ws';
import {
  WebSocketDisconnectOKResponse,
  WebSocketDisconnectRequest,
  WebSocketGPSNGResponse,
  WebSocketGPSOKResponse,
  WebSocketGPSRequest,
  WebSocketGreetOKResponse,
  WebSocketGreetRequest,
  WebSocketInfoOKResponse,
  WebSocketInfoRequest,
  WebSocketPatchNGResponse,
  WebSocketPatchOKResponse,
  WebSocketPatchRequest,
  WebSocketRequest,
  WebSocketRequestMap,
  WebSocketResponse,
} from '../types/websocketData';
import { UserData } from '../types/userData';
import { Exception } from '../utils/exception';
import { WebsocketError as WebSocketError } from '../utils/websocketError';
import { Coordinate } from '../geometry/coordinate';
import { MapRouter } from '../routeSearch/mapRouter';
import { Route } from '../geometry/route';

export class MyWebSocketServer {
  server: websocket.Server;
  userDatas: { [key: string]: UserData } = {};

  readonly PORT = 8000;

  constructor() {
    this.server = new websocket.Server({ port: this.PORT });
  }

  private greet(sock: websocket, data: WebSocketGreetRequest) {
    this.userDatas[data.user] = {
      ws: sock,
      mapRouter: new MapRouter(),
      timeZone: data.timeZone,
    };

    const response: WebSocketGreetOKResponse = {
      format_version: '1',
      type: 'greet',
      status: 'OK',
    };

    sock.send(JSON.stringify(response));
  }

  private checkUser(sock: websocket, data: any) {
    if (!(data.user in this.userDatas)) {
      const err: WebSocketPatchNGResponse = {
        format_version: '1',
        status: 'NG',
        message: WebSocketError.USER_NOT_FOUND,
        type: 'patch',
      };
      sock.send(JSON.stringify(err));
      return false;
    }
    if (this.userDatas[data.user].ws !== sock) {
      this.userDatas[data.user].ws = sock;
    }
    return true;
  }

  private patch(sock: websocket, data: WebSocketPatchRequest) {
    if (!this.checkUser(sock, data)) return;

    const mapRouter = this.userDatas[data.user].mapRouter;
    if (data.settings.source != undefined) {
      const source = data.settings.source;
      mapRouter.source = {
        location: Coordinate.fromLatLng(source.location),
        open: source.date,
        name: source.name,
      };
    }
    if (data.settings.destination != undefined) {
      const destination = data.settings.destination;
      mapRouter.destination = {
        location: Coordinate.fromLatLng(destination.location),
        open: destination.date,
        close: destination.date,
        name: destination.name,
      };
      if (mapRouter.source == undefined) {
        mapRouter.source = {
          location: Coordinate.fromLatLng(destination.location),
        };
      }
      console.log(mapRouter.source);
      mapRouter.source!.close = destination.date;
      console.log(mapRouter.source);
    }
    if (data.settings.via != undefined) {
      mapRouter.via = data.settings.via.map((place) => {
        return {
          location: Coordinate.fromLatLng(place.location),
          open: place.open,
          close: place.close,
          name: place.name,
          stay: place.stay,
        };
      });
    }

    console.log('patched');
    console.log(mapRouter);

    const response: WebSocketPatchOKResponse = {
      format_version: '1',
      status: 'OK',
      type: 'patch',
    };
    sock.send(JSON.stringify(response));
  }

  private wsError(
    sock: websocket,
    data: WebSocketRequest | { type: null },
    reason: WebSocketError,
  ) {
    const response = {
      status: 'NG',
      message: reason,
      type: data.type,
    };
    sock.send(JSON.stringify(response));
  }

  private async gps(sock: websocket, data: WebSocketGPSRequest) {
    console.log(`recived heading: ${data.heading}`);
    if (!this.checkUser(sock, data)) return;
    const mapRouter = this.userDatas[data.user].mapRouter;

    const coordinate = Coordinate.fromLatLng(data.location);
    mapRouter.registerCoordinate(coordinate);

    let nextAction = null;

    if (!mapRouter.isEnded()) {
      await mapRouter.addGPSInfo(coordinate, data.heading);

      const step = mapRouter.nextStep!;

      nextAction = {
        location: step.maneuver.location.toLatLngArray(),
        distance: step.distance,
        modifier: step.maneuver.modifier,
        action: step.maneuver.type,
        heading: mapRouter.relativeHeading,
      };
    }

    const ret: WebSocketGPSOKResponse = {
      format_version: '1',
      status: 'OK',
      type: 'gps',
      next_action: nextAction,
    };

    sock.send(JSON.stringify(ret));
  }

  private info(sock: websocket, data: WebSocketInfoRequest) {
    if (!this.checkUser(sock, data)) return;

    const mapRouter = this.userDatas[data.user].mapRouter;
    if (!mapRouter.isEnded()) throw new Error(Exception.NOT_INITIALIZED);

    const geojson = mapRouter.getGeoJson();
    const distance = Route.getDistanceFromGeojson(geojson);

    const ret: WebSocketInfoOKResponse = {
      distance,
      duration: mapRouter.duration!,
      format_version: '1',
      geojson: JSON.stringify(geojson),
      status: 'OK',
      type: 'info',
    };

    sock.send(JSON.stringify(ret));
  }

  private disconnect(sock: websocket, data: WebSocketDisconnectRequest) {
    if (!this.checkUser(sock, data)) return;
    delete this.userDatas[data.user];
    const ret: WebSocketDisconnectOKResponse = {
      format_version: '1',
      status: 'OK',
      type: 'disconnect',
    };
    sock.send(JSON.stringify(ret));
  }

  private async onGetMessageV1(sock: websocket, data: WebSocketRequest) {
    try {
      switch (data.type) {
        case 'greet':
          this.greet(sock, data);
          break;
        case 'patch':
          this.patch(sock, data);
          break;
        case 'place':
          this.wsError(sock, data, WebSocketError.INVALID_REQUEST);
          break;
        case 'gps':
          await this.gps(sock, data);
          break;
        case 'info':
          this.info(sock, data);
          break;
        case 'disconnect':
          this.disconnect(sock, data);
          break;
      }
    } catch (error) {
      console.warn(error);
      if (error instanceof Error) {
        console.warn(error.message);
        switch (error.message) {
          case Exception.ROUTE_NOT_FOUND:
            this.wsError(sock, data, WebSocketError.ROUTE_NOT_FOUND);
            break;
          case Exception.NOT_INITIALIZED:
            this.wsError(sock, data, WebSocketError.NO_SETTINGS);
            break;
          case Exception.NOT_PREPARED:
            this.wsError(sock, data, WebSocketError.NOT_PREPARED);
            break;
          default:
            this.wsError(sock, data, WebSocketError.UNKNOWN_ERROR);
            break;
        }
      } else if (typeof error === 'string') {
        console.warn(error);
        this.wsError(sock, data, WebSocketError.UNKNOWN_ERROR);
      } else {
        console.warn('unexpected error');
        this.wsError(sock, data, WebSocketError.UNKNOWN_ERROR);
      }
    }
  }

  private async onGetMessage(sock: websocket, message: websocket.RawData) {
    try {
      const data: WebSocketRequest = JSON.parse(message.toString());
      switch (data.format_version) {
        case '1':
          await this.onGetMessageV1(sock, data);
          break;
        default:
          this.wsError(sock, data, WebSocketError.INVALID_REQUEST);
          break;
      }
    } catch (_) {
      this.wsError(sock, { type: null }, WebSocketError.INVALID_REQUEST);
    }
  }

  listen() {
    this.server.on('connection', (sock) => {
      console.log(`connected`);
      sock.on('message', (message) => {
        this.onGetMessage(sock, message);
      });
    });
    const address = this.server.address() as websocket.AddressInfo;
    console.log(`listening on port ${address.address}:${address.port}`);
  }
}
