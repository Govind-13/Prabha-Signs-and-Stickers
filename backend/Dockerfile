# backend/Dockerfile
# Single-stage production image for Render deployment.
# Render injects PORT at runtime — do NOT hardcode it here.

FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Exclude local secrets and dev files (see .dockerignore)
# backend/.env must NOT be in the image

ENV NODE_ENV=production

# No hardcoded port — Render assigns PORT at runtime.
# CMD reads process.env.PORT which Render injects.
CMD ["node", "server.js"]
