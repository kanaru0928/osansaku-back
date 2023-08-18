from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
from pprint import pprint
from typing import Tuple, Dict


class Solver:
    windows: Dict[int, Tuple[int]] = {5: (18000, 18000)}
    waiting_time_max = 3600

    def create_data_model(self, time_matrix=None, num_vehicles=1, depot=0):
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

        self.data["num_vehicles"] = num_vehicles
        self.data["depot"] = depot

    def to_array(self, solution):
        ret = [{} for _ in range(len(self.data["time_matrix"]))]
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

    def print_solution(self, data, manager, routing, solution):
        """Prints solution on console."""
        print(f"Objective: {solution.ObjectiveValue()}")
        time_dimension = routing.GetDimensionOrDie("Time")
        total_time = 0
        for vehicle_id in range(data["num_vehicles"]):
            index = routing.Start(vehicle_id)
            plan_output = f"Route for vehicle {vehicle_id}:\n"
            while not routing.IsEnd(index):
                time_var = time_dimension.CumulVar(index)
                plan_output += (
                    f"{manager.IndexToNode(index)}"
                    f" Time({solution.Min(time_var)},{solution.Max(time_var)})"
                    " -> "
                )
                index = solution.Value(routing.NextVar(index))
            time_var = time_dimension.CumulVar(index)
            plan_output += (
                f"{manager.IndexToNode(index)}"
                f" Time({solution.Min(time_var)},{solution.Max(time_var)})\n"
            )
            plan_output += f"Time of the route: {solution.Min(time_var)}min\n"
            print(plan_output)
            total_time += solution.Min(time_var)
        print(f"Total time of all routes: {total_time}s")

    def solve(self):
        self.manager = pywrapcp.RoutingIndexManager(
            len(self.data["time_matrix"]), self.data["num_vehicles"], self.data["depot"]
        )

        self.routing = pywrapcp.RoutingModel(self.manager)

        transit_callback_index = self.routing.RegisterTransitCallback(
            self.time_callback
        )
        self.routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        dimention_name = "Time"
        self.routing.AddDimension(
            transit_callback_index, self.waiting_time_max, 18000, True, dimention_name
        )
        time_dimention = self.routing.GetDimensionOrDie(dimention_name)
        time_dimention.SetGlobalSpanCostCoefficient(18000)

        for node in self.windows:
            index = self.manager.NodeToIndex(node)
            time_dimention.CumulVar(index).SetRange(
                self.windows[node][0], self.windows[node][1]
            )

        for i in range(self.data["num_vehicles"]):
            self.routing.AddVariableMinimizedByFinalizer(
                time_dimention.CumulVar(self.routing.Start(i))
            )
            self.routing.AddVariableMinimizedByFinalizer(
                time_dimention.CumulVar(self.routing.End(i))
            )

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )

        solution = self.routing.SolveWithParameters(search_parameters)

        return solution

    def generate_time_callback(self):
        def time_callback(from_index, to_index):
            from_node = self.manager.IndexToNode(from_index)
            to_node = self.manager.IndexToNode(to_index)
            return self.data["time_matrix"][from_node][to_node]

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
