import { RouteSearch } from "./routeSearch";
import { RouteSearchBuilder } from "./routeSearchBuilder";

export class DefaultRouteSearch implements RouteSearchBuilder{
  private routeSearch: RouteSearch;
  
  constructor(){
    this.routeSearch = new RouteSearch();
  }
  
  buildGraphConstructor(): void {
    
  }
  
  buildOrderSearcher(): void {
    
  }
  
  buildPathSearcher(): void {
    
  }
  
  buildRandomizer(): void {
    
  }
  
  getResult(): RouteSearch {
    
  }
}