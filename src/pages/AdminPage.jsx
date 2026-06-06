import { useAppState } from "../app-state";
import { Icon, StatusBadge } from "../components";
import { AdminShell } from "./admin-shared";

export function AdminPage() {
  const { state, dispatch } = useAppState();
  const paidOrders = state.orders.filter((order) => order.status !== "待支付");
  const pendingOrders = state.orders.filter((order) => order.status === "待派单");
  const inProgressOrders = state.orders.filter((order) => ["已派单", "已接单", "服务中"].includes(order.status));
  const completedOrders = state.orders.filter((order) => ["已完成", "已评价"].includes(order.status));

  const adminMetrics = [
    {
      label: "总订单量",
      value: String(state.orders.length),
      extra: "+实时"
    },
    {
      label: "活跃服务",
      value: String(state.orders.filter((order) => ["已接单", "服务中"].includes(order.status)).length),
      extra: "同步中"
    },
    {
      label: "月度营收",
      value: `¥${paidOrders.reduce((sum, order) => sum + order.amount, 0).toFixed(2)}`,
      extra: "动态"
    }
  ];

  return (
    <AdminShell title="仪表盘" description="查看全局调度、订单活动、履约进度与系统告警。">
      <div className="mb-lg grid grid-cols-1 gap-gutter md:grid-cols-3">
        {adminMetrics.map((metric, index) => (
          <div key={metric.label} className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
            <div className="mb-base flex items-start justify-between">
              <span className="text-label-md text-on-surface-variant">{metric.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  index === 1 ? "bg-tertiary-fixed text-on-tertiary-fixed-variant" : "bg-secondary-container text-on-secondary-container"
                }`}
              >
                {metric.extra}
              </span>
            </div>
            <p className="text-headline-lg font-semibold">{metric.value}</p>
            <div className="mt-md h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
              <div
                className={`h-full rounded-full ${
                  index === 2 ? "bg-secondary w-[85%]" : index === 1 ? "bg-tertiary w-[45%]" : "bg-primary w-[75%]"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-lg grid grid-cols-1 gap-gutter md:grid-cols-4">
        {[
          ["待派单", pendingOrders.length, "订单等待系统或管理员派单"],
          ["服务执行中", inProgressOrders.length, "包含已派单、已接单、服务中"],
          ["已完成", completedOrders.length, "等待或已完成评价闭环"],
          ["已支付", paidOrders.length, "已进入正式服务流程"]
        ].map(([label, value, desc]) => (
          <div key={label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <div className="text-label-md text-on-surface-variant">{label}</div>
            <div className="mt-sm text-headline-md font-semibold">{value}</div>
            <div className="mt-xs text-label-sm text-outline">{desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gutter xl:grid-cols-12">
        <div className="space-y-gutter xl:col-span-8">
          <div className="flex h-[500px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-md py-sm">
              <h2 className="text-headline-md font-semibold">实时调度中心</h2>
              <div className="flex gap-xs">
                <button className="rounded-lg border border-outline-variant bg-surface px-sm py-1.5 text-label-md font-semibold">
                  列表视图
                </button>
                <button className="rounded-lg bg-primary px-sm py-1.5 text-label-md font-semibold text-on-primary">
                  地图视图
                </button>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden bg-surface-container">
              <div
                className="absolute inset-0 opacity-40 grayscale"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMVS5LTKy4-oepNBX0p_nWDGMdTU9lcWnFkInSx2Nz8zfsMq7PGPtJtnHLmIMtTltTv9Q_v7SS62enr8QWhv2wYsDrHdsPH0c1K9RLoreCkcpKN45dmaksdYBbdYqpIK8bUO01x8Qdu7OqhZU9JoEeFTSh4wFpJBtSHJpwzyR8SdEKD4bX2_avr26J60tvSAgr0IE_kGbIR2JWeAFRXOLoycR20-XUsuZXmUPFIExtgGZXPI9Q3g04oCs170CRqhIbrRbw2qRYeBDs')",
                  backgroundPosition: "center",
                  backgroundSize: "cover"
                }}
              />
              <div className="absolute left-40 top-20 flex cursor-pointer flex-col items-center group">
                <div className="scale-110 rounded-full bg-primary p-2 text-on-primary shadow-lg ring-4 ring-primary/20">
                  <Icon name="home_repair_service" className="text-sm" />
                </div>
                <div className="pointer-events-none mt-2 w-48 rounded-lg bg-white p-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                  <p className="text-xs font-semibold">{state.orders[1]?.serviceName ?? "紧急管道维修"}</p>
                  <p className="text-[10px] text-outline">服务商: {state.orders[1]?.providerName ?? "待分配"}</p>
                  <p className="text-[10px] font-semibold text-secondary">{state.orders[1]?.status ?? "赶往途中"}</p>
                </div>
              </div>
              <div className="absolute bottom-32 right-60 flex cursor-pointer flex-col items-center group">
                <div className="rounded-full bg-secondary p-2 text-on-secondary shadow-lg ring-4 ring-secondary/20">
                  <Icon name="cleaning_services" className="text-sm" />
                </div>
                <div className="pointer-events-none mt-2 w-48 rounded-lg bg-white p-2 opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                  <p className="text-xs font-semibold">{state.orders[0]?.serviceName ?? "标准保洁"}</p>
                  <p className="text-[10px] text-outline">服务商: {state.orders[0]?.providerName ?? "Sarah Lee"}</p>
                  <p className="text-[10px] font-semibold text-primary">{state.orders[0]?.status ?? "进行中"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-md py-sm">
              <h2 className="text-headline-md font-semibold">最近活动</h2>
              <button className="text-label-md font-semibold text-primary hover:underline">导出 CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant bg-surface-container-lowest">
                  <tr>
                    {["用户", "服务项目", "状态", "金额"].map((head) => (
                      <th key={head} className="px-md py-sm text-label-md uppercase tracking-wider text-outline">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {state.orders.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-md py-md font-semibold">{row.customerName}</td>
                      <td className="px-md py-md">{row.serviceName}</td>
                      <td className="px-md py-md">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-md py-md text-right font-semibold">¥{row.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-gutter xl:col-span-4">
          <div className="rounded-xl border border-outline/30 bg-inverse-surface p-md text-inverse-on-surface shadow-lg">
            <div className="mb-md flex items-center gap-sm">
              <Icon name="bolt" className="text-secondary-fixed" />
              <h3 className="text-headline-sm font-semibold">系统状态</h3>
            </div>
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-label-md opacity-80">API 吞吐量</span>
                <span className="text-label-md font-black">99.98%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div className="h-full w-[99%] rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(78,222,163,0.5)]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-label-md opacity-80">服务商响应延迟</span>
                <span className="text-label-md font-black">42ms</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div className="h-full w-[15%] rounded-full bg-primary-fixed-dim" />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-md py-sm">
              <h2 className="text-headline-md font-semibold">预警中心</h2>
              <span className="rounded-full bg-error px-2 py-0.5 text-[10px] font-black text-on-error">4 条紧急</span>
            </div>
            <div className="divide-y divide-outline-variant">
              {[
                ["warning", "待派单订单", `当前仍有 ${pendingOrders.length} 条订单尚未完成派单。`],
                ["payments", "投诉升级", "订单 #4492 需要人工介入调解退款。"],
                ["info", "系统更新", "V2.4 调度算法已成功部署至生产环境。"]
              ].map(([icon, title, text]) => (
                <div key={title} className="cursor-pointer p-md transition-colors hover:bg-surface-container-low">
                  <div className="flex gap-sm">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                        icon === "warning"
                          ? "bg-error-container text-on-error-container"
                          : icon === "payments"
                            ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                            : "bg-primary-container/20 text-primary"
                      }`}
                    >
                      <Icon name={icon} />
                    </div>
                    <div className="flex-1">
                      <p className="text-label-md font-semibold">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full border-t border-outline-variant py-sm text-label-md font-semibold text-primary transition-colors hover:bg-surface-container-low">
              查看全部通知
            </button>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
            <h3 className="mb-md text-label-md font-black uppercase tracking-wider text-outline">快捷操作</h3>
            <div className="grid grid-cols-2 gap-sm">
              {[
                ["person_add", "添加服务商", "text-primary"],
                ["mail", "全员广播", "text-secondary"],
                ["summarize", "业务报表", "text-tertiary"],
                ["lock", "安全审核", "text-error"]
              ].map(([icon, label, tone]) => (
                <button
                  key={label}
                  className="flex flex-col items-center gap-xs rounded-xl border border-outline-variant/30 bg-surface-container-low p-sm transition-colors hover:bg-surface-container"
                >
                  <Icon name={icon} className={tone} />
                  <span className="text-[10px] font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
            <button
              className="w-full rounded-lg border border-outline-variant py-3 text-label-md font-semibold text-primary transition-colors hover:bg-surface-container"
              onClick={() => {
                if (pendingOrders[0]) {
                  dispatch({ type: "ASSIGN_ORDER", orderId: pendingOrders[0].id, providerId: "provider-1" });
                }
              }}
            >
              为首条待派单订单自动派单
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
