# HostelSphere Production Container for Google Cloud Run
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy application source
COPY . .

# Build Vite client assets and bundled Express production server
RUN npm run build

# Cloud Run defaults PORT=3000 if not specified
ENV PORT=3000
ENV NODE_ENV=production

# Document the port
EXPOSE 3000

# Start unified production server listening on 0.0.0.0:$PORT
CMD ["node", "dist/server.js"]
