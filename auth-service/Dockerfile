# Stage 1: Dependency Builder
FROM python:3.11-alpine AS builder
WORKDIR /app

RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache build-base gcc musl-dev libffi-dev

COPY requirements.txt .

# Install dependencies into user directory
RUN pip install --no-cache-dir --upgrade pip setuptools wheel jaraco.context \
    && pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Hardened Runtime
FROM python:3.11-alpine
WORKDIR /app

# Patch OS vulnerabilities and set up non-root user
RUN apk update && apk upgrade --no-cache \
    && addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built Python packages from Stage 1
COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appgroup . .

# Ensure appuser path includes local user-installed binaries (e.g. uvicorn)
ENV PATH=/home/appuser/.local/bin:$PATH
USER appuser

# Designate explicit ephemeral volume mount point
VOLUME /tmp

EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]