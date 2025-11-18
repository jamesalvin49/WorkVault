# Resource Manager - Docker Deployment

This application helps organize and quickly access workplace resources including URLs, file system paths, and colleague contact information.

## Quick Start with Docker

### Development Environment

```bash
# Clone and navigate to the project
git clone <repository-url>
cd resource-manager

# Build and run with Docker Compose
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### Production Environment

```bash
# Use the production configuration
docker-compose -f docker-compose.prod.yml up --build -d
```

The application will be available at `http://localhost` (port 80) with optional HTTPS support.

## Environment Variables

- `NODE_ENV`: Set to `production` for production deployment
- `DATABASE_URL`: SQLite database file path (default: `file:./data/dev.db`)

## Data Persistence

The SQLite database is mounted as a volume at `/app/data` to ensure data persistence across container restarts.

## Health Check

The application includes a health check endpoint at `/api/health` that returns:
- `status`: "healthy" or "unhealthy"
- `timestamp`: Current server time
- `uptime`: Server uptime in seconds

## SSL/HTTPS Setup (Optional)

1. Create SSL certificates in the `./ssl` directory:
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. Uncomment the HTTPS server block in `nginx.conf`

3. Restart with the production configuration

## Container Management

```bash
# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild without cache
docker-compose build --no-cache

# Access the container
docker-compose exec app sh
```

## Scaling

For horizontal scaling, consider using an external database instead of SQLite and implement proper load balancing.

## Monitoring

The application includes built-in health checks. For production monitoring, consider integrating with:
- Prometheus for metrics collection
- Grafana for visualization
- Log aggregation tools like ELK stack