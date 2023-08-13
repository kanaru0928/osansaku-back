FROM node:slim
WORKDIR /usr/search

COPY ./search/package.json /usr/search/package.json

# RUN apt update && apt install -y build-essential libosmium2-dev libprotozero-dev libutfcpp-dev libboost-dev zlib1g-dev libexpat1-dev libsparsehash-dev
RUN npm i

COPY . .
