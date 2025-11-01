FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Create proper nginx config
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
listen 80;
server_name _;
root /usr/share/nginx/html;
index index.html;

# Serve static files directly
location / {
try_files $uri $uri/ @rewrite;
}

# Handle SPA routing - only rewrite to index.html for non-file requests
location @rewrite {
rewrite ^.*$ /index.html last;
}

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
expires 1y;
add_header Cache-Control "public, immutable";
try_files $uri =404;
}

# Handle HTML files
location ~* \.html$ {
add_header Cache-Control "no-cache, no-store, must-revalidate";
expires 0;
}
}
EOF

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]