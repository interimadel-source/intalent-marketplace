FROM python:3.12-slim

WORKDIR /app

# Copy application source
COPY . /app

# Create persistent data directory for SQLite and file uploads
RUN mkdir -p /data/uploads

ENV HOST=0.0.0.0
ENV PORT=8000
ENV INTALENT_DB_PATH=/data/intalent.db
ENV INTALENT_UPLOAD_DIR=/data/uploads

EXPOSE 8000

CMD ["python", "server.py"]
