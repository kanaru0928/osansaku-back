FROM node:slim
WORKDIR /usr/search

COPY package.json /uer/search/package.json

# RUN apt update && apt install build-essential libosmium2-dev libprotozero-dev libutfcpp-dev libboost-dev zlib1g-dev libexpat1-dev libsparsehash-dev
RUN npm i

COPY . .
