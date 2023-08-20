from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from pprint import pprint
from typing import Tuple, Dict


class Solver:
    windows: Dict[int, Tuple[int]] = {5: (18000, 18000)}
    penalty: Dict[int, int] = {}
    waiting_time_max = 3600
    zero_bind = True
    RATIO = 2

    def create_data_model(
        self, time_matrix=None, num_vehicles=1, depot=0, waiting=None
    ):
        self.data = {}
        if time_matrix is not None:
            self.data["time_matrix"] = time_matrix
        else:
            self.data["time_matrix"] = [
                [0, 1061, 1628, 2820, 1039, 0],
                [1061, 0, 2056, 3807, 991, 1061],
                [1628, 2056, 0, 3887, 2461, 1628],
                [2820, 3807, 3887, 0, 3665, 2820],
                [1039, 991, 2461, 3665, 0, 1039],
                [0, 1061, 1628, 2820, 1039, 0],
            ]
        if waiting is not None:
            self.data["waiting"] = waiting
        else:
            self.data["waiting"] = [0] * len(self.data["time_matrix"])
        self.data["num_vehicles"] = num_vehicles
        self.data["depot"] = depot

    def to_array(self, solution):
        ret = [{"order": -1, "time": 0} for _ in range(len(self.data["time_matrix"]))]
        vehicle_id = 0
        time_dimension = self.routing.GetDimensionOrDie("Time")
        index = self.routing.Start(vehicle_id)
        order = 0
        while not self.routing.IsEnd(index):
            time_var = time_dimension.CumulVar(index)
            time = solution.Min(time_var)
            node_index = self.manager.IndexToNode(index)
            ret[node_index] = {"order": order, "time": time}
            index = solution.Value(self.routing.NextVar(index))
            order += 1
        return ret

    def print_solution(self, assignment):
        """Prints assignment on console."""
        print(f"Objective: {assignment.ObjectiveValue()}")
        # Display dropped nodes.
        dropped_nodes = "Dropped nodes:"
        for node in range(self.routing.Size()):
            if self.routing.IsStart(node) or self.routing.IsEnd(node):
                continue
            if assignment.Value(self.routing.NextVar(node)) == node:
                dropped_nodes += f" {self.manager.IndexToNode(node)}"
        print(dropped_nodes)
        # Display routes
        total_distance = 0
        total_load = 0
        for vehicle_id in range(self.data["num_vehicles"]):
            index = self.routing.Start(vehicle_id)
            plan_output = f"Route for vehicle {vehicle_id}:\n"
            route_distance = 0
            route_load = 0
            while not self.routing.IsEnd(index):
                node_index = self.manager.IndexToNode(index)
                if node_index in self.penalty:
                    route_load += self.penalty[node_index]
                plan_output += f" {node_index} Load({route_load}) -> "
                previous_index = index
                index = assignment.Value(self.routing.NextVar(index))
                route_distance += self.routing.GetArcCostForVehicle(
                    previous_index, index, vehicle_id
                )
            plan_output += f" {self.manager.IndexToNode(index)} Load({route_load})\n"
            plan_output += f"Distance of the route: {route_distance}s\n"
            plan_output += f"Load of the route: {route_load}\n"
            print(plan_output)
            total_distance += route_distance
            total_load += route_load
        print(f"Total Distance of all routes: {total_distance}s")
        print(f"Total Load of all routes: {total_load}")

    def solve(self, end_time):
        self.manager = pywrapcp.RoutingIndexManager(
            len(self.data["time_matrix"]), self.data["num_vehicles"], self.data["depot"]
        )

        self.routing = pywrapcp.RoutingModel(self.manager)

        transit_callback_index = self.routing.RegisterTransitCallback(
            self.time_callback
        )

        time_dimension_name = "Time"
        self.routing.AddDimension(
            transit_callback_index,
            self.waiting_time_max,
            end_time,
            False,
            time_dimension_name,
        )
        time_dimension = self.routing.GetDimensionOrDie(time_dimension_name)
        # time_dimension.SetGlobalSpanCostCoefficient(1)

        def nostay_callback(from_index, to_index):
            from_node = self.manager.IndexToNode(from_index)
            to_node = self.manager.IndexToNode(to_index)
            return self.data["time_matrix"][from_node][to_node]

        nostay_callback_index = self.routing.RegisterTransitCallback(nostay_callback)
        self.routing.SetArcCostEvaluatorOfAllVehicles(nostay_callback_index)

        cost_dimension_name = "Cost"
        self.routing.AddDimension(
            nostay_callback_index, 0, end_time, True, cost_dimension_name
        )
        cost_dimension = self.routing.GetDimensionOrDie(cost_dimension_name)

        for node in self.windows:
            index = self.manager.NodeToIndex(node)
            time_dimension.CumulVar(index).SetRange(
                self.windows[node][0], self.windows[node][1]
            )

        for i in range(len(self.data["time_matrix"])):
            index = self.manager.NodeToIndex(i)

            condition = (
                time_dimension.SlackVar(index)
                <= cost_dimension.TransitVar(index) * Solver.RATIO
            )
            self.routing.solver().AddConstraint(condition)

        for i in range(self.data["num_vehicles"]):
            self.routing.AddVariableMinimizedByFinalizer(
                cost_dimension.CumulVar(self.routing.Start(i))
            )
            self.routing.AddVariableMinimizedByFinalizer(
                cost_dimension.CumulVar(self.routing.End(i))
            )

        for node in self.penalty:
            self.routing.AddDisjunction(
                [self.manager.NodeToIndex(node)], self.penalty[node]
            )

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.time_limit.seconds = 1
        # search_parameters.local_search_metaheuristic = (
        #     routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        # )

        solution = self.routing.SolveWithParameters(search_parameters)

        return solution

    def solveWithoutCostDimension(self, end_time):
        self.manager = pywrapcp.RoutingIndexManager(
            len(self.data["time_matrix"]), self.data["num_vehicles"], self.data["depot"]
        )

        self.routing = pywrapcp.RoutingModel(self.manager)

        transit_callback_index = self.routing.RegisterTransitCallback(
            self.time_callback
        )

        time_dimension_name = "Time"
        self.routing.AddDimension(
            transit_callback_index,
            self.waiting_time_max,
            end_time,
            False,
            time_dimension_name,
        )
        time_dimension = self.routing.GetDimensionOrDie(time_dimension_name)
        time_dimension.SetGlobalSpanCostCoefficient(1)

        # def nostay_callback(from_index, to_index):
        #     from_node = self.manager.IndexToNode(from_index)
        #     to_node = self.manager.IndexToNode(to_index)
        #     return self.data["time_matrix"][from_node][to_node]

        # nostay_callback_index = self.routing.RegisterTransitCallback(nostay_callback)
        self.routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # cost_dimension_name = "Cost"
        # self.routing.AddDimension(
        #     nostay_callback_index, 0, end_time, True, cost_dimension_name
        # )
        # cost_dimension = self.routing.GetDimensionOrDie(cost_dimension_name)

        for node in self.windows:
            index = self.manager.NodeToIndex(node)
            time_dimension.CumulVar(index).SetRange(
                self.windows[node][0], self.windows[node][1]
            )

        # for i in range(len(self.data["time_matrix"])):
        #     index = self.manager.NodeToIndex(i)

        #     condition = (
        #         time_dimension.SlackVar(index)
        #         <= cost_dimension.TransitVar(index) * Solver.RATIO
        #     )
        #     self.routing.solver().AddConstraint(condition)

        for i in range(self.data["num_vehicles"]):
            self.routing.AddVariableMinimizedByFinalizer(
                time_dimension.CumulVar(self.routing.Start(i))
            )
            self.routing.AddVariableMinimizedByFinalizer(
                time_dimension.CumulVar(self.routing.End(i))
            )

        for node in self.penalty:
            self.routing.AddDisjunction(
                [self.manager.NodeToIndex(node)], self.penalty[node]
            )
            print(
                "added disjunction of node {}, penalty: {}".format(
                    self.manager.NodeToIndex(node), self.penalty[node]
                )
            )

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_parameters.time_limit.seconds = 1
        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
        )

        solution = self.routing.SolveWithParameters(search_parameters)

        return solution

    def generate_time_callback(self):
        def time_callback(from_index, to_index):
            from_node = self.manager.IndexToNode(from_index)
            to_node = self.manager.IndexToNode(to_index)
            return (
                self.data["time_matrix"][from_node][to_node]
                + self.data["waiting"][from_node]
            )

        return time_callback

    def main(self):
        self.create_data_model()

        self.time_callback = self.generate_time_callback()

        solution = self.solve()

        if solution:
            pprint(self.to_array(solution))
        else:
            print("No solution found")


if __name__ == "__main__":
    solver = Solver()
    solver.main()
