FROM python:slim

WORKDIR /usr/optimization

RUN pip3 install --upgrade pip wheel setuptools
COPY ./optimization/requirements.txt .
RUN pip install -r requirements.txt
