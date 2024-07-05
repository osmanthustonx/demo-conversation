FROM node:lts-slim

RUN mkdir -p /usr/src/bot

# Create app directory
WORKDIR /usr/src/bot

# Bundle app source
COPY bot /usr/src/bot

# Install app dependencies
RUN npm ci

# # Type check app
# RUN npm run typecheck

RUN npm run build
# Start the app

EXPOSE 3000

CMD ["npm", "run", "start:force"]