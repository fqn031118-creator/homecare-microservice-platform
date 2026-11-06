import { useMemo, useState } from "react";
import { useAppState } from "../app-state";
import { StatusBadge } from "../components";
import { formatLocationSummary } from "../location";
import { AdminShell } from "./admin-shared";

export function AdminSchedulePage() {
  const { state, dispatch } = useAppState();
  const [selectedProviderByOrder, setSelectedProviderByOrder] = useState({});

  const rows = useMemo(
    () =>
      state.orders
        .filter((order) => ["待派单", "已派单", "已接单", "服务中"].includes(order.status))
        .map((order) => ({
          id: order.id,
          providerId: order.providerId,
          provider: order.providerName ?? "待分配",
          service: order.serviceName,
          time: order.appointmentText,
          address: order.address,
          serviceLocation: order.serviceLocation,
          category: order.category,
          status: order.status
        })),
    [state.orders]
  );

  return (
    <AdminShell title="排班计划" description="查看服务人员排班、待派单任务和履约时段。">
      <div className="mb-lg grid grid-cols-1 gap-gutter md:grid-cols-3">
        {[
          ["今日待排班", rows.filter((item) => item.status === "待派单").length, "等待人工或系统派单"],
          ["已上门执行", rows.filter((item) => item.status === "服务中").length, "正在进行中的任务"],
          ["已确认排班", rows.filter((item) => ["已派单", "已接单"].includes(item.status)).length, "已确认服务人员"]
        ].map(([label, value, desc]) => (
          <div key={label} className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
            <div className="text-label-md text-on-surface-variant">{label}</div>
            <div className="mt-sm text-headline-md font-semibold">{value}</div>
            <div className="mt-xs text-label-sm text-outline">{desc}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
        <div className="border-b border-outline-variant bg-surface-container-low px-md py-sm">
          <h2 className="text-headline-md font-semibold">排班任务列表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant bg-surface-container-lowest">
              <tr>
                {["订单号", "服务人员", "服务项目", "预约时间", "地址", "状态", "操作"].map((head) => (
                  <th key={head} className="px-md py-sm text-label-md uppercase tracking-wider text-outline">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {rows.map((row) => {
                const providerOptions = state.providers.filter((p) => p.available && p.online && p.workStatus === "空闲");

                return (
                  <tr key={row.id} className="hover:bg-surface-container-low">
                    <td className="px-md py-md font-semibold">{row.id}</td>
                    <td className="px-md py-md">{row.provider}</td>
                    <td className="px-md py-md">{row.service}</td>
                    <td className="px-md py-md">{row.time}</td>
                    <td className="px-md py-md">
                      <div>{row.address}</div>
                      {row.serviceLocation ? (
                        <div className="mt-xs text-label-sm text-on-surface-variant">定位：{formatLocationSummary(row.serviceLocation, row.address || "")}</div>
                      ) : null}
                    </td>
                    <td className="px-md py-md">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-md py-md">
                      {row.status === "待派单" ? (
                        <div className="flex min-w-[240px] items-center gap-sm">
                          <select
                            value={selectedProviderByOrder[row.id] ?? providerOptions[0]?.id ?? ""}
                            onChange={(event) =>
                              setSelectedProviderByOrder((current) => ({
                                ...current,
                                [row.id]: event.target.value
                              }))
                            }
                            className="rounded-lg border border-outline-variant bg-white px-sm py-2 text-label-md outline-none"
                          >
                            {providerOptions.map((provider) => (
                              <option key={provider.id} value={provider.id}>
                                {provider.name}
                              </option>
                            ))}
                          </select>
                          <button
                            className="rounded-lg border border-outline-variant px-sm py-2 text-label-md text-primary hover:bg-surface-container"
                            onClick={() =>
                              dispatch({
                                type: "MANUAL_ASSIGN_ORDER",
                                orderId: row.id,
                                providerId: selectedProviderByOrder[row.id] ?? providerOptions[0]?.id
                              })
                            }
                          >
                            手动派单
                          </button>
                        </div>
                      ) : (
                        <span className="text-label-md text-on-surface-variant">已排班</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
