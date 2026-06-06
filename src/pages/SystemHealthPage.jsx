import { useEffect, useState } from "react";
import { useAppState } from "../app-state";
import { Footer, Icon, MobileBottomNav } from "../components";
import { systemServices } from "../data";

export function SystemHealthPage() {
  const { state } = useAppState();
  const [metrics, setMetrics] = useState({
    requests: "1.2M",
    latency: "42ms",
    errorRate: "0.02%",
    nodes: "24"
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((current) => ({
        requests: current.requests,
        latency: `${40 + Math.round(Math.random() * 6)}ms`,
        errorRate: "0.02%",
        nodes: "24"
      }));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface dark:bg-inverse-surface dark:text-inverse-on-surface">
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-low p-md md:flex">
        <div className="mb-lg">
          <h1 className="text-headline-sm font-bold">控制台</h1>
          <p className="text-label-md text-outline">管理员模式</p>
        </div>
        <nav className="flex-1 space-y-2">
          {[
            ["dashboard", "仪表盘", "/admin"],
            ["calendar_today", "排班计划", "#"],
            ["payments", "营收统计", "#"],
            ["inventory_2", "库存管理", "#"],
            ["group", "客户列表", "#"],
            ["analytics", "系统健康", "/ops"]
          ].map(([icon, label, href]) => (
            <a
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                label === "系统健康"
                  ? "scale-95 bg-secondary-container font-semibold text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              <Icon name={icon} />
              <span className="text-label-md">{label}</span>
            </a>
          ))}
        </nav>
      </aside>

      <main className="pb-32 md:ml-64 md:p-margin-desktop p-margin-mobile">
        <header className="mb-lg flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-headline-md font-semibold text-primary">基础架构运行状态</h2>
            <p className="text-body-md text-on-surface-variant">Spring Cloud 微服务集群实时可视化监控。</p>
          </div>
          <div className="flex items-center gap-sm rounded-full bg-surface-container p-base pr-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
              <Icon name="query_stats" className="text-on-secondary-container" />
            </div>
            <div className="flex flex-col">
              <span className="text-label-md font-semibold">系统状态</span>
              <div className="flex items-center gap-2">
                <span className="animate-pulse-dot h-2 w-2 rounded-full bg-secondary-fixed" />
                <span className="text-[12px] font-semibold text-on-secondary-fixed-variant">所有服务在线</span>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-lg grid grid-cols-1 gap-gutter md:grid-cols-4">
          {[
            ["请求总量", `${state.orders.length * 128}次`, "12%"],
            ["平均延迟", metrics.latency, "4ms"],
            ["错误率", metrics.errorRate, "稳定"],
            ["活跃节点", metrics.nodes, `活跃订单 ${state.orders.filter((order) => ["已接单", "服务中"].includes(order.status)).length}`]
          ].map(([label, value, extra], index) => (
            <div key={label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <p className="mb-base text-label-md text-outline-variant">{label}</p>
              <div className="flex items-end justify-between">
                <h3 className="text-headline-lg font-semibold text-primary">{value}</h3>
                <span className={`mb-1 flex items-center text-[12px] font-semibold ${index < 2 || index === 3 ? "text-secondary" : "text-outline-variant"}`}>
                  {index < 2 ? <Icon name={index === 0 ? "trending_up" : "trending_down"} className="text-[14px]" /> : null}
                  {extra}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-gutter xl:grid-cols-3 lg:grid-cols-2">
          {systemServices.map((service) => (
            <div
              key={service.name}
              className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="flex items-start justify-between p-md">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Icon name={service.icon} className="text-primary" />
                    <h4 className="text-headline-sm font-semibold">{service.name}</h4>
                  </div>
                  <p className="text-label-md text-on-surface-variant">{service.desc}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-secondary-container/20 px-3 py-1 text-[12px] font-semibold text-on-secondary-container">
                  <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-secondary-fixed" />
                  在线
                </span>
              </div>
              <div className="mb-md grid grid-cols-3 gap-2 px-md">
                {[
                  ["CPU", service.cpu],
                  ["延迟", service.latency],
                  ["TPS", service.tps]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-outline-variant/30 bg-surface p-2 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-outline">{label}</p>
                    <p className="text-body-md font-semibold text-primary">{value}</p>
                  </div>
                ))}
              </div>
              <div className="custom-scrollbar h-24 overflow-y-auto bg-[#0b1c30] p-3 font-mono text-[11px] leading-relaxed">
                {service.logs.map((log, index) => (
                  <div
                    key={log}
                    className={`mb-1 ${index < 3 ? "terminal-text text-secondary-fixed" : "text-outline-variant"}`}
                  >
                    [{index < 3 ? "信息" : "调试"}] {service.name === "订单服务" && index === 0 ? `当前订单数: ${state.orders.length}` : log}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-lg">
          <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container p-lg">
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, #004ac6 1px, transparent 0)",
                backgroundSize: "32px 32px"
              }}
            />
            <div className="z-10 max-w-2xl text-center">
              <h3 className="mb-4 text-headline-lg font-semibold">拓扑结构可视化</h3>
              <p className="mb-8 text-body-lg text-on-surface-variant">
                微服务目前在三个可用区之间以高可用集群模式运行，订单链路、支付链路和派单链路均保持稳定。
              </p>
              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-inverse-surface shadow-2xl">
                <img
                  className="h-full w-full object-cover opacity-50"
                  alt="架构图"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQAh5DyUQfdL3xlvYxyx5poj1CXsR3w_0SuzC9dgR82iTTRhYTC8hzOcGex2uSoyuZDfLM0NiExjjHXnDISEjzj_ZbhPYklWR-kx3mbDPJCSOyup7x8DgqBeeaarOHnD2aAXw1gZ6DEqTaMMnIEoa-hQcdfFmoJbcY39LtJUsW_jxF5KTJxiJQV-HXoo94KSZME_GpBOzg8lK0BzFkXytn28pjj2qHKdHIuCdefKSaibi05b8KO-i_ng-meXKZHXm7E1eNkDCWHUK9"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-semibold text-on-primary shadow-xl transition-transform hover:scale-105">
                    <Icon name="zoom_in" />
                    打开交互式图表
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer compact />
      </main>

      <MobileBottomNav
        items={[
          { to: "/admin", icon: "dashboard", label: "仪表盘" },
          { to: "/admin/schedule", icon: "calendar_today", label: "排班" },
          { to: "/ops", icon: "analytics", label: "状态" },
          { to: "/overview", icon: "person", label: "我的" }
        ]}
      />
    </div>
  );
}
