#!/bin/bash

cd `dirname $0`/geographic

# osm.pbfデータのダウンロード
if ! [ -f japan-latest.osm.pbf ] ; then
  wget https://download.geofabrik.de/asia/japan-latest.osm.pbf
else
  # osm.pbfを最新化
  osmupdate japan-latest.osm.pbf japan-latest-update.osm.pbf
  rm japan-latest.osm.pbf
  mv japan-latest-update.osm.pbf japan-latest.osm.pbf
fi

# OSRMのMLD用前処理
docker run --rm -t -v "./geographic:/data" osrm/osrm-backend osrm-extract -p /opt/foot.lua /data/japan-latest.osm.pbf
docker run --rm -t -v "./geographic:/data" osrm/osrm-backend osrm-partition /data/kanto-latest.osrm
docker run --rm -t -v "./geographic:/data" osrm/osrm-backend osrm-customize /data/kanto-latest.osrm
