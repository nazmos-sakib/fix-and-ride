FROM python:3-alpine

# Set working directory in the container
WORKDIR /app

# Copy your website files into the container
COPY . /app

# Expose port 5500
EXPOSE 5500

# Run the Python HTTP server on port 5500
CMD ["python3", "-m", "http.server", "5500", "--directory", "/app"]
