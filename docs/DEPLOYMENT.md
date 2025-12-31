# Deployment Guide

## Prerequisites

- Node.js 18+ (LTS recommended)
- MySQL 8.0+
- Nginx or Apache (for production)
- PM2 or systemd (for process management)

## Production Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### 2. Database Setup

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p << EOF
CREATE DATABASE drpdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'drpuser'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON drpdb.* TO 'drpuser'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import schema
mysql -u drpuser -p drpdb < backend/schema.sql
```

### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/zbysekmartoch/drp.git /var/www/drp
cd /var/www/drp

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Configure environment
cp backend/.env.example backend/.env
nano backend/.env
```

Edit `.env`:
```
PORT=3001
DB_HOST=localhost
DB_USER=drpuser
DB_PASSWORD=your-secure-password
DB_NAME=drpdb
JWT_SECRET=your-very-long-random-secret-key
UPLOAD_DIR=./uploads
```

### 4. Process Management with PM2

```bash
# Start backend
cd /var/www/drp/backend
pm2 start src/index.js --name drp-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/drp`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (static files)
    location / {
        root /var/www/drp/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # File upload size
        client_max_body_size 50M;
    }

    # Uploaded files (if serving directly)
    location /uploads {
        alias /var/www/drp/backend/uploads;
        internal;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/drp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 7. Firewall Configuration

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 3001 |
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | - |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | drpdb |
| `JWT_SECRET` | Secret for JWT tokens | - |
| `UPLOAD_DIR` | File upload directory | ./uploads |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 52428800 |

## Backup Strategy

### Database Backup

```bash
#!/bin/bash
# /etc/cron.daily/drp-backup

DATE=$(date +%Y%m%d)
BACKUP_DIR=/var/backups/drp

mysqldump -u drpuser -p'password' drpdb > $BACKUP_DIR/db-$DATE.sql
gzip $BACKUP_DIR/db-$DATE.sql

# Keep last 30 days
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +30 -delete
```

### File Backup

```bash
# Sync uploads to backup location
rsync -av /var/www/drp/backend/uploads/ /var/backups/drp/uploads/
```

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs drp-backend
pm2 status
```

### Health Check Endpoint

The API provides a health check:
```bash
curl http://localhost:3001/api/health
```

## Updating

```bash
cd /var/www/drp

# Pull latest changes
git pull origin main

# Update dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Restart backend
pm2 restart drp-backend
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if backend is running: `pm2 status`
   - Check backend logs: `pm2 logs drp-backend`

2. **Database Connection Error**
   - Verify MySQL is running: `sudo systemctl status mysql`
   - Check credentials in `.env`

3. **File Upload Fails**
   - Check Nginx `client_max_body_size`
   - Verify upload directory permissions

4. **CORS Errors**
   - Ensure API is proxied through Nginx, not accessed directly

### Logs

```bash
# Backend logs
pm2 logs drp-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```
