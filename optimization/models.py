from typing import List, Union
from pydantic import BaseModel, Field


class Solution(BaseModel):
    class __ResponseNodeInfo(BaseModel):
        order: int
        time: int

    nodes: List[__ResponseNodeInfo]


class OptimizeRequest(BaseModel):
    class RequestNodeInfo(BaseModel):
        open_time: Union[int, None]
        close_time: Union[int, None]
        stay: Union[int, None]

    nodes: List[RequestNodeInfo]
    time_matrix: List[List[int]]
    start_node: int
    end_node: int
