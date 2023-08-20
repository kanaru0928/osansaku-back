import { Route } from '../geometry/route';
import { Places } from '../orderSearch/places';
import { RouteSearch } from './routeSearch';
import { RouteSearchDirector } from './routeSearchDirector';

export class MapRouter {
  private director: RouteSearchDirector;
  private routeSearch: RouteSearch;
  private places = new Places();
  private routes?: Route[];

  constructor(director: RouteSearchDirector) {
    this.director = director;
    this.routeSearch = this.director.construct();
  }

  async constructRoute() {
    this.routes = await this.routeSearch.search(this.places);
  }
}
