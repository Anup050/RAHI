FROM node:18-alpine

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build the Next.js app
RUN npm run build

# Start the application
CMD ["npm", "start"]
