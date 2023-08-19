from typing import Union, List
from pydantic import BaseModel

from fastapi import FastAPI
from starlette.exceptions import HTTPException

from models import Solution, OptimizeRequest
from optim import Solver
from preprocess import PreProcessor

app = FastAPI()


@app.post("/optimize", response_model=Solution)
def optimize(req: OptimizeRequest):
    solver = Solver()
    preprocessor = PreProcessor()

    windows, waiting, waiting_time_max = preprocessor.preprocess(req)
    solver.create_data_model(req.time_matrix, depot=req.start_node, waiting=waiting)
    solver.waiting_time_max = waiting_time_max
    solver.windows = windows
    solver.time_callback = solver.generate_time_callback()

    solution = solver.solve()
    
    if solution == None:
        raise HTTPException(status_code=404, detail="ROUTE_NOT_FOUND")
    
    ret = {"nodes": solver.to_array(solution)}

    return ret
