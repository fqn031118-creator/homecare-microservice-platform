#!/usr/bin/env bash

set -e

PROJECT_NAME="homecare-platform"
TARGET_DIR="/var/www/${PROJECT_NAME}"
NGINX_CONF_TARGET="/etc/nginx/conf.d/${PROJECT_NAME}.conf"

echo "1/6 安装依赖并构建前端..."
npm ci
npm run build

echo "2/6 创建目标目录..."
sudo mkdir -p "${TARGET_DIR}"

echo "3/6 同步构建产物..."
sudo rsync -av --delete dist/ "${TARGET_DIR}/"

echo "4/6 写入 Nginx 配置..."
sudo cp deploy/nginx.conf "${NGINX_CONF_TARGET}"

echo "5/6 检查 Nginx 配置..."
sudo nginx -t

echo "6/6 重载 Nginx..."
sudo systemctl reload nginx

echo "部署完成。"
echo "站点目录: ${TARGET_DIR}"
echo "Nginx 配置: ${NGINX_CONF_TARGET}"
