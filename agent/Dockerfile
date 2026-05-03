FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    procps \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV LOG_FILE=/var/log/sentinelx-agent.log
ENV LOG_LEVEL=INFO

CMD ["python", "-m", "sentinelx_agent.main"]
