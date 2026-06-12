# Use an optimized, official lightweight Python base layer
FROM python:3.11-slim

# Set internal working directory parameters
WORKDIR /app

# Prevent Python from writing pyc files to disk and buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy dependency records and install pip modules
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend system files
COPY . .

# Expose the API transmission port
EXPOSE 8000

# Fire up the production-ready Uvicorn server bound to all network interfaces
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]