# base image
FROM pelias/baseimage

# ensure data dirs exists
RUN mkdir -p '/data/geographicnames'

# download apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y bzip2 unzip && rm -rf /var/lib/apt/lists/*

# clone repo
RUN git clone https://github.com/venicegeo/pelias-gndb.git /code/pelias/geographicnames

# change working dir
ENV WORKDIR=/code/pelias/geographicnames
WORKDIR $WORKDIR

# fetch new branches
RUN git fetch

# consume the build variables
ARG REVISION=master

# switch to desired revision
RUN git checkout $REVISION

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORKDIR}
RUN npm install

# Copy code into image
ADD . $WORKDIR

# Explicitly download metadata (it will not be downloaded automatically in noninteractive sessions)
RUN npm run download_metadata

# run tests
RUN npm test

# run as the pelias user
USER pelias
