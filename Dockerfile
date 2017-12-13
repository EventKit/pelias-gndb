# base image
FROM pelias/baseimage

# ensure data dirs exists
RUN mkdir -p '/data/geonamesmil'

# download apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y bzip2 && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

# clone repo
RUN git clone https://github.com/venicegeo/geonames-mil.git /code/pelias/geonamesmil

# change working dir
WORKDIR /code/pelias/geonamesmil

# fetch new branches
RUN git fetch

# consume the build variables
ARG REVISION=master

# switch to desired revision
RUN git checkout $REVISION

# install npm dependencies
RUN npm install

# Explicitly download metadata (it will not be downloaded automatically in noninteractive sessions)
RUN npm run download_metadata

# run tests
RUN npm test

# download meta data
RUN npm run download_metadata
