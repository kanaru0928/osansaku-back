import { GraphAdaptor } from "../graph/graphAdaptor";
import { GraphConstructor } from "../graph/graphConstructor";
import { OrderSearcher } from "../orderSearch/orderSearcher";
import { PathSearcher } from "../pathSearch/pathSearcher";
import { RandomizerTemplate } from "../randomizer/randomizerTemplate";

export class RouteSearch{
  private graph: GraphAdaptor;
  private graphConstructor: GraphConstructor;
  private orderSearcher: OrderSearcher;
  private randomizer: RandomizerTemplate;
  private pathSearcher: PathSearcher;
  
  setGraphConstructor(graphConstructor: GraphConstructor){
    this.graphConstructor = graphConstructor;
  }
  
  setOrderSearcher(orderSearcher: OrderSearcher){
    this.orderSearcher = orderSearcher;
  }
  
  setRandomizer(randomizer: RandomizerTemplate){
    this.randomizer = randomizer;
  }
  
  setPathSearcher(pathSearcher: PathSearcher){
    this.pathSearcher = pathSearcher;
  }
  
  search(){
    
  }
}