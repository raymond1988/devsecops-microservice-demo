FROM python:3.11-alpine
WORKDIR /app
# Upgrade system packages to patch Alpine OS vulnerabilities
RUN apk update && apk upgrade --no-cache
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY requirements.txt .
# Upgrade Python packaging tools before installing application requirements
RUN pip install --no-cache-dir --upgrade pip setuptools wheel jaraco.context
COPY --chown=appuser:appgroup . .
USER appuser
EXPOSE 5000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]