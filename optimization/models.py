from typing import List, Union, Dict
from pydantic import BaseModel, Field


class Solution(BaseModel):
    class __ResponseNodeInfo(BaseModel):
        order: int
        time: int

    nodes: List[__ResponseNodeInfo]
    code: str


class OptimizeRequest(BaseModel):
    class RequestNodeInfo(BaseModel):
        open_time: Union[int, None] = Field(0)
        close_time: Union[int, None] = Field(None)
        stay: Union[int, None] = Field(0)

    nodes: Dict[int, RequestNodeInfo]
    time_matrix: List[List[int]]
    start_node: int
    end_node: int
