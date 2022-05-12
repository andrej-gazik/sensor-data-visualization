FROM node:14.19-alpine
WORKDIR /app/frontend

COPY package.json package-lock.json ./
RUN npm install 
RUN npm install react-scripts@5.0.0 -g
COPY . ./
EXPOSE 3000