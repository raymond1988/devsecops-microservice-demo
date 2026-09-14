# Stage 1: Builder
FROM python:3.11-alpine AS builder
WORKDIR /app

RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache build-base gcc musl-dev libffi-dev

COPY requirements.txt .

# Install dependencies into system site-packages inside builder
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Stage 2: Hardened Runtime
FROM python:3.11-alpine
WORKDIR /app

RUN apk update && apk upgrade --no-cache \
    && addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy installed site-packages directly from Stage 1
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY --chown=appuser:appgroup . .

USER appuser

VOLUME /tmp

EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]