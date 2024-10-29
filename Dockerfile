FROM node:16

# Set working directory
WORKDIR /usr/src/app

# Copy package information and lock files
COPY package.json yarn.lock ecosystem.config.js ./
COPY noodle/package.json ./noodle/package.json
COPY hermes/package.json ./hermes/package.json
COPY noodle-api/package.json ./noodle-api/package.json
COPY noodle-shared/package.json ./noodle-shared/package.json
COPY unicorn/package.json ./unicorn/package.json
COPY unicorn/component/package.json ./unicorn/component/package.json
COPY file-upload/package.json ./file-upload/package.json

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CYPRESS_INSTALL_BINARY=0

# Install dependencies
RUN yarn install --frozen-lockfile

# Install pm2 and pm2 graceful-intercom
RUN npm install pm2 -g
RUN pm2 install pm2-graceful-intercom

# Copy source files
COPY noodle ./noodle
COPY hermes ./hermes
COPY noodle-api ./noodle-api
COPY noodle-shared ./noodle-shared
COPY unicorn ./unicorn
COPY file-upload ./file-upload

# Generate Prisma client and build packages
RUN yarn workspace @withso/noodle-shared prisma:generate
RUN yarn workspace @withso/file-upload build
RUN yarn workspace @withso/noodle-shared build
RUN yarn workspace @withso/unicorn build

# Copy run.sh script
COPY run.sh ./run.sh

# Remove any pre-existing .env files to avoid conflicts
RUN rm .env || true
RUN rm ./noodle/.env || true
RUN rm ./hermes/.env || true
RUN rm ./noodle-api/.env || true
RUN rm ./noodle-shared/.env || true
RUN rm ./unicorn/.env || true
RUN rm ./file-upload/.env || true

# Set Node environment
ENV NODE_ENV production
ENV NODE_OPTIONS='--max-http-header-size=100000'

# Run the builds for noodle and unicorn
RUN yarn workspace @withso/noodle build
RUN cd unicorn && yarn build

# Make Railway-provided port accessible
ENV PORT=${PORT}

# Run the application
CMD ["sh", "./run.sh"]
