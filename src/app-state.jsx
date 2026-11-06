import { authApi, platformApi, session } from "./api";
import { createContext, useContext, useEffect, useMemo, useReducer, useCallback, useRef } from "react";

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
  orders: [],
  providerConsole: {
    currentProviderId: "provider-1",
    online: true
  },
  bookingDraft: {
    selectedServiceId: "svc-001",
    providerMode: "platform",
    selectedProviderId: "provider-2",
    appointmentText: "请选择预约日期",
    dateKey: new Date(Date.now() + 86400000).toLocaleDateString("sv-SE") + " 10:00",
    address: "徐汇区漕溪北路 66 号",
    serviceLocation: null,
    contactName: "林然",
    contactPhone: "13800000000",
    remark: ""
  }
};

function loadState() {
  // Remove historical demo data, including plaintext credentials from v1.
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem("homecare-local-auth-users-v1");
  return { ...initialState, orders: [], auth: { isLoggedIn: false, ready: !session.get(), currentUser: roleProfiles.customer } };
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

    case "SERVER_SNAPSHOT": {
      const data = action.payload;
      const providers = data.providers.map((p) => ({ ...initialState.providers.find((item) => item.id === p.id), ...p }));
      const mine = providers.find((p) => p.id === data.currentProviderId);
      return { ...state, orders: data.orders, serviceCatalog: data.serviceCatalog,
        providers, providerConsole: { currentProviderId: data.currentProviderId, online: mine?.online ?? false } };
    }
    case "AUTH_READY": return { ...state, auth: { ...state.auth, ready: true } };
    case "CLEAR_ORDERS": return { ...state, orders: [] };
    case "LOGIN":
      {
        const incomingUser = action.payload.user || action.payload.currentUser || action.payload;
        const profileOverride = {};
        const currentUser = mergeCurrentUser(incomingUser, profileOverride);
        const nextRole = currentUser.role || "customer";
      return appendToast(
        {
          ...state,
          auth: {
            ...state.auth,
            isLoggedIn: true, ready: true,
            currentUser
          }, orders: []
        },
        `登录成功，已进入${nextRole === "customer" ? "消费者端" : nextRole === "provider" ? "员工端" : "管理端"}。`,
        "success"
      );
      }

    case "UPDATE_PROFILE":
      return appendToast({ ...state, auth: { ...state.auth, currentUser: { ...state.auth.currentUser, ...action.payload } } }, "个人资料已更新。", "success");

    case "LOGOUT":
      return appendToast(
        {
          ...state,
          auth: {
            ...state.auth,
            isLoggedIn: false, ready: true,
            currentUser: roleProfiles.customer
          }, orders: []
        },
        "您已退出登录。",
        "info"
      );

    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, loadState);
  const refreshSequence = useRef(0);
  const pending = useRef(new Set());
  const providerOnline = state.providerConsole.online;
  const refresh = useCallback(async () => {
    const token = session.get();
    const sequence = ++refreshSequence.current;
    if (!token) return;
    const data = await platformApi.snapshot();
    if (session.get() === token && sequence === refreshSequence.current) rawDispatch({ type: "SERVER_SNAPSHOT", payload: data });
  }, []);
  const dispatch = useCallback((action) => {
    const operations = { PAY_ORDER: "pay", ASSIGN_ORDER: "assign", MANUAL_ASSIGN_ORDER: "assign", ACCEPT_ORDER: "accept", START_SERVICE: "start", COMPLETE_ORDER: "complete", SUBMIT_REVIEW: "review", CANCEL_ORDER: "cancel", RESCHEDULE_ORDER: "reschedule", REQUEST_REFUND: "refund", SUBMIT_COMPLAINT: "complaint" };
    if (action.type === "LOGOUT") {
      authApi.logout().catch(() => {});
      session.clear(); ++refreshSequence.current;
      rawDispatch(action); return;
    }
    if (action.type === "RESTOCK_ITEM" || action.type === "SWITCH_PROVIDER" || action.type === "RESET_STATE") {
      rawDispatch({ type: "PUSH_TOAST", payload: { message: "此功能尚未开放。", tone: "warning" } }); return;
    }
    if (action.type !== "CREATE_ORDER" && action.type !== "TOGGLE_PROVIDER_ONLINE" && !operations[action.type]) { rawDispatch(action); return; }
    const key = action.orderId || action.type;
    if (pending.current.has(key)) return Promise.resolve(false);
    pending.current.add(key);
    const token = session.get();
    return (async () => {
      try {
        if (action.type === "CREATE_ORDER") await platformApi.create(action.payload);
        else if (action.type === "TOGGLE_PROVIDER_ONLINE") await platformApi.online(!providerOnline);
        else await platformApi.action(action.orderId, operations[action.type], action);
        if (session.get() !== token) return false;
        await refresh();
        rawDispatch({ type: "PUSH_TOAST", payload: { message: action.type === "PAY_ORDER" ? "模拟支付成功，未发生真实扣款。" : "操作成功，数据已保存到服务器。", tone: "success" } });
        return true;
      } catch (error) {
        if (session.get() !== token) return false;
        if (error.status === 401) { session.clear(); rawDispatch({ type: "LOGOUT" }); }
        rawDispatch({ type: "PUSH_TOAST", payload: { message: error.message || "服务不可用，请稍后重试。", tone: "warning" } });
        // Refresh stale data after a state conflict; never apply a local optimistic write.
        if (error.status === 409) await refresh().catch(() => {});
        return false;
      } finally { pending.current.delete(key); }
    })();
  }, [providerOnline, refresh]);

  useEffect(() => {
    let cancelled = false;
    if (session.get()) authApi.me().then((user) => { if (!cancelled) rawDispatch({ type: "LOGIN", payload: { user } }); }).catch(() => { if (!cancelled) session.clear(); }).finally(() => { if (!cancelled) rawDispatch({ type: "AUTH_READY" }); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!state.auth.isLoggedIn) return;
    let cancelled = false;
    const load = () => refresh().catch((error) => {
      if (cancelled) return;
      rawDispatch({ type: "CLEAR_ORDERS" });
      if (error.status === 401) { session.clear(); rawDispatch({ type: "LOGOUT" }); }
    });
    load();
    const timer = window.setInterval(load, 5000);
    return () => { cancelled = true; ++refreshSequence.current; window.clearInterval(timer); };
  }, [state.auth.isLoggedIn, state.auth.currentUser.id, refresh]);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
