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
import * as turf from '@turf/turf';

export class MapRouter {
  static readonly RECORD_DISTANCE_THRESHOLD = 0.003;
  static readonly MANEUVER_DISTANCE_THRESHOLD = 0.0015;

  private director = new RouteSearchDirector(new DefaultRouteSearch());
  private pathSearcher = new OSRMAdaptor();
  private routeSearch: RouteSearch;
  private places?: Places;
  private routes?: Route[][];
  source?: Place;
  destination?: Place;
  via: Place[] = [];
  private passed?: Coordinate[];
  private onMajor?: number;
  private onMinor?: number;
  private locationLastManeuverChanged?: Coordinate;
  nextStep?: Step;
  relativeHeading: Heading = 0;
  private startTime?: number;
  duration?: number;

  constructor() {
    this.routeSearch = this.director.construct();
  }

  private generatePlaces() {
    console.log('generating places');
    if (
      this.source == undefined ||
      this.destination == undefined ||
      undefined ||
      this.via == undefined
    ) {
      throw new Error(Exception.NOT_INITIALIZED);
    }

    this.places = new Places();

    this.places.places = [this.source, ...this.via, this.destination];
    this.places.startNode = 0;
    this.places.endNode = this.places.places.length - 1;

    const startTime = this.source.open;
    this.places.places.forEach((place) => {
      if (place.open != undefined) {
        place.open -= startTime!;
      }
      if (place.close != undefined) {
        place.close -= startTime!;
      }
    });
  }

  private async constructRoute() {
    if (this.places == undefined) {
      this.generatePlaces();
      console.log('generated places:');
      console.log(this.places);
      console.log('generating routes');
      this.routes = await this.routeSearch.search(this.places!);
      console.log('done: generating routes');
      console.log(JSON.stringify(Route.toGeojson(...this.routes.flat())));
      this.startTime = Date.now();
    }
  }

  isEnded() {
    if (this.routes == undefined) return false;
    const ret = this.onMajor === this.routes.length;
    if (ret && this.startTime != undefined && this.duration == undefined) {
      this.duration = Date.now() - this.startTime;
    }
    return ret;
  }

  async addGPSInfo(coordinate: Coordinate, heading: Heading) {
    await this.constructRoute();
    if (this.onMajor == undefined) this.onMajor = 0;
    if (this.onMinor == undefined) this.onMinor = 0;

    if (this.isEnded()) {
      throw new Error(Exception.INVALID_VALUE);
    }

    const nowPoint = turf.point(coordinate.toLngLatArray());

    console.log(`major: ${this.onMajor} / ${this.routes?.length}`);
    console.log(
      `minor: ${this.onMinor} / ${this.routes![this.onMajor].length}`,
    );

    const destinationPoint = turf.point(
      this.routes![this.onMajor][this.onMinor].primaryRoute[1].toLatLngArray(),
    );
    let bearing = turf.bearing(nowPoint, destinationPoint);
    if (bearing < 0) bearing += 360;
    this.relativeHeading = Heading.angle(heading, bearing);

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
      const nextDestination = Route.lastCoordinate(
        this.routes![this.onMajor][this.onMinor!],
      );
      const route = await this.pathSearcher.search(coordinate, nextDestination);
      this.nextStep = route.steps[0];
      this.nextStep.maneuver = route.steps[1].maneuver;
      if (this.nextStep.maneuver.type === 'arrive') {
        if (
          this.onMinor === this.routes![this.onMajor].length - 1 &&
          this.nextStep.distance < 10
        ) {
          this.onMajor++;
          this.onMinor = 0;
        } else if (this.onMinor !== this.routes![this.onMajor].length - 1) {
          this.onMinor++;
        }
      }
    }
  }

  registerCoordinate(coordinate: Coordinate) {
    if (this.passed == undefined) this.passed = [];
    const nowPoint = turf.point(coordinate.toLngLatArray());
    if (this.passed.length === 0) {
      this.passed = [coordinate];
    } else {
      const lastPoint = turf.point(
        this.passed[this.passed.length - 1].toLngLatArray(),
      );
      if (
        turf.distance(nowPoint, lastPoint) > MapRouter.RECORD_DISTANCE_THRESHOLD
      ) {
        this.passed?.push(coordinate);
      }
    }
  }

  getGeoJson() {
    if (this.passed == undefined) throw new Error(Exception.NOT_INITIALIZED);
    const route: Route = {
      allDistance: 0,
      primaryRoute: this.passed,
      steps: [],
    };
    return Route.toGeojson(route);
  }
}
