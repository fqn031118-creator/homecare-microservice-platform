import { useState } from "react";
import { useAppState } from "../app-state";
import { AdminShell } from "./admin-shared";

export function AdminInventoryPage() {
  const { state, dispatch } = useAppState();
  const [showLogs, setShowLogs] = useState(false);

  return (
    <AdminShell title="库存示例" description="当前为样例库存，不连接真实仓储；管理上门耗材、维修配件和安全库存预警。">
      <div className="mb-lg grid grid-cols-1 gap-gutter md:grid-cols-3">
        {[
          ["库存总数", state.inventoryItems.length, "当前管理中的物料种类"],
          ["预警物料", state.inventoryItems.filter((item) => item.status === "预警").length, "低于安全库存的物料"],
          ["充足物料", state.inventoryItems.filter((item) => item.status === "充足").length, "库存状态正常"]
        ].map(([label, value, desc]) => (
          <div key={label} className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
            <div className="text-label-md text-on-surface-variant">{label}</div>
            <div className="mt-sm text-headline-md font-semibold">{value}</div>
            <div className="mt-xs text-label-sm text-outline">{desc}</div>
          </div>
        ))}
      </div>

      <div className="mb-md flex justify-end">
        <button
          className="rounded-lg border border-outline-variant px-md py-2 text-label-md text-primary hover:bg-surface-container-low"
          onClick={() => setShowLogs((current) => !current)}
        >
          {showLogs ? "收起出入库记录" : "查看出入库记录"}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
        <div className="border-b border-outline-variant bg-surface-container-low px-md py-sm">
          <h2 className="text-headline-md font-semibold">库存清单</h2>
        </div>
        <div className="divide-y divide-outline-variant/30">
          {state.inventoryItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-md px-md py-md lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-label-md text-on-surface-variant">
                  {item.category} • 供应商：{item.supplier}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-md">
                <div className="text-label-md">
                  库存：{item.stock} {item.unit}
                </div>
                <div className="text-label-md text-outline">
                  安全库存：{item.safetyStock} {item.unit}
                </div>
                <span
                  className={`rounded-full px-sm py-xs text-label-sm font-semibold ${
                    item.status === "预警"
                      ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                      : "bg-secondary-container text-on-secondary-container"
                  }`}
                >
                  {item.status}
                </span>
                <button
                  className="rounded-lg border border-outline-variant px-md py-2 text-label-md text-primary transition-colors hover:bg-surface-container-low"
                  onClick={() => dispatch({ type: "RESTOCK_ITEM", itemId: item.id })}
                >
                  立即补货
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLogs ? (
        <div className="mt-lg overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="border-b border-outline-variant bg-surface-container-low px-md py-sm">
            <h2 className="text-headline-md font-semibold">出入库记录</h2>
          </div>
          <div className="divide-y divide-outline-variant/30">
            {state.inventoryLogs.map((log) => (
              <div key={log.id} className="flex flex-col gap-sm px-md py-md md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">{log.itemName}</div>
                  <div className="text-label-md text-on-surface-variant">
                    {log.type} {log.quantity} • 操作人：{log.operator}
                  </div>
                </div>
                <div className="text-label-md text-outline">{log.createdAt}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
