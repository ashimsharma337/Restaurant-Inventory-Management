FROM node:20-alpine

WORKDIR /app

# Copy dependency files first (improves build speed)
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Build the Next.js app
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]