const AUTH_API_BASE = (import.meta.env.VITE_AUTH_API_BASE || "http://127.0.0.1:8081/api/auth").replace(/\/$/, "");
const PLATFORM_API_BASE = AUTH_API_BASE.replace(/\/auth$/, "/platform");
const TOKEN_KEY = "homecare-session-v2";
export const session = {
  get: () => window.sessionStorage.getItem(TOKEN_KEY),
  set: (token) => window.sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => window.sessionStorage.removeItem(TOKEN_KEY)
};
async function request(base, path, options = {}) {
  const token = session.get();
  const response = await fetch(`${base}${path}`, {
    ...options,
    signal: AbortSignal.timeout(15000),
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `请求失败（${response.status}）`);
    error.status = response.status;
    throw error;
  }
  return data;
}
const post = (body) => ({ method: "POST", body: JSON.stringify(body) });
async function authenticate(path, payload) {
  const result = await request(AUTH_API_BASE, path, post(payload));
  if (!result.token) throw new Error("认证服务未返回有效会话。");
  session.set(result.token);
  return result;
}
export const authApi = {
  login: (payload) => authenticate("/login", payload),
  register: (payload) => authenticate("/register", payload),
  me: () => request(AUTH_API_BASE, "/me"),
  updateProfile: (payload) => request(AUTH_API_BASE, "/profile", { method: "PUT", body: JSON.stringify(payload) }),
  phoneExists: (phone) => request(AUTH_API_BASE, `/phone-exists?phone=${encodeURIComponent(phone)}`),
  logout: () => request(AUTH_API_BASE, "/logout", post({}))
};
export const platformApi = {
  snapshot: () => request(PLATFORM_API_BASE, "/snapshot"),
  create: (payload) => request(PLATFORM_API_BASE, "/orders", post(payload)),
  action: (id, operation, payload) => request(PLATFORM_API_BASE, `/orders/${encodeURIComponent(id)}/${operation}`, post(payload)),
  online: (online) => request(PLATFORM_API_BASE, "/provider/online", { method: "PUT", body: JSON.stringify({ online }) })
};
// Dispatch handles remote writes and reloads authoritative server state.
export function createPlatformApi(dispatch) {
  return {
    createOrder: (payload) => dispatch({ type: "CREATE_ORDER", payload }),
    payOrder: (orderId) => dispatch({ type: "PAY_ORDER", orderId }),
    assignOrder: (orderId, providerId) => dispatch({ type: "MANUAL_ASSIGN_ORDER", orderId, providerId }),
    completeOrder: (orderId) => dispatch({ type: "COMPLETE_ORDER", orderId }),
    reviewOrder: (orderId, rating, review) => dispatch({ type: "SUBMIT_REVIEW", orderId, rating, review }),
    restockItem: () => dispatch({ type: "PUSH_TOAST", payload: { message: "库存为展示数据，暂不支持真实入库。", tone: "warning" } }),
    cancelOrder: (orderId, reason) => dispatch({ type: "CANCEL_ORDER", orderId, reason }),
    rescheduleOrder: (orderId, appointmentText, dateKey) => dispatch({ type: "RESCHEDULE_ORDER", orderId, appointmentText, dateKey }),
    requestRefund: (orderId, reason) => dispatch({ type: "REQUEST_REFUND", orderId, reason }),
    submitComplaint: (orderId, content) => dispatch({ type: "SUBMIT_COMPLAINT", orderId, content })
  };
}
