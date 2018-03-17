FROM node:8.9.1

COPY ./src /usr/src
COPY ./site /usr/site

RUN \
cd /usr/src && \
    npm install && \
    npm start