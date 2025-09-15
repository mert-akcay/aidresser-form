# Simple Docker build for React/Vite application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install a simple static server
RUN npm install -g serve

# Expose port 3001
EXPOSE 3001

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "3001"]