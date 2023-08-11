import { OSMGraphConstructor } from '../graph/osmGraphConstructor';
import { PrimaryFullSearch } from '../orderSearch/primaryFullSearch';
import { OSRMAdaptor } from '../pathSearch/osrmAdaptor';
import { Randomizer } from '../randomizer/randomizer';
import { RouteSearch } from './routeSearch';
import { RouteSearchBuilder } from './routeSearchBuilder';

export class DefaultRouteSearch implements RouteSearchBuilder {
  private routeSearch: RouteSearch;

  constructor() {
    this.routeSearch = new RouteSearch();
  }

  buildGraphConstructor(): void {
    this.routeSearch.setGraphConstructor(new OSMGraphConstructor());
  }

  buildOrderSearcher(): void {
    this.routeSearch.setOrderSearcher(new PrimaryFullSearch());
  }

  buildPathSearcher(): void {
    this.routeSearch.setPathSearcher(new OSRMAdaptor());
  }

  buildRandomizer(): void {
    this.routeSearch.setRandomizer(new Randomizer());
  }

  getResult(): RouteSearch {
    return this.routeSearch;
  }
}
