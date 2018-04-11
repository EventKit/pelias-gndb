# base image
FROM pelias/baseimage

# ensure data dirs exists
RUN mkdir -p '/data/geographicnames'

# download apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y bzip2 && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

# clone repo
RUN git clone https://github.com/venicegeo/pelias-gndb.git /code/pelias/geographicnames

# change working dir
WORKDIR /code/pelias/geographicnames

# fetch new branches
RUN git fetch

# consume the build variables
ARG REVISION=master

# switch to desired revision
RUN git checkout $REVISION

# install npm dependencies
RUN npm install

# run tests
RUN npm test

# Explicitly download metadata (it will not be downloaded automatically in noninteractive sessions)
RUN npm run download_metadata
