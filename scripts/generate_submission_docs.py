from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.shared import Inches, Pt


ROOT = Path("/Users/fqn/Documents/前端大作业")
OUTPUT_DIR = ROOT / "学生" / "开发文档（每组交一份）"


def set_chinese_font(run, font_name="微软雅黑", size=11, bold=False):
    run.font.name = font_name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), font_name)
    run.font.size = Pt(size)
    run.bold = bold


def set_doc_defaults(document: Document):
    normal = document.styles["Normal"]
    normal.font.name = "微软雅黑"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "微软雅黑")
    normal.font.size = Pt(11)

    for style_name, size in [("Title", 20), ("Heading 1", 16), ("Heading 2", 14), ("Heading 3", 12)]:
        style = document.styles[style_name]
        style.font.name = "微软雅黑"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "微软雅黑")
        style.font.size = Pt(size)
        style.font.bold = True

    section = document.sections[0]
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)


def add_title(document: Document, title: str, subtitle: str):
    p = document.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(title)
    set_chinese_font(run, size=20, bold=True)

    p2 = document.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run2 = p2.add_run(subtitle)
    set_chinese_font(run2, size=11)

    document.add_paragraph()


def add_paragraph(document: Document, text: str, bold=False):
    p = document.add_paragraph()
    run = p.add_run(text)
    set_chinese_font(run, size=11, bold=bold)
    return p


def add_bullets(document: Document, items: list[str]):
    for item in items:
        p = document.add_paragraph(style="List Bullet")
        run = p.add_run(item)
        set_chinese_font(run, size=11)


def add_table(document: Document, headers: list[str], rows: list[list[str]]):
    table = document.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.autofit = True

    hdr_cells = table.rows[0].cells
    for idx, header in enumerate(headers):
        hdr_cells[idx].text = header
        for paragraph in hdr_cells[idx].paragraphs:
            for run in paragraph.runs:
                set_chinese_font(run, size=10.5, bold=True)

    for row in rows:
        cells = table.add_row().cells
        for idx, value in enumerate(row):
            cells[idx].text = value
            for paragraph in cells[idx].paragraphs:
                for run in paragraph.runs:
                    set_chinese_font(run, size=10.5)

    document.add_paragraph()


def build_deployment_doc() -> Document:
    doc = Document()
    set_doc_defaults(doc)
    add_title(doc, "智享到家家政服务平台系统部署文档", "适用于课程项目提交、开发交接与答辩展示")

    doc.add_heading("1. 文档目的", level=1)
    add_paragraph(
        doc,
        "本文档用于说明“智享到家家政服务平台”的部署架构、运行环境、部署步骤、端口规划、运维命令与常见问题处理方式，供开发、运维与课程答辩人员统一参考。"
    )

    doc.add_heading("2. 系统概述", level=1)
    add_paragraph(
        doc,
        "本系统是一个面向家政服务预约场景的三端一体化平台，前端采用 React + Vite 构建，后端采用 Spring Cloud 微服务骨架，数据库使用 MySQL，缓存使用 Redis。系统通过统一登录入口区分消费者端、员工端和管理端。"
    )
    add_bullets(
        doc,
        [
            "统一登录入口：/login",
            "消费者端首页：/",
            "员工端首页：/provider",
            "管理端首页：/admin",
            "后端骨架服务：gateway-service、auth-service、order-service、staff-service、payment-service",
        ],
    )

    doc.add_heading("3. 部署架构说明", level=1)
    add_paragraph(
        doc,
        "本项目当前采用“单机 Docker 部署”方案，即将前端静态站点、Nginx 容器、Spring Cloud 微服务骨架、MySQL 和 Redis 统一部署在同一台 Linux 云服务器上，适合课程展示、功能演示与中小规模测试。"
    )
    add_table(
        doc,
        ["组件", "作用", "说明"],
        [
            ["frontend", "前端站点", "基于 Nginx 提供 React 构建后的 dist 静态资源"],
            ["gateway-service", "网关服务", "统一网关入口，后续承接路由转发与鉴权过滤"],
            ["auth-service", "认证服务", "负责登录认证、用户信息与权限基础能力"],
            ["order-service", "订单服务", "负责下单、支付状态、订单流转与售后接口规范"],
            ["staff-service", "员工服务", "负责派单、接单、排班、库存和客户管理等运营接口"],
            ["payment-service", "支付服务", "负责支付单、退款单与支付状态查询"],
            ["mysql", "关系型数据库", "存储订单、用户、服务项目与运营数据"],
            ["redis", "缓存服务", "缓存会话、状态和热点数据"],
        ],
    )

    doc.add_heading("4. 部署环境要求", level=1)
    add_table(
        doc,
        ["分类", "配置要求", "本项目推荐值"],
        [
            ["操作系统", "Linux 服务器", "CentOS 8.4 / Ubuntu 22.04 及以上"],
            ["CPU", "至少 2 核", "2 核即可满足课程演示"],
            ["内存", "至少 2GB", "2GB~4GB"],
            ["磁盘", "至少 20GB", "30GB 以上更稳妥"],
            ["Node.js", "用于前端本地构建", "20.x"],
            ["Docker", "用于容器化部署", "26.x"],
            ["Docker Compose", "用于单机编排", "v2.x"],
            ["MySQL", "关系型数据库", "8.0"],
            ["Redis", "缓存组件", "7.x"],
        ],
    )

    doc.add_heading("5. 关键目录与文件", level=1)
    add_table(
        doc,
        ["路径/文件", "用途说明"],
        [
            ["Dockerfile", "前端镜像构建文件，负责执行 npm build 并将 dist 发布到 Nginx"],
            ["backend/Dockerfile", "后端各微服务共用镜像构建文件"],
            ["deploy/docker-compose.yml", "单机环境下的容器编排定义"],
            ["deploy/nginx.conf", "前端站点 Nginx 配置，支持单页应用路由回退"],
            ["scripts/start-single-host.sh", "单机一键启动脚本"],
            ["scripts/stop-single-host.sh", "单机停止脚本"],
            ["sql/homecare_platform.sql", "数据库初始化脚本"],
        ],
    )

    doc.add_heading("6. 部署步骤", level=1)
    doc.add_heading("6.1 上传项目代码", level=2)
    add_paragraph(doc, "将完整项目上传至服务器，例如部署目录可设为：/root/projects/stitch_ 3")

    doc.add_heading("6.2 安装 Docker 与 Docker Compose", level=2)
    add_paragraph(doc, "在 CentOS 8.4 服务器中，可先配置镜像源后安装 Docker CE、docker-compose-plugin。")
    add_paragraph(
        doc,
        "典型命令：yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin"
    )

    doc.add_heading("6.3 启动单机部署", level=2)
    add_paragraph(doc, "在项目根目录执行以下命令，即可按 docker-compose.yml 启动完整单机环境：")
    add_bullets(
        doc,
        [
            "chmod +x scripts/start-single-host.sh",
            "bash scripts/start-single-host.sh",
        ],
    )

    doc.add_heading("6.4 前端单独启动方式", level=2)
    add_paragraph(doc, "若课程展示阶段只需优先暴露前端站点，可单独构建并启动前端容器：")
    add_bullets(
        doc,
        [
            "docker build -t homecare-frontend:latest .",
            "docker run -d --restart unless-stopped --name homecare-frontend -p 80:80 -p 8080:80 homecare-frontend:latest",
        ],
    )

    doc.add_heading("6.5 NAT 转发配置说明", level=2)
    add_paragraph(
        doc,
        "本次购买的云服务器采用“公网 IP + NAT 端口映射”的访问方式，因此除了服务器内部服务启动外，还必须在云控制台额外配置 NAT 转发规则。"
    )
    add_table(
        doc,
        ["用途", "外部端口", "内部端口", "协议", "说明"],
        [
            ["SSH 登录", "65138", "22", "TCP", "用于远程连接服务器"],
            ["前端网站", "65139", "80", "TCP", "将公网访问转发到前端 Nginx 容器"],
        ],
    )

    doc.add_heading("7. 端口规划", level=1)
    add_table(
        doc,
        ["服务", "容器/服务端口", "用途"],
        [
            ["前端站点", "80", "浏览器访问入口"],
            ["gateway-service", "8080", "统一网关端口"],
            ["auth-service", "8081", "认证服务端口"],
            ["order-service", "8082", "订单服务端口"],
            ["staff-service", "8083", "员工服务端口"],
            ["payment-service", "8084", "支付服务端口"],
            ["MySQL", "3306", "数据库端口"],
            ["Redis", "6379", "缓存端口"],
        ],
    )

    doc.add_heading("8. 启动后验证方式", level=1)
    add_table(
        doc,
        ["验证项", "访问方式", "期望结果"],
        [
            ["登录页", "http://服务器IP/login", "出现统一登录入口"],
            ["消费者端", "http://服务器IP/", "出现消费者首页"],
            ["员工端", "http://服务器IP/provider", "出现员工工作台"],
            ["管理端", "http://服务器IP/admin", "出现管理控制台"],
            ["auth 健康检查", "http://服务器IP:8081/health", "返回 auth-service ok"],
            ["order 健康检查", "http://服务器IP:8082/health", "返回 order-service ok"],
            ["staff 健康检查", "http://服务器IP:8083/health", "返回 staff-service ok"],
            ["payment 健康检查", "http://服务器IP:8084/health", "返回 payment-service ok"],
        ],
    )

    doc.add_heading("9. 实际演示环境记录", level=1)
    add_table(
        doc,
        ["项目", "实际信息"],
        [
            ["公网入口 IP", "222.186.21.45"],
            ["SSH 地址", "222.186.21.45:65138"],
            ["站点访问地址", "http://222.186.21.45:65139/login"],
            ["服务器系统", "CentOS-8.4.2105-x64"],
            ["部署方式", "Docker 单机部署 + NAT 转发"],
        ],
    )
    add_paragraph(
        doc,
        "说明：该云主机不是标准独立公网 80/443 直连模式，因此课程演示时应优先使用 NAT 映射后的固定地址。若后续用于正式上线，再补域名、备案与 HTTPS 配置更合适。"
    )

    doc.add_heading("10. 常用运维命令", level=1)
    add_table(
        doc,
        ["操作", "命令"],
        [
            ["查看容器状态", "docker ps"],
            ["查看前端日志", "docker logs -f homecare-frontend"],
            ["停止单机环境", "bash scripts/stop-single-host.sh"],
            ["重新启动单机环境", "bash scripts/start-single-host.sh"],
            ["查看端口监听", "ss -lntp"],
            ["测试本机站点", "curl -I http://127.0.0.1:80/login"],
        ],
    )

    doc.add_heading("11. 常见问题与处理", level=1)
    add_table(
        doc,
        ["问题", "可能原因", "处理办法"],
        [
            ["浏览器访问 404", "Nginx 未配置 SPA 路由回退", "检查 deploy/nginx.conf 中是否包含 try_files $uri $uri/ /index.html"],
            ["公网地址无法访问", "NAT 转发未配置或失效", "检查云控制台中 65139 -> 80 的转发规则"],
            ["能访问服务器但页面空白", "dist 资源未更新", "重新执行 npm run build 或重新构建前端镜像"],
            ["MySQL 拉取很慢", "镜像源网络较差", "更换国内 Docker 镜像源并重试拉取"],
            ["微服务端口冲突", "主机端口已被其他进程占用", "用 ss -lntp 检查后修改映射端口"],
        ],
    )

    doc.add_heading("12. 结论", level=1)
    add_paragraph(
        doc,
        "本项目已经具备从本地开发、前端构建、容器化打包、单机部署到公网演示访问的完整链路。当前部署方案能够满足课程项目展示、教师验收和功能演示需求；如果后续需要进一步上线商用，可在现有基础上继续扩展网关路由、业务接口、域名、HTTPS 与完整微服务治理能力。"
    )

    return doc


def build_interface_doc() -> Document:
    doc = Document()
    set_doc_defaults(doc)
    add_title(doc, "智享到家家政服务平台系统接口文档", "依据当前 Spring Cloud 工程骨架与前端联调接口规范整理")

    doc.add_heading("1. 文档说明", level=1)
    add_paragraph(
        doc,
        "本文档用于说明系统微服务接口划分、接口调用规范、当前已落地的健康检查接口，以及前后端联调阶段约定的核心业务接口。当前后端工程仍处于“骨架 + mock 联调”阶段，因此文档会同时区分“已实现接口”和“规划接口”。"
    )

    doc.add_heading("2. 微服务划分", level=1)
    add_table(
        doc,
        ["服务名", "端口", "职责说明"],
        [
            ["gateway-service", "8080", "统一网关入口，后续承接路由转发、统一鉴权、跨域与限流"],
            ["auth-service", "8081", "负责登录认证、用户身份与角色信息"],
            ["order-service", "8082", "负责订单创建、支付状态、取消、改约、评价与售后流程"],
            ["staff-service", "8083", "负责服务人员、排班、派单、接单、完工与运营管理接口"],
            ["payment-service", "8084", "负责支付单、退款单、支付查询与支付回调"],
        ],
    )

    doc.add_heading("3. 接口调用规范", level=1)
    add_table(
        doc,
        ["项目", "规范说明"],
        [
            ["通信协议", "HTTP / HTTPS"],
            ["数据格式", "application/json;charset=UTF-8"],
            ["字符编码", "UTF-8"],
            ["鉴权方式", "Authorization: Bearer <token>"],
            ["时间格式", "yyyy-MM-dd HH:mm:ss"],
            ["主键风格", "字符串主键，如 PH-2024-8836、svc-001、provider-1"],
        ],
    )
    add_paragraph(doc, "推荐统一响应结构如下：")
    add_paragraph(
        doc,
        '{"code": 200, "message": "success", "data": { ... }}'
    )

    doc.add_heading("4. 当前已实现接口", level=1)
    add_paragraph(
        doc,
        "当前 Spring Boot 工程骨架中已经真正存在的 REST 接口为各服务健康检查接口，主要用于验证微服务能否正常启动和监听端口。"
    )
    add_table(
        doc,
        ["服务", "方法", "路径", "说明", "返回示例"],
        [
            ["auth-service", "GET", "/health", "认证服务健康检查", "auth-service ok"],
            ["order-service", "GET", "/health", "订单服务健康检查", "order-service ok"],
            ["staff-service", "GET", "/health", "员工服务健康检查", "staff-service ok"],
            ["payment-service", "GET", "/health", "支付服务健康检查", "payment-service ok"],
        ],
    )

    doc.add_heading("5. 网关统一前缀设计", level=1)
    add_paragraph(
        doc,
        "为保持前后端彻底分离，业务接口建议统一经 gateway-service 暴露，前端只访问网关，网关再转发到具体微服务。推荐采用如下路径前缀："
    )
    add_table(
        doc,
        ["网关前缀", "目标服务", "说明"],
        [
            ["/api/auth/**", "auth-service", "登录、退出、用户信息"],
            ["/api/orders/**", "order-service", "订单主链路与售后"],
            ["/api/staff/**", "staff-service", "员工、排班、派单、库存、客户"],
            ["/api/payments/**", "payment-service", "支付、退款、支付查询"],
        ],
    )

    doc.add_heading("6. 认证服务接口（auth-service）", level=1)
    add_table(
        doc,
        ["方法", "路径", "接口说明", "主要请求参数", "主要响应字段"],
        [
            ["POST", "/api/auth/login", "用户登录", "role, name, phone, password", "token, role, userId, name"],
            ["GET", "/api/auth/profile", "获取当前登录用户信息", "Header: Authorization", "userId, name, phone, role"],
            ["POST", "/api/auth/logout", "退出登录", "Header: Authorization", "message"],
            ["GET", "/api/auth/health", "认证服务状态检查", "无", "status"],
        ],
    )
    add_paragraph(doc, "登录请求示例：")
    add_paragraph(
        doc,
        '{"role":"customer","name":"林然","phone":"13800000000","password":"123456"}'
    )

    doc.add_heading("7. 订单服务接口（order-service）", level=1)
    add_table(
        doc,
        ["方法", "路径", "接口说明", "主要请求参数", "主要响应字段"],
        [
            ["POST", "/api/orders", "创建订单", "serviceId, providerId, appointmentText, dateKey, address, contactName, contactPhone, remark", "orderId, status, amount"],
            ["GET", "/api/orders", "订单列表", "role, userId, status, keyword", "orders[]"],
            ["GET", "/api/orders/{orderId}", "订单详情", "orderId", "order object"],
            ["POST", "/api/orders/{orderId}/pay", "订单支付", "orderId", "status, paidAt"],
            ["POST", "/api/orders/{orderId}/cancel", "取消订单", "reason", "status, cancelledAt"],
            ["POST", "/api/orders/{orderId}/reschedule", "订单改约", "appointmentText, dateKey", "status, appointmentText"],
            ["POST", "/api/orders/{orderId}/review", "提交评价", "rating, review", "status, rating, review"],
            ["POST", "/api/orders/{orderId}/refund", "申请退款", "reason", "refundStatus"],
            ["POST", "/api/orders/{orderId}/complaints", "提交投诉", "content", "complaintStatus"],
        ],
    )
    add_paragraph(doc, "创建订单请求示例：")
    add_paragraph(
        doc,
        '{"serviceId":"svc-001","providerId":"provider-2","appointmentText":"2026年06月03日 周三 • 上午 10:00","dateKey":"2026-06-03 10:00","address":"徐汇区漕溪北路 66 号","contactName":"林然","contactPhone":"13800000000","remark":"请提前联系"}'
    )

    doc.add_heading("8. 员工服务接口（staff-service）", level=1)
    add_paragraph(
        doc,
        "由于管理端当前同时展示排班、库存、客户列表等运营页面，下面接口在课程项目阶段先统一归入 staff-service，后续可再拆分为 inventory-service、customer-service、report-service。"
    )
    add_table(
        doc,
        ["方法", "路径", "接口说明", "主要请求参数", "主要响应字段"],
        [
            ["GET", "/api/staff/providers", "服务人员列表", "serviceType, area, status", "providers[]"],
            ["GET", "/api/staff/providers/{providerId}", "服务人员详情", "providerId", "provider object"],
            ["GET", "/api/staff/schedule", "排班/待处理任务列表", "date, providerId, status", "schedule[]"],
            ["POST", "/api/staff/orders/{orderId}/assign", "手动派单", "providerId", "status, assignedAt"],
            ["POST", "/api/staff/orders/{orderId}/accept", "员工接单", "orderId", "status"],
            ["POST", "/api/staff/orders/{orderId}/start", "开始服务", "orderId", "status, startedAt"],
            ["POST", "/api/staff/orders/{orderId}/complete", "完工提交", "orderId", "status, completedAt"],
            ["GET", "/api/staff/inventory", "库存列表", "keyword, status", "inventoryItems[]"],
            ["POST", "/api/staff/inventory/{itemId}/restock", "库存补货", "quantity", "stock, status"],
            ["GET", "/api/staff/customers", "客户列表", "keyword, area", "customers[]"],
        ],
    )

    doc.add_heading("9. 支付服务接口（payment-service）", level=1)
    add_table(
        doc,
        ["方法", "路径", "接口说明", "主要请求参数", "主要响应字段"],
        [
            ["POST", "/api/payments/prepay", "生成支付单", "orderId, amount, payChannel", "paymentId, payUrl, status"],
            ["GET", "/api/payments/{paymentId}", "查询支付状态", "paymentId", "status, paidAt"],
            ["POST", "/api/payments/refund", "退款申请", "orderId, amount, reason", "refundId, refundStatus"],
            ["POST", "/api/payments/callback", "支付回调", "第三方平台异步通知参数", "message"],
            ["GET", "/api/payments/health", "支付服务状态检查", "无", "status"],
        ],
    )

    doc.add_heading("10. 与前端联调关系说明", level=1)
    add_paragraph(
        doc,
        "当前前端在 src/api.js 中已经抽象出统一调用层，包含 createOrder、payOrder、assignOrder、reviewOrder、restockItem、cancelOrder、rescheduleOrder、requestRefund、submitComplaint 等方法。当前这些方法通过本地状态模拟完成演示；后续接入真实微服务时，只需将这些方法替换为对上文接口的 HTTP 调用，即可平滑完成联调。"
    )
    add_table(
        doc,
        ["前端方法", "建议后端接口"],
        [
            ["createOrder(payload)", "POST /api/orders"],
            ["payOrder(orderId)", "POST /api/orders/{orderId}/pay"],
            ["assignOrder(orderId, providerId)", "POST /api/staff/orders/{orderId}/assign"],
            ["reviewOrder(orderId, rating, review)", "POST /api/orders/{orderId}/review"],
            ["restockItem(itemId)", "POST /api/staff/inventory/{itemId}/restock"],
            ["cancelOrder(orderId, reason)", "POST /api/orders/{orderId}/cancel"],
            ["rescheduleOrder(orderId, appointmentText, dateKey)", "POST /api/orders/{orderId}/reschedule"],
            ["requestRefund(orderId, reason)", "POST /api/orders/{orderId}/refund"],
            ["submitComplaint(orderId, content)", "POST /api/orders/{orderId}/complaints"],
        ],
    )

    doc.add_heading("11. Swagger 文档生成建议", level=1)
    add_paragraph(
        doc,
        "课程要求中提到系统接口文档可通过 Swagger 自动生成。当前项目后端骨架尚未接入 Swagger / SpringDoc 依赖，因此本文档先采用人工整理方式提交。后续建议在各个 Spring Boot 微服务中接入 springdoc-openapi-starter-webmvc-ui，并按以下方式开放在线文档："
    )
    add_bullets(
        doc,
        [
            "auth-service: http://服务器IP:8081/swagger-ui/index.html",
            "order-service: http://服务器IP:8082/swagger-ui/index.html",
            "staff-service: http://服务器IP:8083/swagger-ui/index.html",
            "payment-service: http://服务器IP:8084/swagger-ui/index.html",
            "如需统一入口，可由 gateway-service 聚合各服务文档链接。",
        ],
    )

    doc.add_heading("12. 当前版本说明", level=1)
    add_paragraph(
        doc,
        "需要特别说明的是：当前后端工程已经真实落地了微服务拆分结构与健康检查接口，前端也已经完成了统一 API 封装和三端联调流程；但除 /health 之外的业务接口仍属于课程项目阶段的约定接口。该设计已经足够支撑系统演示、接口说明与后续迭代实现。"
    )

    return doc


def save_as_doc(document: Document, base_name: str):
    docx_path = OUTPUT_DIR / f"{base_name}.docx"
    doc_path = OUTPUT_DIR / f"{base_name}.doc"

    if doc_path.exists():
        backup_path = OUTPUT_DIR / f"{base_name}.bak.doc"
        shutil.copy2(doc_path, backup_path)

    document.save(docx_path)
    subprocess.run(
        ["textutil", "-convert", "doc", str(docx_path), "-output", str(doc_path)],
        check=True,
    )


def main():
    save_as_doc(build_deployment_doc(), "05 系统部署文档")
    save_as_doc(build_interface_doc(), "06 系统接口文档")


if __name__ == "__main__":
    main()
