export const featuredProviders = [
  {
    id: "p-1",
    name: "Elena Rodriguez",
    title: "资深电工",
    subtitle: "8年经验",
    rating: 4.9,
    price: "¥320/小时",
    tags: ["维修", "快速修复"],
    badge: "高分推荐",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCIo1u2niKKKC2XMTknYc5B1qEs3qZdHcEiXYPkMxcNzpO2jDwfjO-AYjRuOlDA-aBq35Wjvyytd68mco-txBtCSHqkdhrJJINJird_a6YnZyt1aqP_hrIZIwOYLwocMj0lrCqecqlJuBtlFPMJ_9KtfzEFR9pwP8mdYzndUSyjKisx49CAq1aIs2kX5NRJFJoHBQJSdhT3u4tOA4TlzhxoBu6UwkUeTuJs-JZ6d0ar0Y8jwMJ0TX4mru32ljeQKAVtVyP95tGETigP"
  },
  {
    id: "p-2",
    name: "Sarah Jenkins",
    title: "深度保洁专家",
    subtitle: "环保产品",
    rating: 4.8,
    price: "¥220/小时",
    tags: ["保洁", "卫生"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZAJXYofLyWok8gqpVhTZsFzn9HNdZbxVzUHQjjtelIQGuS_Nkok6BoTmJg-kZoZbAapRv6v7gc8twjXbe-D4XiF2e24xKyH0GIpvuuUohdwax1c3YW_3ctU92_lwRoDrGBqiSWf68pfmoJq430AyhehKcyx6X3eu0MXGih_QkLuO9NToESZSkHPJORCif6xMU1EY7cYSai788_rW4ym-tMzI46cp9lxQVAUM037r4NXYOk-Fxt9SwlbsOGdeiaT9v8fYDbboBRT_T"
  },
  {
    id: "p-3",
    name: "Maria Garcia",
    title: "金牌保洁专家",
    subtitle: "实名认证",
    rating: 4.8,
    price: "¥260/小时",
    tags: ["环保清洁", "高端住宅"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkLFfhWjfVYN7JF4tackJTmdvYD9590rKuof5cMawPTn_wYCnr-u9oGaxte1rw1uydZidnRHuSMEYjRNkDNDeE2RPvwkWuRdMDCSpNaZp3YtVHI6iLm95Ec0uAjrN9UKz2vKcZ2qpFk8AzZzglZpsvNmSi-a2n1QZIJpPbW1k53_b2omyy1UM4ARzzviaU1Qb7RsRm3Ete_YSoZlEXO6vt8-haUPUM8c9hDBzWo0VAkqJaRYrXkWYxNrvHfqaRCMphp2uy_MbhKs5g"
  }
];

export const bookingCards = [
  {
    name: "家庭保洁",
    time: "明天上午 10:00",
    icon: "cleaning_services"
  },
  {
    name: "水龙头维修",
    time: "本周五下午 2:00",
    icon: "handyman"
  }
];

export const categories = [
  { label: "日常保洁", icon: "cleaning_services" },
  { label: "家电维修", icon: "home_repair_service" },
  { label: "月嫂育儿", icon: "child_care" },
  { label: "除虫消杀", icon: "pest_control" },
  { label: "管道疏通", icon: "plumbing" },
  { label: "电路维修", icon: "electric_bolt" }
];

export const providerRequests = [
  {
    id: "req-1",
    title: "紧急漏水维修",
    distance: "2.4 公里",
    price: "预计 ¥150 - ¥200",
    icon: "home_repair_service"
  },
  {
    id: "req-2",
    title: "空调系统检查",
    distance: "5.1 公里",
    price: "预计 ¥80 - ¥120",
    icon: "ac_unit"
  }
];

export const providerSchedule = [
  {
    time: "09:00 - 10:30",
    title: "智能家居面板安装",
    address: "枫叶大道 124 号，4 号套房",
    status: "已确认",
    tone: "primary"
  },
  {
    time: "11:00 - 12:30",
    title: "电动汽车充电桩维护",
    address: "橡树林路 880 号",
    status: "待开始",
    tone: "muted"
  },
  {
    time: "14:00 - 16:00",
    title: "断路器维修",
    address: "河滨大道 45 号",
    status: "进行中",
    tone: "secondary"
  }
];

export const orderSteps = [
  { title: "已支付", time: "10-20 10:15", complete: true },
  { title: "待派单", time: "10-20 10:30", complete: true },
  { title: "已派单", time: "10-21 08:00", complete: true },
  { title: "服务中", time: "即将开始", active: true },
  { title: "已完工", time: "—" }
];

export const adminMetrics = [
  { label: "总订单量", value: "1,284", extra: "+12.5%" },
  { label: "活跃服务", value: "432", extra: "稳定" },
  { label: "月度营收", value: "¥142,500", extra: "+8.2%" }
];

export const systemServices = [
  {
    name: "API 网关",
    desc: "路由编排与负载均衡",
    icon: "router",
    cpu: "12%",
    latency: "8ms",
    tps: "450",
    logs: [
      "路由请求: /v1/orders -> order-service",
      "用户 user_4920 鉴权通过",
      "负载均衡: 已选择节点 node-2:9092",
      "GC 回收耗时 12ms"
    ]
  },
  {
    name: "认证服务",
    desc: "令牌签发、校验与 MFA 逻辑",
    icon: "key",
    cpu: "45%",
    latency: "112ms",
    tps: "85",
    logs: [
      "JWT 已签发: user_session_f92k...",
      "刷新令牌验证通过",
      "LDAP 同步完成: 0 项变更",
      "Redis 缓存命中 session_id"
    ]
  },
  {
    name: "订单服务",
    desc: "管理服务生命周期与预约",
    icon: "receipt_long",
    cpu: "28%",
    latency: "64ms",
    tps: "120",
    logs: [
      "订单已创建: ORD-49203",
      "发布事件: order.created",
      "事务已提交",
      "数据库连接池: 8/20"
    ]
  },
  {
    name: "支付服务",
    desc: "支付、退款与账单结算",
    icon: "credit_card",
    cpu: "19%",
    latency: "420ms",
    tps: "12",
    logs: [
      "Webhook 已接收: payment.success",
      "支付成功: TXN_88291",
      "已生成账单: ORD-49203",
      "幂等键校验通过"
    ]
  },
  {
    name: "服务商服务",
    desc: "人员可用性与排班",
    icon: "badge",
    cpu: "31%",
    latency: "34ms",
    tps: "210",
    logs: [
      "正在计算服务半径",
      "时段已确认: Provider_ID_92",
      "匹配到 14 名符合条件的服务商",
      "GeoHash 查询耗时 0.2ms"
    ]
  },
  {
    name: "统计服务",
    desc: "数据聚合与报表分析",
    icon: "analytics",
    cpu: "58%",
    latency: "150ms",
    tps: "40",
    logs: [
      "正在汇总日收入统计数据",
      "缓存预热: hourly_metrics",
      "报表已生成: infrastructure_01.pdf",
      "批处理规模: 1000 条记录"
    ]
  }
];
