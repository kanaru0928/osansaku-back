from typing import Union, List
from pydantic import BaseModel

from fastapi import FastAPI

from models import Solution, OptimizeRequest
from optim import Solver

app = FastAPI()


@app.post("/optimize", response_model=Solution)
def optimize(req: OptimizeRequest):
    solver = Solver()
    solver.create_data_model
    solver.solve()
    return 
