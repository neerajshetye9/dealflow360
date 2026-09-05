FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx ts-node node_modules/knex/bin/cli.js migrate:latest --knexfile src/config/knexfile.ts && npx ts-node node_modules/knex/bin/cli.js seed:run --knexfile src/config/knexfile.ts && npm start"]
