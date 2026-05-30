# Use official Node.js image
FROM node:20-slim

# Create and set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory and set permissions for Hugging Face user (user 1000)
RUN mkdir -p /app/uploads && chown -R 1000:1000 /app

# Switch to non-root user 1000 for security on Hugging Face Spaces
USER 1000

# Hugging Face Spaces routes traffic to port 7860
ENV PORT=7860
EXPOSE 7860

# Start the application
CMD ["npm", "start"]
