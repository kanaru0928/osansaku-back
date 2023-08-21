import { randomUUID } from 'crypto';
import {
  WebSocketDisconnectRequest,
  WebSocketGPSRequest,
  WebSocketGreetRequest,
  WebSocketPatchRequest,
} from './types/websocketData';
import { Geocoding } from './geocoding/geocoding';

const USER_ID = 'c89f4fe4-3891-4619-aa00-c831fdb6befe';

// ### Greet ###
const greet = (): WebSocketGreetRequest => {
  return {
    format_version: '1',
    type: 'greet',
    user: USER_ID,
  };
};

const gps = (): WebSocketGPSRequest => {
  return {
    format_version: '1',
    heading: 0,
    type: 'gps',
    location: [35.67206715, 139.4791738],
    user: USER_ID,
  };
};

const patch1 = async (): Promise<WebSocketPatchRequest> => {
  const now = Math.round(Date.now() / 1000);
  const geocoding = new Geocoding(Geocoding.Method.NominatimLocal);
  return {
    format_version: '1',
    settings: {
      source: {
        date: now,
        location: (
          await geocoding.getGeocode('府中駅')
        ).coordinate.toLatLngArray(),
        name: '府中駅',
      },
    },
    type: 'patch',
    user: USER_ID,
  };
};

const patch2 = async (): Promise<WebSocketPatchRequest> => {
  const now = Math.round(Date.now() / 1000);
  const geocoding = new Geocoding(Geocoding.Method.NominatimLocal);
  return {
    format_version: '1',
    settings: {
      source: {
        date: now,
        location: (
          await geocoding.getGeocode('府中駅')
        ).coordinate.toLatLngArray(),
        name: '府中駅',
      },
      destination: {
        date: now + 18000,
        location: (
          await geocoding.getGeocode('府中駅')
        ).coordinate.toLatLngArray(),
        name: '府中駅',
      },
      via: [
        {
          location: (
            await geocoding.getGeocode('東京競馬場')
          ).coordinate.toLatLngArray(),
          name: '東京競馬場',
          open: now + 9000,
        },
        {
          location: (
            await geocoding.getGeocode('関戸橋')
          ).coordinate.toLatLngArray(),
          name: '関戸橋',
        },
        {
          location: (
            await geocoding.getGeocode('府中の森')
          ).coordinate.toLatLngArray(),
          name: '府中の森公園',
        },
        {
          location: (
            await geocoding.getGeocode('東京農工大学')
          ).coordinate.toLatLngArray(),
          name: '農工大',
        },
      ],
    },
    type: 'patch',
    user: USER_ID,
  };
};

const disconnect = async (): Promise<WebSocketDisconnectRequest> => {
  return {
    format_version: '1',
    type: 'disconnect',
    user: USER_ID,
  };
};

(async () => {
  console.log(JSON.stringify(await disconnect()));
  // console.log(JSON.stringify(gps()));
})();
