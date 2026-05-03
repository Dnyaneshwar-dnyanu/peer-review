# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_REACT_APP_BACKEND_URL
ENV VITE_REACT_APP_BACKEND_URL=$VITE_REACT_APP_BACKEND_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx (unprivileged for better security)
FROM nginxinc/nginx-unprivileged:stable-alpine

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx config to handle React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Port 8080 is common for unprivileged nginx (default is 8080 in this image)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
