import websocket from 'ws';
import {
  WebSocketDisconnectOKResponse,
  WebSocketDisconnectRequest,
  WebSocketGPSNGResponse,
  WebSocketGPSOKResponse,
  WebSocketGPSRequest,
  WebSocketGreetOKResponse,
  WebSocketGreetRequest,
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

export class WebSocketServer {
  server: websocket.Server;
  userDatas: { [key: string]: UserData } = {};

  constructor() {
    this.server = new websocket.Server({ port: 8000 });
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
    if (data.user in this.userDatas) {
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

    const routeSearch = this.userDatas[data.user].mapRouter;
    if (data.settings.source != undefined) {
      const source = data.settings.source;
      routeSearch.source = {
        location: Coordinate.fromLatLng(source.location),
        open: source.date,
        name: source.name,
      };
    }
    if (data.settings.destination != undefined) {
      const destination = data.settings.destination;
      routeSearch.destination = {
        location: Coordinate.fromLatLng(destination.location),
        open: destination.date,
        close: destination.date,
        name: destination.name,
      };
      if (routeSearch.source != undefined) {
        routeSearch.source = {
          location: Coordinate.fromLatLng(destination.location),
        };
      }
      routeSearch.source!.close = destination.date;
    }
    if (data.settings.via != undefined) {
      routeSearch.via = data.settings.via.map((place) => {
        return {
          location: Coordinate.fromLatLng(place.location),
        };
      });
    }

    const response: WebSocketPatchOKResponse = {
      format_version: '1',
      status: 'OK',
      type: 'patch',
    };
    sock.send(JSON.stringify(response));
  }

  private wsError(
    sock: websocket,
    data: WebSocketRequest,
    reason: WebSocketError,
  ) {
    const response = {
      status: 'NG',
      message: reason,
      type: data.type,
    };
    sock.send(JSON.stringify(response));
  }

  private gps(sock: websocket, data: WebSocketGPSRequest) {
    if (!this.checkUser(sock, data)) return;
    const mapRouter = this.userDatas[data.user].mapRouter;
    try {
      mapRouter.addGPSInfo(Coordinate.fromLatLng(data.location), data.heading);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(error.message);
        if (error.message === Exception.ROUTE_NOT_FOUND) {
          this.wsError(sock, data, WebSocketError.ROUTE_NOT_FOUND);
        } else {
          this.wsError(sock, data, WebSocketError.UNKNOWN_ERROR);
        }
      } else if (typeof error === 'string') {
        console.warn(error);
        this.wsError(sock, data, WebSocketError.UNKNOWN_ERROR);
      } else {
        console.warn('unexpected error');
        this.wsError(sock, data, WebSocketError.UNKNOWN_ERROR);
      }
    }

    const step = mapRouter.nextStep!;

    const ret: WebSocketGPSOKResponse = {
      format_version: '1',
      status: 'OK',
      type: 'gps',
      next_action: {
        location: step.maneuver.location.toLatLngArray(),
        distance: step.distance,
        modifier: step.maneuver.modifier,
        action: step.maneuver.type,
      },
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

  private onGetMessageV1(sock: websocket, data: WebSocketRequest) {
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
          this.gps(sock, data);
          break;
        case 'disconnect':
          this.disconnect(sock, data);
          break;
      }
    } catch (message) {
      console.warn(message);
      this.wsError(sock, data, WebSocketError.UNKNOWN_ERROR);
    }
  }

  private onGetMessage(sock: websocket, message: websocket.RawData) {
    const data: WebSocketRequest = JSON.parse(message.toString());

    switch (data.format_version) {
      case '1':
        this.onGetMessageV1(sock, data);
        break;
      default:
        this.wsError(sock, data, WebSocketError.INVALID_REQUEST);
        break;
    }
  }

  connect() {
    this.server.on('connection', (sock) => {
      sock.on('message', (message) => {
        this.onGetMessage(sock, message);
      });
    });
  }
}
