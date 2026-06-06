import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const STORAGE_KEY = "homecare-platform-state-v2";

const roleProfiles = {
  customer: {
    id: "user-001",
    name: "林然",
    phone: "13800000000",
    role: "customer",
    level: "尊享会员",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCt9qx6hiIJv4zO1hAm9IXqZJUfqjDgq6X_Rr4pTplewpNKSEWZcpZGCPxdZyMM2o1Lhbo9r0Nzww8vQrySFTPSoCB-SRlCUd_zTTGYwLE5vQEIsv1VbelarbyfrKxXQuQSjFPAaTU9ljYGnAnqayplwR5dwioKsw_ylYqdnbA3D4ArN3CHXDwWkSAKlB28mrgZK1nzDcgRr0l-167QiCwj4Cd4TXI4_5EjV2G8JkDKOwqLyCxy-FBSX2W-qkwNOnobAs_mzscJyl8"
  },
  provider: {
    id: "provider-user-001",
    name: "Sarah Jenkins",
    phone: "13900000000",
    role: "provider",
    level: "服务人员",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZAJXYofLyWok8gqpVhTZsFzn9HNdZbxVzUHQjjtelIQGuS_Nkok6BoTmJg-kZoZbAapRv6v7gc8twjXbe-D4XiF2e24xKyH0GIpvuuUohdwax1c3YW_3ctU92_lwRoDrGBqiSWf68pfmoJq430AyhehKcyx6X3eu0MXGih_QkLuO9NToESZSkHPJORCif6xMU1EY7cYSai788_rW4ym-tMzI46cp9lxQVAUM037r4NXYOk-Fxt9SwlbsOGdeiaT9v8fYDbboBRT_T"
  },
  admin: {
    id: "admin-001",
    name: "James Wilson",
    phone: "13700000000",
    role: "admin",
    level: "平台管理员",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
  }
};

function mergeCurrentUser(user = {}, overrides = {}) {
  const resolvedRole = overrides.role || user.role || "customer";
  const baseProfile = roleProfiles[resolvedRole] || roleProfiles.customer;
  return {
    ...baseProfile,
    ...user,
    ...overrides,
    id: user.id ?? overrides.id ?? baseProfile.id,
    name: user.name || overrides.name || baseProfile.name,
    phone: user.phone || overrides.phone || baseProfile.phone,
    role: resolvedRole,
    level: user.level || overrides.level || baseProfile.level,
    avatar: user.avatar || overrides.avatar || baseProfile.avatar
  };
}

const AppStateContext = createContext(null);

function getNowStamp() {
  return new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
}

function createToast(message, tone = "info") {
  return {
    id: `toast-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    message,
    tone
  };
}

function appendToast(state, message, tone = "info") {
  return {
    ...state,
    ui: {
      ...state.ui,
      toasts: [...state.ui.toasts, createToast(message, tone)].slice(-4)
    }
  };
}

const initialState = {
  auth: {
    isLoggedIn: false,
    currentUser: roleProfiles.customer
  },
  userProfiles: {},
  ui: {
    toasts: []
  },
  serviceCatalog: [
    {
      id: "svc-001",
      name: "深度全屋消杀",
      category: "除虫消杀",
      price: 180,
      unit: "次",
      duration: "2-3小时",
      description: "适合新房入住、换季除螨和家庭深度消毒，支持厨房、卫生间和卧室重点处理。",
      tags: ["当天可约", "环保药剂", "整屋服务"],
      providerIds: ["provider-2", "provider-3"]
    },
    {
      id: "svc-002",
      name: "厨房深度保洁",
      category: "家庭保洁",
      price: 190,
      unit: "次",
      duration: "3小时",
      description: "针对油烟机外部、灶台、墙面和橱柜表面做深度清洁，适合重油污家庭。",
      tags: ["高频预约", "阿姨上门", "可开发票"],
      providerIds: ["provider-2", "provider-3"]
    },
    {
      id: "svc-003",
      name: "水龙头维修",
      category: "家电维修",
      price: 110,
      unit: "次",
      duration: "1小时",
      description: "处理漏水、松动、阀芯老化等常见问题，支持厨房、卫生间龙头快速维修。",
      tags: ["急单支持", "配件透明", "30分钟响应"],
      providerIds: ["provider-1"]
    },
    {
      id: "svc-004",
      name: "空调系统检查",
      category: "家电维修",
      price: 120,
      unit: "次",
      duration: "1.5小时",
      description: "适用于季节切换前后的制冷制热检查、滤网清理和基础故障排查。",
      tags: ["夏季热门", "检测报告", "支持上门"],
      providerIds: ["provider-1"]
    }
  ],
  providers: [
    {
      id: "provider-1",
      name: "Elena Rodriguez",
      title: "资深电工",
      subtitle: "8年经验",
      rating: 4.9,
      price: 320,
      priceLabel: "¥320/小时",
      tags: ["维修", "快速修复"],
      badge: "高分推荐",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCIo1u2niKKKC2XMTknYc5B1qEs3qZdHcEiXYPkMxcNzpO2jDwfjO-AYjRuOlDA-aBq35Wjvyytd68mco-txBtCSHqkdhrJJINJird_a6YnZyt1aqP_hrIZIwOYLwocMj0lrCqecqlJuBtlFPMJ_9KtfzEFR9pwP8mdYzndUSyjKisx49CAq1aIs2kX5NRJFJoHBQJSdhT3u4tOA4TlzhxoBu6UwkUeTuJs-JZ6d0ar0Y8jwMJ0TX4mru32ljeQKAVtVyP95tGETigP",
      serviceType: "家电维修",
      workStatus: "空闲",
      bio: "擅长家庭电路维修、插座改造与小型家电安装。",
      area: "静安 / 徐汇 / 长宁"
    },
    {
      id: "provider-2",
      name: "Sarah Jenkins",
      title: "深度保洁专家",
      subtitle: "环保产品",
      rating: 4.8,
      price: 220,
      priceLabel: "¥220/小时",
      tags: ["保洁", "卫生"],
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCZAJXYofLyWok8gqpVhTZsFzn9HNdZbxVzUHQjjtelIQGuS_Nkok6BoTmJg-kZoZbAapRv6v7gc8twjXbe-D4XiF2e24xKyH0GIpvuuUohdwax1c3YW_3ctU92_lwRoDrGBqiSWf68pfmoJq430AyhehKcyx6X3eu0MXGih_QkLuO9NToESZSkHPJORCif6xMU1EY7cYSai788_rW4ym-tMzI46cp9lxQVAUM037r4NXYOk-Fxt9SwlbsOGdeiaT9v8fYDbboBRT_T",
      serviceType: "家庭保洁",
      workStatus: "任务中",
      bio: "擅长深度保洁、母婴家庭清洁和环保药剂服务。",
      area: "浦东 / 黄浦 / 闵行"
    },
    {
      id: "provider-3",
      name: "Maria Garcia",
      title: "金牌保洁专家",
      subtitle: "实名认证",
      rating: 4.8,
      price: 260,
      priceLabel: "¥260/小时",
      tags: ["环保清洁", "高端住宅"],
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBkLFfhWjfVYN7JF4tackJTmdvYD9590rKuof5cMawPTn_wYCnr-u9oGaxte1rw1uydZidnRHuSMEYjRNkDNDeE2RPvwkWuRdMDCSpNaZp3YtVHI6iLm95Ec0uAjrN9UKz2vKcZ2qpFk8AzZzglZpsvNmSi-a2n1QZIJpPbW1k53_b2omyy1UM4ARzzviaU1Qb7RsRm3Ete_YSoZlEXO6vt8-haUPUM8c9hDBzWo0VAkqJaRYrXkWYxNrvHfqaRCMphp2uy_MbhKs5g",
      serviceType: "深度保洁",
      workStatus: "空闲",
      bio: "高端住宅保洁与开荒清洁经验丰富，支持预约式服务。",
      area: "徐汇 / 黄浦 / 杨浦"
    },
    {
      id: "provider-4",
      name: "Liam Zhou",
      title: "家电清洗工程师",
      subtitle: "跨区调度",
      rating: 4.7,
      price: 240,
      priceLabel: "¥240/小时",
      tags: ["空调清洗", "油烟机维护"],
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAAG8QY4sAxz8nrVj97fn-2bxNnESxkpEcmMoW09qrdYSN3HBRLI9FSInHN9tk8AEwcq3Zn0NjcEW11mx4P4PP7VxrulGOERDehLVbxUp16ZXiT7WrA6jCgjqNmHHStmjaRfRK7kmWbq4Jm_sH-FzWZKAEbp9ujqi2lC0ZmNP7eaJCc5X9_fISeC2a64wj2f-KTW-EIKKw6Rl-peeCHbQu47Ig0lGba_X7BK_lLr1ws9PXTYoVpsAf9BxcXmdj5PzfetX2z3NMmFhHy",
      serviceType: "家电维修",
      workStatus: "空闲",
      bio: "负责空调清洗、油烟机维护与跨区域设备检测。",
      area: "浦东 / 宝山 / 普陀"
    }
  ],
  inventoryItems: [
    {
      id: "inv-001",
      name: "环保消杀药剂",
      category: "消杀耗材",
      stock: 42,
      unit: "瓶",
      safetyStock: 15,
      supplier: "沪上清洁供应链",
      status: "充足"
    },
    {
      id: "inv-002",
      name: "水龙头陶瓷阀芯",
      category: "维修配件",
      stock: 8,
      unit: "个",
      safetyStock: 10,
      supplier: "安居维修配件中心",
      status: "预警"
    },
    {
      id: "inv-003",
      name: "一次性鞋套",
      category: "上门耗材",
      stock: 126,
      unit: "双",
      safetyStock: 40,
      supplier: "优洁生活耗材",
      status: "充足"
    },
    {
      id: "inv-004",
      name: "空调滤网清洁剂",
      category: "维修耗材",
      stock: 5,
      unit: "瓶",
      safetyStock: 8,
      supplier: "清风设备材料",
      status: "预警"
    }
  ],
  inventoryLogs: [
    {
      id: "log-001",
      itemId: "inv-001",
      itemName: "环保消杀药剂",
      type: "入库",
      quantity: 30,
      operator: "James Wilson",
      createdAt: "2026-06-01 08:20"
    },
    {
      id: "log-002",
      itemId: "inv-002",
      itemName: "水龙头陶瓷阀芯",
      type: "出库",
      quantity: 6,
      operator: "仓储中心",
      createdAt: "2026-06-01 09:10"
    },
    {
      id: "log-003",
      itemId: "inv-004",
      itemName: "空调滤网清洁剂",
      type: "出库",
      quantity: 4,
      operator: "维修调度组",
      createdAt: "2026-06-01 09:45"
    }
  ],
  orders: [
    {
      id: "PH-2024-8842",
      serviceName: "深度全屋消杀服务",
      category: "除虫消杀",
      appointmentText: "2026年06月02日 周二 • 上午 09:00",
      appointmentShort: "明天上午 09:00",
      dateKey: "2026-06-02 09:00",
      address: "浦东新区锦绣路 1888 号",
      customerName: "林然",
      providerId: "provider-2",
      providerName: "Sarah Jenkins",
      providerTitle: "深度保洁专家",
      amount: 195,
      baseAmount: 180,
      serviceFee: 15,
      status: "待支付",
      createdAt: "2026-06-01 09:00",
      paidAt: null,
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      refundStatus: "未申请",
      complaintStatus: "无投诉",
      cancellationReason: "",
      refundReason: "",
      complaintContent: "",
      rating: 0,
      review: ""
    },
    {
      id: "PH-2024-8836",
      serviceName: "水龙头维修",
      category: "家电维修",
      appointmentText: "2026年06月04日 周四 • 下午 02:00",
      appointmentShort: "本周四下午 02:00",
      dateKey: "2026-06-04 14:00",
      address: "静安区常德路 900 号",
      customerName: "林然",
      providerId: "provider-1",
      providerName: "Elena Rodriguez",
      providerTitle: "资深电工",
      amount: 120,
      baseAmount: 110,
      serviceFee: 10,
      status: "服务中",
      createdAt: "2026-05-31 14:20",
      paidAt: "2026-05-31 14:30",
      assignedAt: "2026-05-31 15:00",
      startedAt: "2026-06-01 09:00",
      completedAt: null,
      cancelledAt: null,
      refundStatus: "未申请",
      complaintStatus: "无投诉",
      cancellationReason: "",
      refundReason: "",
      complaintContent: "",
      rating: 0,
      review: ""
    },
    {
      id: "PH-2024-8821",
      serviceName: "厨房深度保洁",
      category: "家庭保洁",
      appointmentText: "2026年06月03日 周三 • 下午 01:30",
      appointmentShort: "周三下午 01:30",
      dateKey: "2026-06-03 13:30",
      address: "黄浦区淮海中路 520 号",
      customerName: "林然",
      providerId: null,
      providerName: null,
      providerTitle: null,
      amount: 210,
      baseAmount: 190,
      serviceFee: 20,
      status: "待派单",
      createdAt: "2026-06-01 08:15",
      paidAt: "2026-06-01 08:20",
      assignedAt: null,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      refundStatus: "未申请",
      complaintStatus: "无投诉",
      cancellationReason: "",
      refundReason: "",
      complaintContent: "",
      rating: 0,
      review: ""
    },
    {
      id: "PH-2024-8816",
      serviceName: "空调系统检查",
      category: "家电维修",
      appointmentText: "2026年06月05日 周五 • 上午 11:00",
      appointmentShort: "周五上午 11:00",
      dateKey: "2026-06-05 11:00",
      address: "宝山区共和新路 188 号",
      customerName: "周倩",
      providerId: "provider-4",
      providerName: "Liam Zhou",
      providerTitle: "家电清洗工程师",
      amount: 135,
      baseAmount: 120,
      serviceFee: 15,
      status: "已派单",
      createdAt: "2026-06-01 07:30",
      paidAt: "2026-06-01 07:35",
      assignedAt: "2026-06-01 07:50",
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      refundStatus: "未申请",
      complaintStatus: "无投诉",
      cancellationReason: "",
      refundReason: "",
      complaintContent: "",
      rating: 0,
      review: ""
    },
    {
      id: "PH-2024-8809",
      serviceName: "厨房深度保洁",
      category: "家庭保洁",
      appointmentText: "2026年05月30日 周五 • 下午 03:00",
      appointmentShort: "上周五下午 03:00",
      dateKey: "2026-05-30 15:00",
      address: "徐汇区虹桥路 288 号",
      customerName: "王敏",
      providerId: "provider-3",
      providerName: "Maria Garcia",
      providerTitle: "金牌保洁专家",
      amount: 205,
      baseAmount: 190,
      serviceFee: 15,
      status: "已评价",
      createdAt: "2026-05-29 13:10",
      paidAt: "2026-05-29 13:15",
      assignedAt: "2026-05-29 13:25",
      startedAt: "2026-05-30 15:05",
      completedAt: "2026-05-30 17:55",
      cancelledAt: null,
      refundStatus: "未申请",
      complaintStatus: "无投诉",
      cancellationReason: "",
      refundReason: "",
      complaintContent: "",
      rating: 5,
      review: "清洁非常彻底，沟通也很顺畅。"
    },
    {
      id: "PH-2024-8801",
      serviceName: "深度全屋消杀",
      category: "除虫消杀",
      appointmentText: "2026年05月28日 周三 • 上午 09:30",
      appointmentShort: "上周三上午 09:30",
      dateKey: "2026-05-28 09:30",
      address: "闵行区七莘路 399 号",
      customerName: "赵航",
      providerId: "provider-2",
      providerName: "Sarah Jenkins",
      providerTitle: "深度保洁专家",
      amount: 195,
      baseAmount: 180,
      serviceFee: 15,
      status: "已完成",
      createdAt: "2026-05-27 16:40",
      paidAt: "2026-05-27 16:45",
      assignedAt: "2026-05-27 17:10",
      startedAt: "2026-05-28 09:35",
      completedAt: "2026-05-28 11:40",
      cancelledAt: null,
      refundStatus: "处理中",
      complaintStatus: "处理中",
      cancellationReason: "",
      refundReason: "服务后仍有气味残留，希望部分退款。",
      complaintContent: "服务结束后卧室区域处理不够彻底。",
      rating: 0,
      review: ""
    }
  ],
  providerConsole: {
    currentProviderId: "provider-1",
    online: true
  },
  bookingDraft: {
    selectedServiceId: "svc-001",
    providerMode: "platform",
    selectedProviderId: "provider-2",
    appointmentText: "2026年06月03日 周三 • 上午 10:00",
    dateKey: "2026-06-03 10:00",
    address: "徐汇区漕溪北路 66 号",
    serviceLocation: null,
    contactName: "林然",
    contactPhone: "13800000000",
    remark: ""
  }
};

function loadState() {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialState;
    }

    const parsed = JSON.parse(raw);
    return {
      ...initialState,
      ...parsed,
      auth: {
        ...initialState.auth,
        ...parsed.auth,
        currentUser: {
          ...initialState.auth.currentUser,
          ...parsed.auth?.currentUser
        }
      },
      userProfiles: parsed.userProfiles ?? initialState.userProfiles,
      ui: {
        ...initialState.ui,
        ...parsed.ui
      },
      providerConsole: {
        ...initialState.providerConsole,
        ...parsed.providerConsole
      },
      bookingDraft: {
        ...initialState.bookingDraft,
        ...parsed.bookingDraft
      },
      serviceCatalog: parsed.serviceCatalog ?? initialState.serviceCatalog,
      providers: parsed.providers ?? initialState.providers,
      inventoryItems: parsed.inventoryItems ?? initialState.inventoryItems,
      inventoryLogs: parsed.inventoryLogs ?? initialState.inventoryLogs,
      orders: parsed.orders ?? initialState.orders
    };
  } catch {
    return initialState;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "PUSH_TOAST":
      return appendToast(state, action.payload.message, action.payload.tone);

    case "DISMISS_TOAST":
      return {
        ...state,
        ui: {
          ...state.ui,
          toasts: state.ui.toasts.filter((toast) => toast.id !== action.toastId)
        }
      };

    case "PREPARE_BOOKING": {
      const nextServiceId = action.payload?.serviceId ?? state.bookingDraft.selectedServiceId;
      const service = state.serviceCatalog.find((item) => item.id === nextServiceId) ?? state.serviceCatalog[0];
      const fallbackProviderId = service.providerIds[0];

      return {
        ...state,
        bookingDraft: {
          ...state.bookingDraft,
          selectedServiceId: service.id,
          providerMode: action.payload?.providerMode ?? state.bookingDraft.providerMode,
          selectedProviderId: action.payload?.providerId ?? fallbackProviderId,
          appointmentText: action.payload?.appointmentText ?? state.bookingDraft.appointmentText,
          dateKey: action.payload?.dateKey ?? state.bookingDraft.dateKey,
          address: action.payload?.address ?? state.bookingDraft.address,
          serviceLocation: action.payload?.serviceLocation ?? state.bookingDraft.serviceLocation,
          contactName: action.payload?.contactName ?? state.bookingDraft.contactName,
          contactPhone: action.payload?.contactPhone ?? state.bookingDraft.contactPhone,
          remark: action.payload?.remark ?? state.bookingDraft.remark
        }
      };
    }

    case "CREATE_ORDER": {
      const service = state.serviceCatalog.find((item) => item.id === action.payload.serviceId);
      const provider = state.providers.find((item) => item.id === action.payload.providerId);

      if (!service || !provider) {
        return appendToast(state, "请选择有效的服务项目和服务人员。", "warning");
      }

      const now = getNowStamp();
      const newOrder = {
        id: `PH-${Date.now()}`,
        serviceName: service.name,
        category: service.category,
        appointmentText: action.payload.appointmentText,
        appointmentShort: action.payload.appointmentShort,
        dateKey: action.payload.dateKey,
        address: action.payload.address,
        serviceLocation: action.payload.serviceLocation ?? null,
        customerName: state.auth.currentUser.name,
        providerId: provider.id,
        providerName: provider.name,
        providerTitle: provider.title,
        amount: service.price + 15,
        baseAmount: service.price,
        serviceFee: 15,
        contactName: action.payload.contactName?.trim() || state.auth.currentUser.name,
        contactPhone: action.payload.contactPhone?.trim() || state.auth.currentUser.phone,
        remark: action.payload.remark?.trim() || "",
        status: "待支付",
        createdAt: now,
        paidAt: null,
        assignedAt: null,
        startedAt: null,
        completedAt: null,
        cancelledAt: null,
        refundStatus: "未申请",
        complaintStatus: "无投诉",
        cancellationReason: "",
        refundReason: "",
        complaintContent: "",
        rating: 0,
        review: ""
      };

      return appendToast(
        {
          ...state,
          bookingDraft: {
            ...state.bookingDraft,
            selectedServiceId: service.id,
            providerMode: action.payload.providerMode ?? state.bookingDraft.providerMode,
            selectedProviderId: provider.id,
            appointmentText: action.payload.appointmentText,
            dateKey: action.payload.dateKey,
            address: action.payload.address,
            serviceLocation: action.payload.serviceLocation ?? state.bookingDraft.serviceLocation,
            contactName: action.payload.contactName?.trim() || state.bookingDraft.contactName,
            contactPhone: action.payload.contactPhone?.trim() || state.bookingDraft.contactPhone,
            remark: action.payload.remark
          },
          orders: [newOrder, ...state.orders]
        },
        "订单已创建，请尽快完成支付。",
        "success"
      );
    }

    case "PAY_ORDER": {
      const target = state.orders.find((order) => order.id === action.orderId);
      if (!target || target.status !== "待支付") {
        return appendToast(state, "当前订单无需重复支付。", "warning");
      }

      return appendToast(
        {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  status: "待派单",
                  paidAt: getNowStamp()
                }
              : order
          )
        },
        `订单 ${action.orderId} 支付成功，已进入待派单队列。`,
        "success"
      );
    }

    case "ASSIGN_ORDER": {
      const provider = state.providers.find((item) => item.id === action.providerId);
      const target = state.orders.find((order) => order.id === action.orderId);
      if (!provider || !target || target.status !== "待派单") {
        return appendToast(state, "当前订单无法执行派单。", "warning");
      }

      return appendToast(
        {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  status: "已派单",
                  providerId: provider.id,
                  providerName: provider.name,
                  providerTitle: provider.title,
                  assignedAt: getNowStamp()
                }
              : order
          )
        },
        `订单 ${action.orderId} 已派单给 ${provider.name}。`,
        "success"
      );
    }

    case "MANUAL_ASSIGN_ORDER": {
      const provider = state.providers.find((item) => item.id === action.providerId);
      const target = state.orders.find((order) => order.id === action.orderId);
      if (!provider || !target || target.status !== "待派单") {
        return appendToast(state, "手动派单失败，当前订单状态不允许操作。", "warning");
      }

      return appendToast(
        {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  status: "已派单",
                  providerId: provider.id,
                  providerName: provider.name,
                  providerTitle: provider.title,
                  assignedAt: getNowStamp()
                }
              : order
          )
        },
        `已手动将订单 ${action.orderId} 指派给 ${provider.name}。`,
        "success"
      );
    }

    case "ACCEPT_ORDER": {
      const currentProviderId = state.providerConsole.currentProviderId;
      const provider = state.providers.find((item) => item.id === currentProviderId);
      const target = state.orders.find((order) => order.id === action.orderId);

      if (!state.providerConsole.online) {
        return appendToast(state, "当前接单状态为离线，请先打开接单开关。", "warning");
      }

      if (!provider || !target || !["待派单", "已派单"].includes(target.status)) {
        return appendToast(state, "当前任务无法接单。", "warning");
      }

      if (target.status === "已派单" && target.providerId !== currentProviderId) {
        return appendToast(state, "该任务已派发给其他服务人员，当前账号不能接单。", "warning");
      }

      return appendToast(
        {
          ...state,
          providers: state.providers.map((item) =>
            item.id === currentProviderId ? { ...item, workStatus: "待上门" } : item
          ),
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  providerId: currentProviderId,
                  providerName: provider.name,
                  providerTitle: provider.title,
                  status: "已接单",
                  assignedAt: order.assignedAt || getNowStamp()
                }
              : order
          )
        },
        `${provider.name} 已接单，任务进入待上门状态。`,
        "success"
      );
    }

    case "START_SERVICE": {
      const currentProviderId = state.providerConsole.currentProviderId;
      const target = state.orders.find((order) => order.id === action.orderId);

      if (!target || !["已接单", "已派单"].includes(target.status)) {
        return appendToast(state, "当前任务还不能开始服务。", "warning");
      }

      if (target.providerId !== currentProviderId) {
        return appendToast(state, "只能开始当前服务人员名下的任务。", "warning");
      }

      return appendToast(
        {
          ...state,
          providers: state.providers.map((item) =>
            item.id === currentProviderId ? { ...item, workStatus: "服务中" } : item
          ),
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  status: "服务中",
                  startedAt: order.startedAt || getNowStamp()
                }
              : order
          )
        },
        `订单 ${action.orderId} 已开始服务。`,
        "success"
      );
    }

    case "COMPLETE_ORDER": {
      const currentProviderId = state.providerConsole.currentProviderId;
      const target = state.orders.find((order) => order.id === action.orderId);

      if (!target || !["已接单", "服务中"].includes(target.status)) {
        return appendToast(state, "当前任务还不能完工。", "warning");
      }

      if (target.providerId !== currentProviderId) {
        return appendToast(state, "只能完结当前服务人员名下的任务。", "warning");
      }

      return appendToast(
        {
          ...state,
          providers: state.providers.map((item) =>
            item.id === currentProviderId ? { ...item, workStatus: "空闲" } : item
          ),
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  status: "已完成",
                  completedAt: getNowStamp(),
                  startedAt: order.startedAt || getNowStamp()
                }
              : order
          )
        },
        `订单 ${action.orderId} 已完工，等待用户评价。`,
        "success"
      );
    }

    case "SUBMIT_REVIEW": {
      const target = state.orders.find((order) => order.id === action.orderId);
      if (!target || !["已完成", "已评价"].includes(target.status)) {
        return appendToast(state, "当前订单暂时不能评价。", "warning");
      }

      if (!action.rating || !action.review?.trim()) {
        return appendToast(state, "请填写评分和评价内容后再提交。", "warning");
      }

      return appendToast(
        {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  status: "已评价",
                  rating: action.rating,
                  review: action.review.trim()
                }
              : order
          )
        },
        "评价提交成功，订单已闭环完成。",
        "success"
      );
    }

    case "CANCEL_ORDER": {
      const target = state.orders.find((order) => order.id === action.orderId);
      if (!target || !["待支付", "待派单", "已派单"].includes(target.status)) {
        return appendToast(state, "当前订单状态不允许取消。", "warning");
      }

      return appendToast(
        {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  status: "已取消",
                  cancelledAt: getNowStamp(),
                  cancellationReason: action.reason?.trim() || "用户主动取消"
                }
              : order
          )
        },
        `订单 ${action.orderId} 已取消。`,
        "success"
      );
    }

    case "RESCHEDULE_ORDER": {
      const target = state.orders.find((order) => order.id === action.orderId);
      if (!target || ["已完成", "已评价", "已取消"].includes(target.status)) {
        return appendToast(state, "当前订单不能改约。", "warning");
      }

      return appendToast(
        {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  appointmentText: action.appointmentText,
                  dateKey: action.dateKey,
                  appointmentShort: "已改约"
                }
              : order
          )
        },
        `订单 ${action.orderId} 改约成功。`,
        "success"
      );
    }

    case "REQUEST_REFUND": {
      const target = state.orders.find((order) => order.id === action.orderId);
      if (!target || ["待支付", "已取消"].includes(target.status)) {
        return appendToast(state, "当前订单不能申请退款。", "warning");
      }

      return appendToast(
        {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  refundStatus: "处理中",
                  refundReason: action.reason?.trim() || "用户申请退款"
                }
              : order
          )
        },
        `订单 ${action.orderId} 的退款申请已提交。`,
        "success"
      );
    }

    case "SUBMIT_COMPLAINT": {
      const target = state.orders.find((order) => order.id === action.orderId);
      if (!target) {
        return state;
      }

      return appendToast(
        {
          ...state,
          orders: state.orders.map((order) =>
            order.id === action.orderId
              ? {
                  ...order,
                  complaintStatus: "处理中",
                  complaintContent: action.content?.trim() || "服务投诉"
                }
              : order
          )
        },
        `订单 ${action.orderId} 的投诉已提交。`,
        "success"
      );
    }

    case "SWITCH_PROVIDER": {
      const provider = state.providers.find((item) => item.id === action.providerId);
      if (!provider) {
        return state;
      }

      return appendToast(
        {
          ...state,
          providerConsole: {
            ...state.providerConsole,
            currentProviderId: provider.id
          }
        },
        `当前已切换到 ${provider.name} 的工作台。`,
        "info"
      );
    }

    case "RESTOCK_ITEM": {
      const targetItem = state.inventoryItems.find((item) => item.id === action.itemId);
      if (!targetItem) {
        return state;
      }

      return appendToast(
        {
          ...state,
          inventoryItems: state.inventoryItems.map((item) =>
            item.id === action.itemId
              ? {
                  ...item,
                  stock: item.stock + 20,
                  status: item.stock + 20 > item.safetyStock ? "充足" : "预警"
                }
              : item
          ),
          inventoryLogs: [
            {
              id: `log-${Date.now()}`,
              itemId: targetItem.id,
              itemName: targetItem.name,
              type: "入库",
              quantity: 20,
              operator: "James Wilson",
              createdAt: getNowStamp()
            },
            ...state.inventoryLogs
          ]
        },
        "库存补货完成，已同步更新库存状态。",
        "success"
      );
    }

    case "TOGGLE_PROVIDER_ONLINE": {
      const online = !state.providerConsole.online;
      return appendToast(
        {
          ...state,
          providerConsole: {
            ...state.providerConsole,
            online
          }
        },
        online ? "已开启接单状态。" : "已切换为暂停接单状态。",
        online ? "success" : "info"
      );
    }

    case "RESET_STATE":
      return initialState;

    case "LOGIN":
      {
        const incomingUser = action.payload.user || action.payload.currentUser || action.payload;
        const profileOverride = state.userProfiles[incomingUser.phone] || {};
        const currentUser = mergeCurrentUser(incomingUser, profileOverride);
        const nextRole = currentUser.role || "customer";
      return appendToast(
        {
          ...state,
          auth: {
            ...state.auth,
            isLoggedIn: true,
            currentUser
          }
        },
        `登录成功，已进入${nextRole === "customer" ? "消费者端" : nextRole === "provider" ? "员工端" : "管理端"}。`,
        "success"
      );
      }

    case "UPDATE_PROFILE": {
      const currentUser = state.auth.currentUser;
      const nextName = action.payload.name?.trim() || currentUser.name;
      const nextPhone = action.payload.phone?.trim() || currentUser.phone;
      const nextAvatar = action.payload.avatar || currentUser.avatar;
      const nextUser = {
        ...currentUser,
        name: nextName,
        phone: nextPhone,
        avatar: nextAvatar
      };
      const nextUserProfiles = { ...state.userProfiles };
      const currentProfile = nextUserProfiles[currentUser.phone] || {};

      if (currentUser.phone !== nextPhone) {
        delete nextUserProfiles[currentUser.phone];
      }

      nextUserProfiles[nextPhone] = {
        ...currentProfile,
        name: nextName,
        avatar: nextAvatar
      };

      const nextOrders = state.orders.map((order) => {
        const nextOrder = { ...order };

        if (currentUser.role === "customer" && order.customerName === currentUser.name) {
          nextOrder.customerName = nextName;
        }

        if (currentUser.role === "provider" && order.providerName === currentUser.name) {
          nextOrder.providerName = nextName;
        }

        if (order.contactName === currentUser.name) {
          nextOrder.contactName = nextName;
        }

        if (order.contactPhone === currentUser.phone) {
          nextOrder.contactPhone = nextPhone;
        }

        return nextOrder;
      });

      const nextProviders =
        currentUser.role === "provider"
          ? state.providers.map((provider) =>
              provider.name === currentUser.name ? { ...provider, name: nextName, image: nextAvatar } : provider
            )
          : state.providers;

      return appendToast(
        {
          ...state,
          auth: {
            ...state.auth,
            currentUser: nextUser
          },
          userProfiles: nextUserProfiles,
          bookingDraft: {
            ...state.bookingDraft,
            contactName: state.bookingDraft.contactName === currentUser.name ? nextName : state.bookingDraft.contactName,
            contactPhone:
              state.bookingDraft.contactPhone === currentUser.phone ? nextPhone : state.bookingDraft.contactPhone
          },
          providers: nextProviders,
          orders: nextOrders
        },
        "个人资料已更新。",
        "success"
      );
    }

    case "LOGOUT":
      return appendToast(
        {
          ...state,
          auth: {
            ...state.auth,
            isLoggedIn: false,
            currentUser: roleProfiles.customer
          }
        },
        "您已退出登录。",
        "info"
      );

    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
