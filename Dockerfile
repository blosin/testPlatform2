# 
# Build stage 1.
#
FROM node:14-alpine
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

#
# Build stage 2.
#
FROM node:14-alpine
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --only=production
COPY --from=0 /usr/src/app/dist ./dist
RUN npm install dist/platforms/sdk/pedidosYa 
ENTRYPOINT ["npm", "run"]
CMD ["serve"]