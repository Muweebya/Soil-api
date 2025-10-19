FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package manifests (use package-lock.json if available for reproducible installs)
COPY package*.json ./

# Install dependencies — prefer npm ci when lockfile is present
RUN if [ -f package-lock.json ]; then npm ci --production=false; else npm install; fi

# Copy source
COPY . .

# If you have a build step (TypeScript, bundlers), run it here. Uncomment if applicable:
# RUN npm run build

####################
# 2) Production runtime stage
####################
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
# If you build into dist/, copy it; otherwise copy source files:
# COPY --from=builder /app/dist ./dist
COPY --from=builder /app ./

# Install only production deps in the runtime image
RUN npm ci --only=production 2>/dev/null || npm install --production


EXPOSE 5000

# Use the start script in package.json; ensure "start" is defined there.
# If your entry is e.g. index.js, app.js, or dist/index.js, adjust the CMD below.
CMD ["sh", "-c", "npm start"]
