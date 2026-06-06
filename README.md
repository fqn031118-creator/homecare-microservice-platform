# 智享到家 - 家政服务预约微服务平台

这是一个基于 `Spring Boot + Spring Cloud` 课程实训背景设计的前端演示项目，主题是 `家政服务预约平台`。

当前版本已经把 UI 草稿整合成一个可运行的 React + Vite 项目，并按课程项目上架/归档要求补齐了演示流程与文档骨架，覆盖：

- 用户登录页
- 用户端首页与服务浏览
- 用户端下单页
- 用户端订单追踪与评价
- 服务人员端任务调度中心
- 管理后台全局服务调度系统
- 微服务架构运行状态监控中心
- 项目业务逻辑说明页
- 订单异常流：取消、改约、退款、投诉
- API 调用适配层
- Spring Cloud 微服务后端骨架
- 系统设计文档、接口文档、部署文档
- 答辩材料
- 数据库初始化脚本与部署脚本示例

## 运行方式

在项目目录下执行：

```bash
npm install
npm run auth:dev
npm run dev -- --host 0.0.0.0 --port 4173
```

默认访问地址：

```bash
http://localhost:4173/
```

认证服务默认运行在：

```bash
http://127.0.0.1:8081/api/auth
```

认证服务现在默认连接 MySQL 的 `homecare_platform.users` 表。

启动认证服务前，请先准备好 MySQL，并导入：

```bash
sql/homecare_platform.sql
```

本地开发默认数据库配置：

```bash
AUTH_DB_URL=jdbc:mysql://127.0.0.1:3306/homecare_platform?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai&characterEncoding=utf8
AUTH_DB_USERNAME=root
AUTH_DB_PASSWORD=root123456
```

如果你使用项目里的 Docker Compose，`auth-service` 会自动连接到容器内的 `mysql` 服务。
认证服务启动时还会自动补齐消费者端、员工端、管理端三个演示账号。

演示账号：

- 消费者端：`13800000000 / 123456`
- 员工端：`13900000000 / 123456`
- 管理端：`13700000000 / 123456`

生产构建：

```bash
npm run build
```

## 单机一键部署

如果你要把前端、网关、后端骨架、MySQL 和 Redis 一起放到一台服务器上运行，项目已经提供单机 Docker 部署方案。

前提环境：

```bash
Docker
Docker Compose
```

启动命令：

```bash
chmod +x scripts/start-single-host.sh
bash scripts/start-single-host.sh
```

停止命令：

```bash
chmod +x scripts/stop-single-host.sh
bash scripts/stop-single-host.sh
```

默认入口：

```bash
http://服务器IP/login
```

## 页面路由

- `/login`：演示登录
- `/`：用户端首页 / 服务浏览与预约
- `/booking`：用户端预约下单
- `/orders`：用户端订单追踪与评价
- `/provider`：服务人员端任务调度中心
- `/admin`：管理后台全局服务调度系统
- `/ops`：微服务架构运行状态监控中心
- `/overview`：项目说明与业务逻辑

## 项目业务逻辑

系统围绕“用户预约上门服务”展开，主要流程如下：

1. 用户登录后浏览服务项目。
2. 用户选择服务、服务人员、预约时间和地址后提交订单。
3. 系统生成订单，订单进入 `待支付`。
4. 支付成功后订单进入 `待派单`。
5. 平台根据服务类型、服务区域、服务人员空闲状态完成派单。
6. 服务人员在工作台接单并查看任务日程。
7. 服务开始后订单进入 `服务中`。
8. 服务完成后订单进入 `已完成`。
9. 用户在订单页进行评分与评价。
10. 管理后台查看订单、服务人员状态、营收和告警。

## 建议的微服务拆分

- `gateway-service`：统一入口、路由转发、权限拦截
- `auth-service`：登录认证、JWT、角色权限
- `user-service`：用户信息、地址管理
- `service-item-service`：服务分类、服务项目、价格管理
- `order-service`：下单、状态流转、评价入口
- `staff-service`：服务人员资料、技能、排班、接单状态
- `dispatch-service`：派单与调度策略
- `payment-service`：模拟支付、账单与退款记录
- `report-service`：统计分析、业务报表、运营看板

## 当前实现说明

目前已经不是纯静态展示，而是 `共享状态驱动的前端业务演示系统 + MySQL 认证服务`，适合：

- 课程实训中期检查
- 成果演示
- 系统设计文档配图和业务讲解
- 后续继续接 Spring Cloud 后端接口

已实现的交互包括：

- 登录守卫与真实注册/登录
- 首页点击预约进入真实下单页
- 下单页支持表单校验并创建新订单
- 订单页可以完成支付，状态进入待派单
- 订单页支持取消订单、改约、退款申请、投诉提交
- 管理后台可以对首条待派单订单执行自动派单
- 服务人员端可以对待派单订单执行接单、开始服务、完成服务
- 订单页会根据状态变化开放评价功能
- 后台和监控页会同步读取订单与服务状态
- 多页面路由跳转与共享状态联动
- 全局操作反馈、空状态和 404 页面
- `src/api.js` 已作为前端调用适配层
- `backend/auth-service` 已提供基于 MySQL 用户表的认证接口

## 课程交付物目录

为满足课程任务书中“开发文档 + 数据库脚本 + 部署脚本”的要求，项目中已新增：

- `docs/系统设计文档.md`
- `docs/接口文档.md`
- `docs/部署文档.md`
- `docs/答辩材料/`
- `sql/homecare_platform.sql`
- `scripts/init-db.sh`
- `scripts/deploy.sh`
- `backend/`
- `deploy/docker-compose.yml`
- `backend/Dockerfile`
- `scripts/start-single-host.sh`
- `scripts/stop-single-host.sh`

## 后续建议

如果你要把它继续做成完整课程项目，下一步优先级建议是：

1. 搭 Spring Cloud 微服务骨架
2. 继续把订单、服务人员、库存等模块替换为真实接口
3. 接入 MySQL、Redis、Nacos、Gateway
4. 增加取消订单、退款、地址簿与搜索筛选
5. 完成最终部署文档、答辩 PPT 和小组分工说明
