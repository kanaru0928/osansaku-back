import { RouteSearch } from "./routeSearch";

export interface RouteSearchBuilder{
  buildGraphConstructor(): void;
  buildOrderSearcher(): void;
  buildPathSearcher(): void;
  buildRandomizer(): void;
  getResult(): RouteSearch;
}