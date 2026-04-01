# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Install Playwright browsers
RUN npx playwright install --with-deps

# Copy source code
COPY . .

# Build TypeScript (if needed)
# RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install Playwright dependencies
RUN apk add --no-cache \
    bash \
    curl

# Copy node_modules and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S playwright -u 1001

USER playwright

# Expose port if needed (adjust based on your app)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Default command
CMD ["npm", "run", "test"]
