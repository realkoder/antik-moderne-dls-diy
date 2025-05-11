# Build the image
# docker build \
#   --build-arg VITE_ENV=production \
#   --build-arg VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key \
#   --build-arg VITE_CLERK_SECRET_KEY=your_secret_key \
#   --build-arg VITE_CLERK_SIGN_IN_FALLBACK_URL=your_fallback_url \
#   --build-arg VITE_CLERK_SIGN_IN_URL=your_sign_in_url \
#   --build-arg VITE_BASE_URL=your_base_url \
#   --build-arg VITE_BASE_URL_SSR=your_base_url_ssr \
#   -t antik-moderne-frontend-app ./frontend

FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev --legacy-peer-deps

FROM node:20-alpine AS build-env

# Important to add the VITE_ENV like this else they will not be available to set at runtime
ARG VITE_ENV
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_CLERK_SECRET_KEY
ARG VITE_CLERK_SIGN_IN_FALLBACK_URL
ARG VITE_CLERK_SIGN_IN_URL
ARG VITE_BASE_URL
ARG VITE_BASE_URL_SSR

# Create temporary .env file from build args
RUN echo "VITE_ENV=$VITE_ENV" > .env.production && \
    echo "VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY" >> .env.production && \
    echo "VITE_CLERK_SECRET_KEY=$VITE_CLERK_SECRET_KEY" >> .env.production && \
    echo "VITE_CLERK_SIGN_IN_FALLBACK_URL=$VITE_CLERK_SIGN_IN_FALLBACK_URL" >> .env.production && \
    echo "VITE_CLERK_SIGN_IN_URL=$VITE_CLERK_SIGN_IN_URL" >> .env.production && \
    echo "VITE_BASE_URL=$VITE_BASE_URL" >> .env.production && \
    echo "VITE_BASE_URL_SSR=$VITE_BASE_URL_SSR" >> .env.production

COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build -- --mode production

FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["npm", "run", "start"]