import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../app-state";
import { Icon, roleHomeMap } from "../components";
import { authApi } from "../api";

const demoAccounts = [
  {
    role: "消费者端",
    phone: "13800000000",
    password: "Demo123456!",
    description: "可直接体验下单、订单跟踪和评价。"
  },
  {
    role: "员工端",
    phone: "13900000000",
    password: "Demo123456!",
    description: "可体验接单、执行服务和任务流转。"
  },
  {
    role: "管理端",
    phone: "13700000000",
    password: "Demo123456!",
    description: "可进入后台管理、排班和营收模块。"
  }
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useAppState();
  const isLoggedIn = state.auth.isLoggedIn;
  const currentUser = state.auth.currentUser;
  const currentRoleHome = roleHomeMap[currentUser.role] || "/";
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({
    phone: currentUser.phone || "",
    password: ""
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    const nextErrors = {};

    if (!/^1\d{10}$/.test(loginForm.phone.trim())) {
      nextErrors.phone = "请输入 11 位有效手机号";
    }
    if (!loginForm.password.trim()) {
      nextErrors.password = "请输入密码";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      dispatch({ type: "PUSH_TOAST", payload: { message: "请先填写完整登录信息。", tone: "warning" } });
      return;
    }

    setSubmitting(true);

    try {
      const result = await authApi.login({
        phone: loginForm.phone.trim(),
        password: loginForm.password
      });

      dispatch({ type: "LOGIN", payload: { user: result.user } });
      navigate(location.state?.from || roleHomeMap[result.user.role] || "/", { replace: true });
    } catch (error) {
      dispatch({
        type: "PUSH_TOAST",
        payload: { message: error.message || "登录失败，请稍后再试。", tone: "warning" }
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister() {
    const nextErrors = {};

    if (!registerForm.name.trim()) {
      nextErrors.registerName = "请输入姓名";
    }
    if (!/^1\d{10}$/.test(registerForm.phone.trim())) {
      nextErrors.registerPhone = "请输入 11 位有效手机号";
    }
    if (registerForm.password.length < 8) {
      nextErrors.registerPassword = "密码至少 8 位";
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      nextErrors.confirmPassword = "两次输入的密码不一致";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      dispatch({ type: "PUSH_TOAST", payload: { message: "请先补全正确的注册信息。", tone: "warning" } });
      return;
    }

    setSubmitting(true);

    try {
      const result = await authApi.register({
        name: registerForm.name.trim(),
        phone: registerForm.phone.trim(),
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword
      });

      dispatch({ type: "LOGIN", payload: { user: result.user } });
      navigate(location.state?.from || roleHomeMap[result.user.role] || "/", { replace: true });
    } catch (error) {
      dispatch({
        type: "PUSH_TOAST",
        payload: { message: error.message || "注册失败，请稍后再试。", tone: "warning" }
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-background px-margin-mobile py-md text-on-background md:px-margin-desktop md:py-lg">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-md lg:min-h-[calc(100svh-3rem)] lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="rounded-3xl bg-primary px-md py-lg text-on-primary shadow-lg md:px-lg">
          <p className="mb-sm text-label-md uppercase tracking-wider text-primary-fixed">HomeCare Pro</p>
          <h1 className="text-headline-lg-mobile font-bold md:text-headline-lg">欢迎进入智享到家</h1>
          <p className="mt-sm max-w-lg text-body-md text-on-primary-container md:text-body-lg">
            现在登录和注册都走真实接口。新用户注册后会立刻创建账号并自动登录，不再是前端假数据切换。
          </p>
          <div className="mt-md space-y-sm">
            {demoAccounts.map((account) => (
              <div key={account.role} className="rounded-2xl border border-white/15 bg-white/10 px-sm py-sm">
                <div className="flex items-start justify-between gap-sm">
                  <div>
                    <p className="text-label-md font-semibold">{account.role}</p>
                    <p className="mt-1 text-[12px] leading-5 text-on-primary-container">{account.description}</p>
                  </div>
                  <div className="text-right text-[12px] leading-5 text-primary-fixed">
                    <div>{account.phone}</div>
                    <div>{account.password}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-outline-variant bg-surface p-md shadow-sm md:p-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-headline-md font-semibold md:text-headline-lg">
                {isLoggedIn ? "当前账号" : mode === "login" ? "账号登录" : "账号注册"}
              </h2>
              <p className="mt-xs text-label-md md:text-body-md text-on-surface-variant">
                {isLoggedIn
                  ? "您已经进入系统，可直接返回对应首页，或先退出再更换账号。"
                  : mode === "login"
                    ? "请输入已注册手机号和密码，系统会根据真实角色进入对应首页。"
                    : "新用户默认注册为消费者账号，注册成功后会自动登录。"}
              </p>
            </div>
            <span className="rounded-full bg-secondary-container px-sm py-xs text-label-sm font-semibold text-on-secondary-container">
              真实认证
            </span>
          </div>

          {isLoggedIn ? (
            <div className="mt-md rounded-3xl border border-primary/15 bg-primary-fixed/60 p-md">
              <div className="flex items-center gap-sm">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-primary/10 bg-white">
                  <img className="h-full w-full object-cover" alt={`${currentUser.name} 头像`} src={currentUser.avatar} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body-lg font-semibold text-on-primary-fixed">{currentUser.name}</div>
                  <div className="mt-[2px] flex flex-wrap gap-xs text-label-sm text-on-primary-fixed-variant">
                    <span className="rounded-full bg-white/70 px-sm py-[2px]">{currentUser.level}</span>
                    <span className="rounded-full bg-white/70 px-sm py-[2px]">{currentUser.phone}</span>
                  </div>
                </div>
              </div>
              <div className="mt-md grid gap-sm sm:grid-cols-2">
                <button
                  className="flex items-center justify-center gap-xs rounded-2xl bg-primary px-md py-3 text-label-md font-semibold text-on-primary"
                  onClick={() => navigate(currentRoleHome, { replace: true })}
                >
                  <Icon name="arrow_forward" className="text-[18px]" />
                  进入当前首页
                </button>
                <button
                  className="flex items-center justify-center gap-xs rounded-2xl border border-outline bg-white px-md py-3 text-label-md font-semibold text-on-surface"
                  onClick={() => {
                    dispatch({ type: "LOGOUT" });
                    setMode("login");
                    setErrors({});
                    setLoginForm({ phone: "", password: "" });
                    setRegisterForm({ name: "", phone: "", password: "", confirmPassword: "" });
                  }}
                >
                  <Icon name="logout" className="text-[18px]" />
                  退出当前账号
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-md flex gap-sm">
                <button
                  className={`flex-1 rounded-xl py-3 text-label-md font-semibold transition-colors ${
                    mode === "login" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"
                  }`}
                  onClick={() => {
                    setMode("login");
                    setErrors({});
                  }}
                >
                  登录
                </button>
                <button
                  className={`flex-1 rounded-xl py-3 text-label-md font-semibold transition-colors ${
                    mode === "register" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"
                  }`}
                  onClick={() => {
                    setMode("register");
                    setErrors({});
                  }}
                >
                  注册
                </button>
              </div>

              {mode === "login" ? (
                <div className="mt-md space-y-sm md:space-y-md">
                  <div>
                    <label className="mb-xs block text-label-md text-on-surface-variant">手机号</label>
                    <input
                      value={loginForm.phone}
                      onChange={(event) => setLoginForm((current) => ({ ...current, phone: event.target.value }))}
                      className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                        errors.phone ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="请输入 11 位手机号"
                    />
                    {errors.phone ? <p className="mt-xs text-label-sm text-error">{errors.phone}</p> : null}
                  </div>
                  <div>
                    <label className="mb-xs block text-label-md text-on-surface-variant">密码</label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                      className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                        errors.password ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="请输入密码"
                    />
                    {errors.password ? <p className="mt-xs text-label-sm text-error">{errors.password}</p> : null}
                  </div>

                  <button
                    className="flex w-full items-center justify-center gap-sm rounded-xl bg-primary py-3 text-label-md font-semibold text-on-primary disabled:opacity-60"
                    onClick={handleLogin}
                    disabled={submitting}
                  >
                    <Icon name="login" />
                    {submitting ? "登录中..." : "进入系统"}
                  </button>
                </div>
              ) : (
                <div className="mt-md space-y-sm md:space-y-md">
                  <div>
                    <label className="mb-xs block text-label-md text-on-surface-variant">姓名</label>
                    <input
                      value={registerForm.name}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                      className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                        errors.registerName ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="请输入姓名"
                    />
                    {errors.registerName ? <p className="mt-xs text-label-sm text-error">{errors.registerName}</p> : null}
                  </div>
                  <div>
                    <label className="mb-xs block text-label-md text-on-surface-variant">手机号</label>
                    <input
                      value={registerForm.phone}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                      className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                        errors.registerPhone ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="请输入 11 位手机号"
                    />
                    {errors.registerPhone ? <p className="mt-xs text-label-sm text-error">{errors.registerPhone}</p> : null}
                  </div>
                  <div>
                    <label className="mb-xs block text-label-md text-on-surface-variant">密码</label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                      className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                        errors.registerPassword ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="至少 8 位密码"
                    />
                    {errors.registerPassword ? <p className="mt-xs text-label-sm text-error">{errors.registerPassword}</p> : null}
                  </div>
                  <div>
                    <label className="mb-xs block text-label-md text-on-surface-variant">确认密码</label>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                        errors.confirmPassword ? "border-error" : "border-outline-variant focus:border-primary"
                      }`}
                      placeholder="请再次输入密码"
                    />
                    {errors.confirmPassword ? <p className="mt-xs text-label-sm text-error">{errors.confirmPassword}</p> : null}
                  </div>

                  <button
                    className="flex w-full items-center justify-center gap-sm rounded-xl bg-primary py-3 text-label-md font-semibold text-on-primary disabled:opacity-60"
                    onClick={handleRegister}
                    disabled={submitting}
                  >
                    <Icon name="person_add" />
                    {submitting ? "注册中..." : "注册并登录"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
