import { NavLink } from "react-router-dom";
import { Footer, Icon } from "../components";
import { useAppState } from "../app-state";

const adminNavItems = [
  { icon: "dashboard", label: "仪表盘", to: "/admin" },
  { icon: "calendar_today", label: "排班计划", to: "/admin/schedule" },
  { icon: "payments", label: "营收统计", to: "/admin/revenue" },
  { icon: "inventory_2", label: "库存管理", to: "/admin/inventory" },
  { icon: "group", label: "客户列表", to: "/admin/customers" },
  { icon: "analytics", label: "系统健康", to: "/ops" }
];

export function AdminShell({ title, description, children, actions }) {
  const { dispatch } = useAppState();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-low p-md md:flex">
        <div className="mb-lg px-2">
          <h1 className="text-headline-sm font-bold">系统控制台</h1>
          <p className="text-label-md text-on-surface-variant opacity-70">管理员模式</p>
        </div>
        <nav className="flex-1 space-y-xs">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-sm rounded-xl p-sm transition-all ${
                  isActive
                    ? "scale-95 bg-secondary-container font-semibold text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-variant"
                }`
              }
            >
              <Icon name={item.icon} />
              <span className="text-label-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-outline-variant pt-lg">
          <button className="mb-md flex w-full items-center justify-center gap-xs rounded-xl bg-primary py-sm text-on-primary transition-opacity hover:opacity-90">
            <Icon name="add" />
            <span className="text-label-md font-semibold">新建服务申请</span>
          </button>
          <button
            className="flex w-full items-center justify-center gap-xs rounded-xl border border-outline-variant bg-surface py-sm text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
            onClick={() => dispatch({ type: "LOGOUT" })}
          >
            <Icon name="logout" />
            <span className="text-label-md font-semibold">退出登录</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile shadow-sm md:px-margin-desktop">
          <div className="flex items-center gap-gutter">
            <span className="text-headline-md font-bold text-primary">HomeCare Pro</span>
            <div>
              <div className="text-headline-sm font-semibold">{title}</div>
              <div className="text-label-md text-on-surface-variant">{description}</div>
            </div>
          </div>
          <div className="flex items-center gap-md">
            {actions}
            <button className="relative p-2 text-on-surface-variant transition-colors hover:text-primary">
              <Icon name="notifications" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
            </button>
            <button className="p-2 text-on-surface-variant transition-colors hover:text-primary">
              <Icon name="settings" />
            </button>
            <button
              className="rounded-lg border border-outline-variant px-sm py-2 text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              onClick={() => dispatch({ type: "LOGOUT" })}
            >
              退出
            </button>
            <div className="flex items-center gap-xs border-l border-outline-variant pl-md">
              <img
                className="h-10 w-10 rounded-full border-2 border-surface-container"
                alt="管理员"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIqC2CbritSVbUWOPyUtxAbcFyx1AjtKOB_LdPBxRLn6NWQ1LbyDt_VACYe9WLgermNBZ57Z3nt7dfzsHJTLa9B1C3A0cNIDlUdyNU7WOwGyEAEVKBuRQcWrtTuRsdh6dSlbBgKh63PmYgAq3AT3GQTtpzieMgdM8PCOTKNfLOjv5lQYU_sZRBbmFCYe0Y8U7oXuJndkUa-2-y7wzWVn3uNBmr-TKdiM3Wave1WX4JukvuynN0PAROB37j8rUZbvI6poayE0nk4zmh"
              />
              <div className="hidden text-left lg:block">
                <p className="text-label-md font-semibold leading-none">James Wilson</p>
                <p className="text-[10px] uppercase tracking-wider text-outline">高级管控员</p>
              </div>
            </div>
          </div>
        </header>
        <section className="p-margin-mobile md:p-margin-desktop">{children}</section>
        <Footer compact />
      </main>
    </div>
  );
}
