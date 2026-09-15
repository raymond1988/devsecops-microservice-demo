# Stage 1: Dependency Builder
FROM python:3.11-alpine AS builder
WORKDIR /app

RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache build-base gcc musl-dev libffi-dev

# Force-upgrade setuptools/pip in builder to clear base image defaults
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

COPY requirements.txt .
# Install packages system-wide inside Stage 1
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Hardened Runtime
FROM python:3.11-alpine
WORKDIR /app

RUN apk update && apk upgrade --no-cache \
    && addgroup -S appgroup && adduser -S appuser -G appgroup

# Remove pre-installed system site-packages from base image to prevent duplicate scans
RUN rm -rf /usr/local/lib/python3.11/site-packages/*

# Copy only the compiled dependencies from Stage 1
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY --chown=appuser:appgroup . .

USER appuser

VOLUME /tmp
EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]