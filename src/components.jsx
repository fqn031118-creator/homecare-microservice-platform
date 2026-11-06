import { useEffect } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { useAppState } from "./app-state";

export const roleHomeMap = {
  customer: "/",
  provider: "/provider",
  admin: "/admin"
};

export function Icon({ name, className = "", fill = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      style={fill ? { fontVariationSettings: '"FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24' } : undefined}
    >
      {name}
    </span>
  );
}

export function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const { state } = useAppState();

  if (!state.auth.ready) return <div className="p-lg">正在验证登录状态…</div>;

  if (!state.auth.isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(state.auth.currentUser.role)) {
    return <Navigate to={roleHomeMap[state.auth.currentUser.role] || "/"} replace />;
  }

  return children;
}

export function AppToastRegion() {
  const { state, dispatch } = useAppState();

  useEffect(() => {
    if (!state.ui.toasts.length) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      dispatch({ type: "DISMISS_TOAST", toastId: state.ui.toasts[0].id });
    }, 2600);

    return () => window.clearTimeout(timer);
  }, [dispatch, state.ui.toasts]);

  if (!state.ui.toasts.length) {
    return null;
  }

  const toneMap = {
    success: "border-secondary/20 bg-secondary-container text-on-secondary-container",
    warning: "border-tertiary/20 bg-tertiary-fixed text-on-tertiary-fixed-variant",
    info: "border-primary/20 bg-primary-fixed text-on-primary-fixed-variant"
  };

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[80] flex w-[min(92vw,360px)] flex-col gap-2">
      {state.ui.toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-2xl border px-md py-sm shadow-lg ${toneMap[toast.tone] ?? toneMap.info}`}
        >
          <div className="flex items-start gap-sm">
            <Icon
              name={toast.tone === "success" ? "check_circle" : toast.tone === "warning" ? "warning" : "info"}
              className="mt-[2px] text-[18px]"
              fill
            />
            <div className="flex-1 text-label-md">{toast.message}</div>
            <button
              className="rounded-full p-1 transition-opacity hover:opacity-70"
              onClick={() => dispatch({ type: "DISMISS_TOAST", toastId: toast.id })}
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }) {
  const toneMap = {
    待支付: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    待派单: "bg-primary-fixed text-on-primary-fixed-variant",
    已派单: "bg-primary-container text-on-primary-container",
    已接单: "bg-secondary-container text-on-secondary-container",
    服务中: "bg-secondary text-on-secondary",
    已完成: "bg-surface-container-high text-on-surface",
    已评价: "bg-surface-container-highest text-on-surface",
    已取消: "bg-error-container text-on-error-container",
    退款处理中: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    投诉处理中: "bg-primary-fixed text-on-primary-fixed-variant"
  };

  return (
    <span className={`inline-flex rounded-full px-sm py-xs text-label-sm font-semibold ${toneMap[status] ?? "bg-surface-variant text-on-surface"}`}>
      {status}
    </span>
  );
}

export function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-outline-variant bg-surface-container-low p-lg text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-primary">
        <Icon name={icon} className="text-[28px]" />
      </div>
      <h3 className="mt-md text-headline-md font-semibold">{title}</h3>
      <p className="mt-xs text-body-md text-on-surface-variant">{description}</p>
      {action ? <div className="mt-md">{action}</div> : null}
    </div>
  );
}

export function TopBar({ brand = "HomeCare Pro", brandTo = "/", navItems = [], rightSlot, className = "" }) {
  return (
    <header
      className={`sticky top-0 z-50 flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile shadow-sm md:px-margin-desktop ${className}`.trim()}
    >
      <div className="flex items-center gap-lg">
        <Link to={brandTo} className="text-headline-md font-bold text-primary">
          {brand}
        </Link>
        <nav className="hidden items-center gap-md md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "text-label-md transition-colors",
                  isActive
                    ? "border-b-2 border-primary pb-1 font-bold text-primary"
                    : "text-on-surface-variant hover:text-primary"
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-sm">{rightSlot}</div>
    </header>
  );
}

export function UserActions() {
  const { state, dispatch } = useAppState();

  return (
    <>
      <div className="hidden items-center rounded-full border border-outline-variant bg-surface-container-low px-md py-1.5 lg:flex">
        <Icon name="search" className="mr-2 text-[20px] text-on-surface-variant" />
        <input className="w-56 border-none bg-transparent p-0 text-body-md outline-none" placeholder="搜索服务..." />
      </div>
      <div className="hidden text-right md:block">
        <div className="text-label-md font-semibold">{state.auth.currentUser.name}</div>
        <div className="text-[11px] text-on-surface-variant">{state.auth.currentUser.level}</div>
      </div>
      <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary">
        <Icon name="notifications" />
      </button>
      <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:text-primary">
        <Icon name="settings" />
      </button>
      <button
        className="hidden rounded-full border border-outline-variant px-md py-2 text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary md:inline-flex"
        onClick={() => dispatch({ type: "LOGOUT" })}
      >
        退出
      </button>
      <div className="h-10 w-10 overflow-hidden rounded-full border border-outline-variant bg-surface-container-highest">
        <img
          className="h-full w-full object-cover"
          alt={`${state.auth.currentUser.name} 头像`}
          src={state.auth.currentUser.avatar}
        />
      </div>
    </>
  );
}

export function MobileBottomNav({ items }) {
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around border-t border-outline-variant bg-surface px-4 shadow-md md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              "flex flex-col items-center justify-center rounded-full px-4 py-1 transition-transform active:scale-95",
              isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
            ].join(" ")
          }
        >
          <Icon name={item.icon} />
          <span className="text-label-sm">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function Footer({ compact = false }) {
  return (
    <footer
      className={`w-full border-t border-outline-variant bg-surface-container-highest px-margin-mobile py-lg md:px-margin-desktop ${
        compact ? "" : "mt-xl"
      }`}
    >
      <div className="mx-auto flex max-w-container-max flex-col items-center justify-between gap-md md:flex-row">
        <div className="text-center md:text-left">
          <div className="text-body-lg font-bold text-on-surface">HomeCare Pro</div>
          <p className="text-label-md text-on-surface-variant">© 2026 HomeCare 微服务平台。保留所有权利。</p>
        </div>
        <div className="flex flex-wrap justify-center gap-md text-label-md text-on-surface-variant">
          <a href="#">服务条款</a>
          <a href="#">隐私政策</a>
          <a href="#">微服务状态</a>
          <a href="#">API 文档</a>
        </div>
      </div>
    </footer>
  );
}
