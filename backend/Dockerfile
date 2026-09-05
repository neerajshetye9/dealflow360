FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx knex migrate:latest --knexfile dist/config/knexfile.js && npx knex seed:run --knexfile dist/config/knexfile.js && npm start"]
