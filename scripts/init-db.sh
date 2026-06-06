#!/usr/bin/env bash

set -e

echo "正在初始化 homecare_platform 数据库..."
echo "请确保本机已经安装 MySQL 客户端，并根据实际情况修改用户名密码。"
mysql -uroot -p < sql/homecare_platform.sql
echo "数据库初始化完成。"
