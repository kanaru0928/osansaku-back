export type LatLng = [Lat: number, Lng: number];

export type Timezone = string;

export type StepManeuverType = "turn" | "new name" | "depart" | "arrive" | "merge" | "ramp" | "on ramp" | "off ramp" | "fork" | "end of road" | "use lane" | "continue" | "roundabout" | "rotary" | "roundabout turn" | "notification" | "exit roundabout" | "exit rotary";
export type StepManeuverModifier = "uturn" | "sharp right" | "right" | "slight right" | "straight" | "slight left" | "left" | "sharp left";

interface WebSocketData<T extends string> {
  format_version: "1";
  type: T;
};

type WebSocketRequestBase<T extends string> = WebSocketData<T>;

export interface WebSocketGreetRequest extends WebSocketRequestBase<"greet"> {
  timeZone?: Timezone;
  user: string;
}

export interface WebSocketPatchRequest extends WebSocketRequestBase<"patch"> {
  settings: {
    source?: {
      location: LatLng;
      date: number;
      name?: string;
    };
    destination?: {
      location: LatLng;
      date: number;
      name?: string;
    };
    via?: {
      location: LatLng;
      open?: number;
      close?: number;
      stay?: number;
      name: string;
    }[];
  }
  user: string;
}

export interface WebSocketPlaceRequest extends WebSocketRequestBase<"place"> {
  /**
   * [North Lat, West Lng, South Lat, East Lng]
   */
  bbox: [number, number, number, number];
}

export interface WebSocketGPSRequest extends WebSocketRequestBase<"gps"> {
  location: LatLng;
  heading: number;
  user: string;
}

export interface WebSocketInfoRequest extends WebSocketRequestBase<"info"> {
  user: string;
}

export interface WebSocketDisconnectRequest extends WebSocketRequestBase<"disconnect"> {
  type: "disconnect";
  user: string;
}

export type WebSocketRequest = WebSocketGreetRequest
  | WebSocketPatchRequest
  | WebSocketPlaceRequest
  | WebSocketGPSRequest
  | WebSocketInfoRequest
  | WebSocketDisconnectRequest;

export type WebSocketRequestMap = {
    greet: WebSocketGreetRequest;
    patch: WebSocketPatchRequest;
    place: WebSocketPlaceRequest;
    gps: WebSocketGPSRequest;
    info: WebSocketInfoRequest;
    disconnect: WebSocketDisconnectRequest;
  }


export interface WebSocketResponseBase<T extends string> extends WebSocketData<T> {
  status: "OK" | "NG";
}

export interface WebSocketOKResponseBase<T extends string> extends WebSocketResponseBase<T> {
  status: "OK";
}

export interface WebSocketNGResponseBase<T extends string> extends WebSocketResponseBase<T> {
  status: "NG";
  message: string;
}

export interface WebSocketGreetOKResponse extends WebSocketOKResponseBase<"greet"> {}

export interface WebSocketGreetNGResponse extends WebSocketNGResponseBase<"greet"> {}

export interface WebSocketPatchOKResponse extends WebSocketOKResponseBase<"patch"> {}

export interface WebSocketPatchNGResponse extends WebSocketNGResponseBase<"patch"> {}

export interface WebSocketPlaceOKResponse extends WebSocketOKResponseBase<"place"> {
  places: {
    location: LatLng;
    name: string;
    /**
     * amenity on OpenStreetMap
     */
    type: string;
  }[]
}

export interface WebSocketPlaceNGResponse extends WebSocketNGResponseBase<"place"> {}

export interface WebSocketGPSOKResponse extends WebSocketOKResponseBase<"gps"> {
  next_action: {
    location: LatLng;
    distance: number;
    /**
     * ManeuverType on OpenStreetMap
     */
    action: StepManeuverType;
    /**
     * Modifier on OpenStreetMap
     */
    modifier: StepManeuverModifier;
  } | null;
  /* next_place: {
    location: LatLng;
    distance: number;
    name: string;
  } | null; */
}

export interface WebSocketGPSNGResponse extends WebSocketNGResponseBase<"gps"> {}

export interface WebSocketInfoOKResponse extends WebSocketOKResponseBase<"info"> {
  geojson: string;
  duration: number;
  distance: number;
}

export interface WebSocketInfoNGResponse extends WebSocketNGResponseBase<"info"> {}

export interface WebSocketDisconnectOKResponse extends WebSocketOKResponseBase<"disconnect"> {}

export interface WebSocketDisconnectNGResponse extends WebSocketNGResponseBase<"disconnect"> {}

export type WebSocketResponse = WebSocketGreetOKResponse
  | WebSocketGreetNGResponse
  | WebSocketPatchOKResponse
  | WebSocketPatchNGResponse
  | WebSocketPlaceOKResponse
  | WebSocketPlaceNGResponse
  | WebSocketGPSOKResponse
  | WebSocketGPSNGResponse
  | WebSocketInfoOKResponse
  | WebSocketInfoNGResponse
  | WebSocketDisconnectOKResponse
  | WebSocketDisconnectNGResponse;

export type WebSocketResponseMap = {
  "greet": WebSocketGreetOKResponse | WebSocketGreetNGResponse;
  "patch": WebSocketPatchOKResponse | WebSocketPatchNGResponse;
  "place": WebSocketPlaceOKResponse | WebSocketPlaceNGResponse;
  "gps": WebSocketGPSOKResponse | WebSocketGPSNGResponse;
  "info": WebSocketInfoOKResponse | WebSocketInfoNGResponse;
  "disconnect": WebSocketDisconnectOKResponse | WebSocketDisconnectNGResponse;
}
