# Simple production image for Cloud Run
FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
