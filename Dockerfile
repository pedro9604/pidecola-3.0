FROM node:11

RUN npm install --quiet node-gyp -g

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 5000

CMD [ "node", "index.js" ]