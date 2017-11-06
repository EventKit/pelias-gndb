#!/usr/bin/env bash
if [ $# -eq 0 ]
  then
    tag='latest'
  else
    tag=$1
fi
# Make directory if non-existant
mkdir -p $DATA_DIR/geonamesmil

docker build -t geonamesmil:$tag .
