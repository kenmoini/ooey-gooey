# ========================================================================
# Build Stage
# ========================================================================
FROM registry.access.redhat.com/ubi9/nodejs-22:9.6 AS builder

WORKDIR /opt/app-root/src

# Copy in package.json and package-lock.json
COPY --chown=1001:1001 package*.json ./

# Install dependencies and devDependencies
RUN npm ci

# Copy in source code and other assets
COPY --chown=1001:1001 . .

# Compile the source TS into JS files
ENV NODE_ENV=local
RUN npm run build

# ========================================================================
# Final Stage
# ========================================================================
FROM registry.access.redhat.com/ubi9/httpd-24:latest

USER 0

RUN dnf update -y && \
    dnf clean all && \
    rm -rf /var/cache/yum

USER 1001

COPY --from=builder /opt/app-root/src/out /var/www/html

EXPOSE 8080
