import { useMemo, useState } from "react";
import { useAppState } from "../app-state";
import { AdminShell } from "./admin-shared";

export function AdminCustomersPage() {
  const { state } = useAppState();
  const [keyword, setKeyword] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");

  const customers = useMemo(() => {
    const grouped = state.orders.reduce((acc, order) => {
      if (!acc[order.customerName]) {
        acc[order.customerName] = {
          name: order.customerName,
          phone: state.auth.currentUser.phone,
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: order.createdAt,
          recentServices: []
        };
      }

      acc[order.customerName].totalOrders += 1;
      acc[order.customerName].totalSpent += order.amount;
      acc[order.customerName].lastOrder =
        order.createdAt > acc[order.customerName].lastOrder ? order.createdAt : acc[order.customerName].lastOrder;
      acc[order.customerName].recentServices = [...new Set([...acc[order.customerName].recentServices, order.serviceName])];
      return acc;
    }, {});

    return Object.values(grouped).filter(
      (customer) => !keyword.trim() || customer.name.includes(keyword.trim()) || customer.phone.includes(keyword.trim())
    );
  }, [keyword, state.auth.currentUser.phone, state.orders]);

  const selectedCustomer = customers.find((customer) => customer.name === selectedCustomerName) ?? customers[0];

  return (
    <AdminShell title="客户列表" description="查看客户订单数、消费金额与最近下单情况。">
      <div className="mb-lg grid grid-cols-1 gap-gutter md:grid-cols-3">
        {[
          ["客户总数", customers.length, "当前活跃的下单客户"],
          ["管理身份", state.auth.currentUser.level, "当前登录角色的管理权限等级"],
          ["最高消费", `¥${Math.max(...customers.map((item) => item.totalSpent), 0).toFixed(2)}`, "单客户累计消费峰值"]
        ].map(([label, value, desc]) => (
          <div key={label} className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
            <div className="text-label-md text-on-surface-variant">{label}</div>
            <div className="mt-sm text-headline-md font-semibold">{value}</div>
            <div className="mt-xs text-label-sm text-outline">{desc}</div>
          </div>
        ))}
      </div>

      <div className="mb-md flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="w-full rounded-xl border border-outline-variant bg-surface px-md py-3 outline-none md:max-w-sm"
          placeholder="搜索客户姓名或手机号"
        />
        <select
          value={selectedCustomerName}
          onChange={(event) => setSelectedCustomerName(event.target.value)}
          className="rounded-xl border border-outline-variant bg-surface px-md py-3 outline-none md:w-72"
        >
          {customers.map((customer) => (
            <option key={customer.name} value={customer.name}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm lg:col-span-2">
          <div className="border-b border-outline-variant bg-surface-container-low px-md py-sm">
            <h2 className="text-headline-md font-semibold">客户明细</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-lowest">
                <tr>
                  {["客户姓名", "手机号", "订单数", "累计消费", "最近下单"].map((head) => (
                    <th key={head} className="px-md py-sm text-label-md uppercase tracking-wider text-outline">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {customers.map((customer) => (
                  <tr
                    key={customer.name}
                    className={`cursor-pointer hover:bg-surface-container-low ${selectedCustomer?.name === customer.name ? "bg-surface-container-low" : ""}`}
                    onClick={() => setSelectedCustomerName(customer.name)}
                  >
                    <td className="px-md py-md font-semibold">{customer.name}</td>
                    <td className="px-md py-md">{customer.phone}</td>
                    <td className="px-md py-md">{customer.totalOrders}</td>
                    <td className="px-md py-md text-primary">¥{customer.totalSpent.toFixed(2)}</td>
                    <td className="px-md py-md">{customer.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface p-md shadow-sm">
          <h2 className="mb-md text-headline-md font-semibold">客户详情</h2>
          {selectedCustomer ? (
            <div className="space-y-sm">
              <div className="text-body-lg font-semibold">{selectedCustomer.name}</div>
              <div className="text-label-md text-on-surface-variant">手机号：{selectedCustomer.phone}</div>
              <div className="text-label-md text-on-surface-variant">会员等级：{state.auth.currentUser.level}</div>
              <div className="border-t border-outline-variant pt-md text-body-md">
                <div className="flex justify-between">
                  <span>累计订单</span>
                  <span>{selectedCustomer.totalOrders}</span>
                </div>
                <div className="mt-xs flex justify-between">
                  <span>累计消费</span>
                  <span className="text-primary">¥{selectedCustomer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="mt-xs flex justify-between">
                  <span>最近下单</span>
                  <span>{selectedCustomer.lastOrder}</span>
                </div>
              </div>
              <div className="pt-sm">
                <div className="mb-xs text-label-md text-on-surface-variant">最近服务</div>
                <div className="flex flex-wrap gap-xs">
                  {selectedCustomer.recentServices.map((service) => (
                    <span key={service} className="rounded-full bg-surface-container-high px-sm py-xs text-label-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-label-md text-on-surface-variant">没有匹配到客户。</div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
