#!/usr/bin/env bash

set -e

echo "开始执行前端构建..."
npm install
npm run build

echo "构建完成。你可以将 dist 目录部署到 Nginx 或静态资源服务器。"
echo "建议后续配合 Spring Cloud 后端服务统一通过网关对外提供访问。"
