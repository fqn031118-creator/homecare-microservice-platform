#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "停止单机部署环境..."
cd "${PROJECT_ROOT}/deploy"
docker compose down

echo "已停止。"
