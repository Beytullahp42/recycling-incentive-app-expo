FROM node:22-bullseye-slim AS development

WORKDIR /app

ENV EXPO_NO_DOTENV=1
ENV EXPO_NO_TELEMETRY=1

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 8081 19000 19001 19002
CMD ["npm", "run", "start", "--", "--host", "lan", "--clear"]
