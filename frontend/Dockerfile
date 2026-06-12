# Use an official lightweight Node engine image
FROM node:18-slim

# Set layout directory paths
WORKDIR /app

# Copy package structures and run clean install routines
COPY package*.json .
RUN npm install

# Copy all user interface application assets
COPY . .

# Expose the local Vite hot-reload dev channel port
EXPOSE 5173

# Execute Vite app server, adding the --host flag to allow mapping outside the container
CMD ["npm", "run", "dev", "--", "--host"]