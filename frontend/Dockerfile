# ---------- Stage 1: build the React app ----------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies based on the lockfile-less manifest.
COPY package.json ./
RUN npm install

COPY . .

# VITE_API_URL is baked into the static bundle at build time. Override it for
# your deployment, e.g.  --build-arg VITE_API_URL=https://api.example.com
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Stage 2: serve with nginx ----------
FROM nginx:alpine AS runtime

# SPA-aware nginx config (history fallback to index.html).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:80/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
