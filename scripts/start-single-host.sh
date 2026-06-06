#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "开始构建并启动单机部署环境..."
cd "${PROJECT_ROOT}/deploy"
docker compose up -d --build

echo "启动完成。"
echo "前端登录页: http://服务器IP/login"
echo "前端首页: http://服务器IP/"
echo "管理端首页: http://服务器IP/admin"
echo "网关端口: 8080"
echo "MySQL 端口: 3306"
echo "Redis 端口: 6379"
