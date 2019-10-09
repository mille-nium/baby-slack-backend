FROM node:latest

WORKDIR /home/app
COPY . .

CMD ["node", "app.js"]
