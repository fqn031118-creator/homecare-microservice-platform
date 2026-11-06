import { useMemo, useState } from "react";
import { useAppState } from "../app-state";
import { AdminShell } from "./admin-shared";

export function AdminRevenuePage() {
  const { state } = useAppState();
  const [filter, setFilter] = useState("all");

  const paidOrders = useMemo(() => {
    const source = state.orders.filter((order) => Boolean(order.paidAt));
    if (filter === "repair") {
      return source.filter((order) => order.category.includes("维修"));
    }
    if (filter === "cleaning") {
      return source.filter((order) => order.category.includes("保洁") || order.category.includes("消杀"));
    }
    if (filter === "today") {
      return source.filter((order) => String(order.paidAt || order.createdAt).includes(new Date().toLocaleDateString("sv-SE")));
    }
    return source;
  }, [filter, state.orders]);

  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const serviceRevenue = paidOrders.reduce((sum, order) => sum + order.baseAmount, 0);
  const feeRevenue = paidOrders.reduce((sum, order) => sum + order.serviceFee, 0);

  return (
    <AdminShell title="营收统计" description="按数据库模拟支付记录统计，金额不代表真实营收。">
      <div className="mb-md flex flex-wrap gap-sm">
        {[
          ["all", "全部订单"],
          ["today", "今日收入"],
          ["cleaning", "保洁/消杀"],
          ["repair", "维修类"]
        ].map(([key, label]) => (
          <button
            key={key}
            className={`rounded-full px-md py-2 text-label-md ${
              filter === key ? "bg-primary text-on-primary" : "border border-outline-variant bg-surface text-on-surface"
            }`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-lg grid grid-cols-1 gap-gutter md:grid-cols-3">
        {[
          ["累计营收", `¥${totalRevenue.toFixed(2)}`, "已支付订单总收入"],
          ["服务收入", `¥${serviceRevenue.toFixed(2)}`, "服务项目原始金额"],
          ["平台服务费", `¥${feeRevenue.toFixed(2)}`, "平台抽取服务费"]
        ].map(([label, value, desc]) => (
          <div key={label} className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
            <div className="text-label-md text-on-surface-variant">{label}</div>
            <div className="mt-sm text-headline-md font-semibold text-primary">{value}</div>
            <div className="mt-xs text-label-sm text-outline">{desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
          <h2 className="mb-md text-headline-md font-semibold">按服务分类统计</h2>
          <div className="space-y-sm">
            {Object.entries(
              paidOrders.reduce((acc, order) => {
                acc[order.category] = (acc[order.category] || 0) + order.amount;
                return acc;
              }, {})
            ).map(([category, amount]) => (
              <div key={category} className="rounded-xl bg-surface-container-low p-md">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{category}</span>
                  <span className="text-primary">¥{amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
          <h2 className="mb-md text-headline-md font-semibold">最近到账订单</h2>
          <div className="space-y-sm">
            {paidOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-outline-variant bg-white p-md">
                <div className="flex items-center justify-between gap-md">
                  <div>
                    <div className="font-semibold">{order.serviceName}</div>
                    <div className="text-label-md text-on-surface-variant">{order.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">¥{order.amount.toFixed(2)}</div>
                    <div className="text-label-sm text-outline">{order.paidAt ?? "已纳入统计"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
