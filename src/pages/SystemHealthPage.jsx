import { useEffect, useState } from "react";
import { platformApi } from "../api";
import { AdminShell } from "./admin-shared";
export function SystemHealthPage() {
  const [result, setResult] = useState({ status: "检查中", checkedAt: "—", latency: "—" });
  useEffect(() => {
    let active = true;
    async function check() {
      const start = performance.now();
      try { await platformApi.snapshot(); if (active) setResult({ status: "核心接口与数据库查询成功", checkedAt: new Date().toLocaleString("zh-CN"), latency: `${Math.round(performance.now()-start)} ms` }); }
      catch { if (active) setResult({ status: "核心接口暂不可用或会话失效", checkedAt: new Date().toLocaleString("zh-CN"), latency: "—" }); }
    }
    check(); const timer = setInterval(check, 10000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return <AdminShell title="系统健康" description="当前浏览器对核心接口的实际检查结果。">
    <section className="rounded-xl border border-outline-variant p-lg space-y-md">
      <h2 className="text-headline-md font-semibold">{result.status}</h2>
      <p>检查时间：{result.checkedAt}</p><p>本次请求耗时：{result.latency}</p>
      <p>每10秒请求一次订单快照。耗时包含网络与服务端处理，不等同于压测延迟。</p>
      <p>独立网关、订单、人员、支付模块仍保留为扩展骨架；当前核心业务在同一服务中运行。</p>
    </section>
  </AdminShell>;
}
