# Architecture City — static Three.js viewer for Railway.
# Serves committed graph JSON + HTML. No build step, no secrets.
FROM caddy:2-alpine

ENV SITE_ROOT=/srv \
    PORT=8080

COPY Caddyfile /etc/caddy/Caddyfile

# Only runtime assets — keep the image dry for template deploys.
WORKDIR /srv
COPY index.html ./
COPY architecture-city-summary.json architecture-map.json source-manifest.json ./
COPY vendor ./vendor

EXPOSE 8080
