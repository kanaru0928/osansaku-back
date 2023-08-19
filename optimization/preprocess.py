from models import OptimizeRequest
import numpy as np
from pprint import pprint
from easydict import EasyDict
from typing import List


class PreProcessor:
    def __extend_matrix(self):
        self.time_matrix = np.pad(self.time_matrix, (0, 1))
        self.time_matrix[-1] = self.time_matrix[0]
        # pprint(time_matrix)
        self.time_matrix[:, -1] = self.time_matrix[:, 0]

    def preprocess(self, req: OptimizeRequest):
        nodes = req.nodes

        start_node = req.start_node
        end_node = req.end_node

        assert end_node in nodes

        end_time = nodes[end_node].close_time

        assert nodes[start_node].open_time == 0

        windows = {
            i: (
                node.open_time if node.open_time is not None else 0,
                node.close_time if node.close_time is not None else end_time,
            )
            for i, node in nodes.items()
            if node.open_time is not None or node.close_time is not None
        }

        windows[start_node] = 0, end_time
        max_waiting_time = round(end_time / len(req.time_matrix) * 2)

        waiting = [nodes[i].stay if i in nodes else 0 for i in range(len(req.time_matrix))]

        return windows, waiting, max_waiting_time


if __name__ == "__main__":
    req = EasyDict()
    req.time_matrix = [
        [0, 1061, 1628, 2820, 1039],
        [1061, 0, 2056, 3807, 991],
        [1628, 2056, 0, 3887, 2461],
        [2820, 3807, 3887, 0, 3665],
        [1039, 991, 2461, 3665, 0],
    ]
    preprocessor = PreProcessor()
    pprint(preprocessor.preprocess(req))
