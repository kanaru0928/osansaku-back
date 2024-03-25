FROM python:slim

WORKDIR /workspaces/optimization

RUN pip3 install --upgrade pip wheel setuptools
COPY ./requirements.txt /workspaces/optimization/requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt
