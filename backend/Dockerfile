# Use the official Node.js 22 image as the base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Verify that the dist directory exists
RUN test -d dist

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run", "start:prod"]