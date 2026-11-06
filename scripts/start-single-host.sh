#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "开始构建并启动单机部署环境..."
cd "${PROJECT_ROOT}/deploy"
docker compose up -d --build

echo "容器已启动；请检查 docker compose ps 和日志确认就绪。"
echo "前端: http://服务器IP/login"
echo "核心API通过同源 /api 访问；数据库不对外暴露。"
