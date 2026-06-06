function wait(ms = 120) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

const AUTH_API_BASE = (import.meta.env.VITE_AUTH_API_BASE || "http://127.0.0.1:8081/api/auth").replace(/\/$/, "");
const LOCAL_AUTH_STORAGE_KEY = "homecare-local-auth-users-v1";

const localRoleProfiles = {
  customer: {
    id: "user-001",
    name: "林然",
    phone: "13800000000",
    password: "123456",
    role: "customer",
    level: "尊享会员",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDCt9qx6hiIJv4zO1hAm9IXqZJUfqjDgq6X_Rr4pTplewpNKSEWZcpZGCPxdZyMM2o1Lhbo9r0Nzww8vQrySFTPSoCB-SRlCUd_zTTGYwLE5vQEIsv1VbelarbyfrKxXQuQSjFPAaTU9ljYGnAnqayplwR5dwioKsw_ylYqdnbA3D4ArN3CHXDwWkSAKlB28mrgZK1nzDcgRr0l-167QiCwj4Cd4TXI4_5EjV2G8JkDKOwqLyCxy-FBSX2W-qkwNOnobAs_mzscJyl8"
  },
  provider: {
    id: "provider-user-001",
    name: "Sarah Jenkins",
    phone: "13900000000",
    password: "123456",
    role: "provider",
    level: "服务人员",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCZAJXYofLyWok8gqpVhTZsFzn9HNdZbxVzUHQjjtelIQGuS_Nkok6BoTmJg-kZoZbAapRv6v7gc8twjXbe-D4XiF2e24xKyH0GIpvuuUohdwax1c3YW_3ctU92_lwRoDrGBqiSWf68pfmoJq430AyhehKcyx6X3eu0MXGih_QkLuO9NToESZSkHPJORCif6xMU1EY7cYSai788_rW4ym-tMzI46cp9lxQVAUM037r4NXYOk-Fxt9SwlbsOGdeiaT9v8fYDbboBRT_T"
  },
  admin: {
    id: "admin-001",
    name: "James Wilson",
    phone: "13700000000",
    password: "123456",
    role: "admin",
    level: "平台管理员",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
  }
};

function requestAuth(path, options = {}) {
  return fetch(`${AUTH_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "认证服务暂时不可用，请稍后再试。");
    }

    return data;
  });
}

function isNetworkFailure(error) {
  return error instanceof TypeError || /Failed to fetch|NetworkError|fetch/i.test(String(error?.message || ""));
}

function createLocalAuthSeed() {
  return Object.values(localRoleProfiles).map((user) => ({ ...user }));
}

function loadLocalAuthUsers() {
  if (typeof window === "undefined") {
    return createLocalAuthSeed();
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    if (!raw) {
      const seed = createLocalAuthSeed();
      window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("invalid local auth payload");
    }

    const merged = createLocalAuthSeed().map((seedUser) => {
      const storedUser = parsed.find((item) => item.phone === seedUser.phone);
      return storedUser ? { ...seedUser, ...storedUser } : seedUser;
    });

    const customUsers = parsed.filter((item) => !merged.some((mergedUser) => mergedUser.phone === item.phone));
    return [...merged, ...customUsers];
  } catch {
    const seed = createLocalAuthSeed();
    window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function saveLocalAuthUsers(users) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(users));
  }
}

function mapLocalUserToAuthResult(user) {
  const roleProfile = localRoleProfiles[user.role] || localRoleProfiles.customer;
  return {
    token: `local-${user.role}-${user.phone}`,
    user: {
      id: user.id || roleProfile.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      level: user.level || roleProfile.level,
      avatar: user.avatar || roleProfile.avatar
    }
  };
}

async function localLogin(payload) {
  await wait();
  const users = loadLocalAuthUsers();
  const matchedUser = users.find((item) => item.phone === payload.phone);

  if (!matchedUser || matchedUser.password !== payload.password) {
    throw new Error("手机号或密码不正确。");
  }

  return mapLocalUserToAuthResult(matchedUser);
}

async function localRegister(payload) {
  await wait();
  const users = loadLocalAuthUsers();

  if (users.some((item) => item.phone === payload.phone)) {
    throw new Error("该手机号已注册。");
  }

  const nextUser = {
    id: `local-user-${Date.now()}`,
    name: payload.name,
    phone: payload.phone,
    password: payload.password,
    role: "customer",
    level: "普通会员",
    avatar: localRoleProfiles.customer.avatar
  };

  const nextUsers = [...users, nextUser];
  saveLocalAuthUsers(nextUsers);
  return mapLocalUserToAuthResult(nextUser);
}

async function localUpdateProfile(payload) {
  await wait();
  const users = loadLocalAuthUsers();
  const targetIndex = users.findIndex((item) => item.id === payload.id || item.phone === payload.phone);

  if (targetIndex < 0) {
    throw new Error("未找到当前账号。");
  }

  const nextUsers = [...users];
  nextUsers[targetIndex] = {
    ...nextUsers[targetIndex],
    name: payload.name || nextUsers[targetIndex].name,
    phone: payload.phone || nextUsers[targetIndex].phone,
    avatar: payload.avatar || nextUsers[targetIndex].avatar
  };
  saveLocalAuthUsers(nextUsers);
  return mapLocalUserToAuthResult(nextUsers[targetIndex]);
}

async function localPhoneExists(phone) {
  await wait(80);
  const users = loadLocalAuthUsers();
  return { exists: users.some((item) => item.phone === phone) };
}

async function tryWithLocalFallback(executor, fallback) {
  try {
    return await executor();
  } catch (error) {
    if (!isNetworkFailure(error)) {
      throw error;
    }
    return fallback();
  }
}

export const authApi = {
  async login(payload) {
    return tryWithLocalFallback(
      () =>
        requestAuth("/login", {
          method: "POST",
          body: JSON.stringify(payload)
        }),
      () => localLogin(payload)
    );
  },

  async register(payload) {
    return tryWithLocalFallback(
      () =>
        requestAuth("/register", {
          method: "POST",
          body: JSON.stringify(payload)
        }),
      () => localRegister(payload)
    );
  },

  async updateProfile(payload) {
    return tryWithLocalFallback(
      () =>
        requestAuth("/profile", {
          method: "PUT",
          body: JSON.stringify(payload)
        }),
      () => localUpdateProfile(payload)
    );
  },

  async phoneExists(phone) {
    return tryWithLocalFallback(
      () => requestAuth(`/phone-exists?phone=${encodeURIComponent(phone)}`),
      () => localPhoneExists(phone)
    );
  }
};

export function createPlatformApi(dispatch) {
  return {
    async createOrder(payload) {
      await wait();
      dispatch({ type: "CREATE_ORDER", payload });
    },

    async payOrder(orderId) {
      await wait();
      dispatch({ type: "PAY_ORDER", orderId });
    },

    async assignOrder(orderId, providerId) {
      await wait();
      dispatch({ type: "MANUAL_ASSIGN_ORDER", orderId, providerId });
    },

    async completeOrder(orderId) {
      await wait();
      dispatch({ type: "COMPLETE_ORDER", orderId });
    },

    async reviewOrder(orderId, rating, review) {
      await wait();
      dispatch({ type: "SUBMIT_REVIEW", orderId, rating, review });
    },

    async restockItem(itemId) {
      await wait();
      dispatch({ type: "RESTOCK_ITEM", itemId });
    },

    async cancelOrder(orderId, reason) {
      await wait();
      dispatch({ type: "CANCEL_ORDER", orderId, reason });
    },

    async rescheduleOrder(orderId, appointmentText, dateKey) {
      await wait();
      dispatch({ type: "RESCHEDULE_ORDER", orderId, appointmentText, dateKey });
    },

    async requestRefund(orderId, reason) {
      await wait();
      dispatch({ type: "REQUEST_REFUND", orderId, reason });
    },

    async submitComplaint(orderId, content) {
      await wait();
      dispatch({ type: "SUBMIT_COMPLAINT", orderId, content });
    }
  };
}
