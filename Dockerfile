FROM docker.io/node:16

RUN mkdir -p /app

RUN chown node:node /app

WORKDIR /app

COPY --chown=node:node package.json .
COPY --chown=node:node yarn.lock .

USER node

RUN yarn

COPY --chown=node:node . .

CMD yarn start

EXPOSE 3000