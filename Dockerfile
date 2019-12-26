FROM node:alpine
WORKDIR /opt/streamtv
COPY package.json /opt/streamtv
COPY package-lock.json /opt/streamtv
RUN cd /opt/streamtv && npm install
COPY . .
CMD ['node']
