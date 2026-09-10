FROM python:3.11-alpine
WORKDIR /app

# Upgrade system packages to patch Alpine OS vulnerabilities
RUN apk update && apk upgrade --no-cache
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY requirements.txt .

# 1. Upgrade packaging tools and force msgpack update
# 2. Install application dependencies from requirements.txt
RUN pip install --no-cache-dir --upgrade pip setuptools wheel jaraco.context "msgpack>=1.2.1" \
    && pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appgroup . .

USER appuser
EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]