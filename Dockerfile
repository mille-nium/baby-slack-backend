FROM node:latest

WORKDIR /home/app
COPY . .

RUN npm install

CMD ["node", "app.js"]

EXPOSE 3003
