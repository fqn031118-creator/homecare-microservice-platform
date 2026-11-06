# 智享到家家政服务预约平台

JavaEE课程设计项目。React 18 + Vite 前端，Java 17 + Spring Boot 3.3.1 / Spring MVC 后端，JdbcTemplate + MySQL 数据访问。核心业务使用 Controller → Service → Repository 三层结构。

## 当前完成范围

- 数据库会话认证：随机256位令牌、摘要存储、2小时过期、注销撤销。
- BCrypt密码，旧SHA-256密码成功登录后迁移；不接受旧明文密码，不再回退本地认证。
- 真实数据库订单：预约 → 模拟支付 → 派单 → 接单 → 开始 → 完工 → 评价。
- 订单归属、角色、人员绑定、在线状态、前置状态校验。
- 事务与行锁处理并发派单/接单；支付每单唯一，重复请求幂等；评价每单唯一。
- 取消未支付订单、派单前改约、退款/投诉申请持久化与操作审计。
- 前端按服务器数据刷新；清除旧浏览器演示订单及明文认证存储。

核心业务暂集中在 `auth-service`，以同库事务保证一致性。网关、订单、人员、支付独立模块仍为扩展骨架，不宣称已经实现分布式事务或完整微服务治理。支付不真实扣款；退款/投诉仅记录申请，审批与退款执行待实现。库存仍为展示样例。

## 本地启动

需要 JDK 17、Maven、Node.js 20+、MySQL。MySQL 8.0为部署目标，本次真实接口验证使用本机隔离MySQL 9.6.0；H2只用于自动化测试。

**首次安装到空数据库**，在仓库根目录执行：

```bash
mysql -u root -p < sql/install.sql
```

`install.sql`包含建库、基础表、种子数据及v2扩展。只对空库执行一次。已有旧版数据库先备份、处理孤立引用和重复支付记录，再执行一次 `sql/upgrade_v2.sql`；该升级不含版本自动检测，禁止重复执行。旧明文账号需要管理员重置为BCrypt；不要恢复明文兼容。

```bash
export AUTH_DB_URL='jdbc:mysql://127.0.0.1:3306/homecare_platform?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai&characterEncoding=utf8'
export AUTH_DB_USERNAME='your_app_user'
export AUTH_DB_PASSWORD='your_database_password'
# 只在课堂演示环境启用，创建示例账号并绑定Sarah人员档案
export SPRING_PROFILES_ACTIVE=demo
mvn -f backend/auth-service/pom.xml spring-boot:run
```

另一个终端：

```bash
npm ci
cp .env.example .env.local
npm run dev
```

访问 Vite 输出的地址。默认后端8081，前端5173。跨域仅允许localhost/127.0.0.1来源，GET/POST/PUT/OPTIONS；远程部署建议使用同源反向代理。

## 演示账号

仅 `demo` profile 自动配置；生产环境不启用该profile。默认账号只用于本地教学，不部署到公网。

| 身份 | 手机号 | 密码 |
|---|---|---|
| 消费者 | 13800000000 | Demo123456! |
| 服务人员Sarah | 13900000000 | Demo123456! |
| 管理员 | 13700000000 | Demo123456! |

新注册用户只能成为customer；不支持客户端自选管理员角色。管理员派单应选择已绑定账号且在线空闲的人员，目前demo绑定provider-2。其余人员仅为档案展示，未绑定账号时不能派单。

## 验证

```bash
mvn -f backend/pom.xml test
npm run build
# 服务已启动、空白演示库已初始化；脚本会新增测试订单与测试账号
node scripts/verify-api.mjs
```

接口脚本可通过 `API_BASE`、`DEMO_PASSWORD`覆盖配置。不要对生产数据库运行验证脚本。完整结果见 `docs/验证记录.md`。

## Docker部署

```bash
cp deploy/.env.example deploy/.env
# 编辑deploy/.env中的数据库密码
./scripts/start-single-host.sh
```

Compose运行前端、核心业务服务和MySQL，数据库健康检查通过后启动服务，Nginx将 `/api/`代理至核心服务。MySQL及后端端口不映射公网。首次空卷自动执行install.sql；已有数据库卷不会重跑初始化。当前环境未安装Docker，Compose路径经过配置检查但未实际启动验证。

## 文档与答辩

- `docs/系统设计文档.md`：架构与实现边界。
- `docs/接口文档.md`：真实接口与错误状态。
- `docs/部署文档.md`：初始化、升级与维护。
- `docs/验证记录.md`：执行证据与未测范围。
- `docs/答辩演示.md`：三角色演示步骤。
- `docs/课程设计/`：与实现同步的两份Word文档。

生产化待办包括HTTPS、登录限流、会话管理界面、隐私授权/删除、订单分页、售后审批、技能与时段匹配、压测和容器实际验证。
