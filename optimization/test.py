from optim import Solver


def optimize():
    solver = Solver()

    solver.create_data_model(
        [
            [0, 2820, 1628, 2866, 2065, 2134, 1838, 1339, 3513, 154],
            [2820, 0, 3887, 147, 2258, 2326, 1262, 1599, 708, 2774],
            [0, 3887, 0, 3931, 3392, 3460, 2992, 2538, 4578, 1723],
            [2866, 147, 3931, 0, 2308, 2376, 1312, 1646, 664, 2821],
            [2065, 2258, 3392, 2308, 0, 68, 1042, 1242, 2955, 1911],
            [2134, 2326, 3460, 2376, 68, 0, 1110, 1310, 3023, 1979],
            [1838, 1262, 2992, 1312, 1042, 1110, 0, 574, 1959, 1684],
            [1339, 1599, 2538, 1646, 1242, 1310, 574, 0, 2292, 1238],
            [3513, 708, 4578, 664, 2955, 3023, 1959, 2292, 0, 3467],
            [154, 2774, 1723, 2821, 1911, 1979, 1684, 1238, 3467, 0],
        ],
        depot=0,
    )
    solver.waiting_time_max = 0
    solver.windows = {
        0: (0, 9000),
        2: (9000, 9000)
    }
    solver.time_callback = solver.generate_time_callback()
    solver.penalty = {i: 1 for i in range(3, 10)}
    solver.zero_bind = False

    if True:
        print("solve without cost")
        solution = solver.solveWithoutCostDimension(9000)
    else:
        print("solve with cost")
        solution = solver.solve(req.nodes[req.end_node].close_time)

    if solution == None:
        raise Exception("No routes found")

    solver.print_solution(solution)

if __name__ == "__main__":
    optimize()
