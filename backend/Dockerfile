# Use a specific version of Node on Alpine for a smaller, more secure base image
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application code
# Ensure ownership is set to the 'node' user
COPY --chown=node:node . .

# Use the non-privileged 'node' user for better security
USER node

# Expose the port the app runs on
EXPOSE 3000

# Use a standard healthcheck (optional but recommended for Docker/Compose)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

# Start the application
CMD ["npm", "start"]
