import { Coordinate } from '../geometry/coordinate';
import { Heading } from '../geometry/heading';
import { Route } from '../geometry/route';
import { Step } from '../geometry/step';
import { Place } from '../orderSearch/place';
import { Places } from '../orderSearch/places';
import { OSRMAdaptor } from '../pathSearch/osrmAdaptor';
import { Exception } from '../utils/exception';
import { DefaultRouteSearch } from './defaultRouteSearch';
import { RouteSearch } from './routeSearch';
import { RouteSearchDirector } from './routeSearchDirector';
import turf, { Point } from '@turf/turf';

export class MapRouter {
  static readonly RECORD_DISTANCE_THRESHOLD = 0.003;
  static readonly MANEUVER_DISTANCE_THRESHOLD = 0.0015;

  private director = new RouteSearchDirector(new DefaultRouteSearch());
  private pathSearcher = new OSRMAdaptor();
  private routeSearch: RouteSearch;
  private places? = new Places();
  private routes?: Route[];
  source?: Place;
  destination?: Place;
  via: Place[] = [];
  private passed?: Coordinate[];
  private onMajor?: number;
  private onStep?: number;
  private locationLastManeuverChanged?: Coordinate;
  nextStep?: Step;

  constructor() {
    this.routeSearch = this.director.construct();
  }

  private generatePlaces() {
    if (
      this.source == undefined ||
      this.destination == undefined ||
      undefined ||
      this.via == undefined
    ) {
      throw new Error(Exception.NOT_INITIALIZED);
    }

    this.places = new Places();

    this.places.places.push(this.source);
    this.places.startNode = 0;
    this.places.places.concat(this.via);
    this.places.places.push(this.destination);
    this.places.endNode = this.places.places.length - 1;
  }

  private async constructRoute() {
    if (this.places == undefined) {
      this.generatePlaces();
      this.routes = await this.routeSearch.search(this.places!);
    }
  }

  async addGPSInfo(coordinate: Coordinate, heading: Heading) {
    await this.constructRoute();
    if (this.onMajor == undefined) this.onMajor = 0;
    if (this.passed == undefined) this.passed = [];

    const nowPoint = turf.point(coordinate.toLngLatArray());
    const lastPoint = turf.point(
      this.passed[this.passed.length - 1].toLngLatArray(),
    );
    if (
      turf.distance(nowPoint, lastPoint) > MapRouter.RECORD_DISTANCE_THRESHOLD
    ) {
      this.passed?.push(coordinate);
    }

    let lastManeuverPoint: any;
    if (this.locationLastManeuverChanged != undefined) {
      lastManeuverPoint = turf.point(
        this.locationLastManeuverChanged.toLngLatArray(),
      );
    }

    if (
      this.locationLastManeuverChanged == undefined ||
      turf.distance(nowPoint, lastManeuverPoint) >
        MapRouter.MANEUVER_DISTANCE_THRESHOLD
    ) {
      const nextDestination = Route.lastCoordinate(this.routes![this.onMajor]);
      const route = await this.pathSearcher.search(coordinate, nextDestination);
      this.nextStep = route.steps[0];
    }
  }
}
