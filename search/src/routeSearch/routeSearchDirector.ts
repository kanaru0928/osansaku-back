import { RouteSearchBuilder } from "./routeSearchBuilder";

export class RouteSearchDirector{
  private builder: RouteSearchBuilder;
  
  constructor(builder: RouteSearchBuilder){
    this.builder = builder;
  }
  
  construct(){
    this.builder.buildGraphConstructor();
    this.builder.buildOrderSearcher();
    this.builder.buildPathSearcher();
    this.builder.buildRandomizer();
    return this.builder.getResult();
  }
}
