import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPlatformApi } from "../api";
import { useAppState } from "../app-state";
import { EmptyState, Footer, Icon, MobileBottomNav, StatusBadge, TopBar, UserActions } from "../components";
import { formatLocationSummary } from "../location";

function getLifecycleMessage(order) {
  switch (order?.status) {
    case "待支付":
      return "订单已创建，建议先核对服务信息后再完成支付。";
    case "待派单":
      return "支付已完成，等待管理员派单或服务人员接单。";
    case "已派单":
      return `已派给 ${order.providerName || "服务人员"}，等待对方确认接单。`;
    case "已接单":
      return `${order.providerName || "服务人员"} 已接单，正在准备上门。`;
    case "服务中":
      return "服务人员已到场并开始执行服务，完工后可查看结果并评价。";
    case "已完成":
      return "服务已经结束，如果对结果满意可以直接评价，如有问题可申请售后。";
    case "已评价":
      return "本单已闭环完成，后续仍可查看历史服务与售后记录。";
    case "已取消":
      return `订单已取消${order.cancellationReason ? `：${order.cancellationReason}` : ""}`;
    default:
      return "请查看订单详情获取最新状态。";
  }
}

function buildDateKey(value, fallback) {
  const match = value.match(/(\d{4})年(\d{2})月(\d{2})日.*?(\d{1,2}:\d{2})/);
  if (!match) {
    return fallback;
  }
  return `${match[1]}-${match[2]}-${match[3]} ${match[4]}`;
}

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();
  const api = useMemo(() => createPlatformApi(dispatch), [dispatch]);
  const myOrders = useMemo(
    () => state.orders.filter((order) => String(order.customerId) === String(state.auth.currentUser.id)),
    [state.auth.currentUser.id, state.orders]
  );
  const [selectedOrderId, setSelectedOrderId] = useState(myOrders[0]?.id ?? null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [activePanel, setActivePanel] = useState("info");
  const [afterSalesTab, setAfterSalesTab] = useState("cancel");
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleText, setRescheduleText] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [complaintContent, setComplaintContent] = useState("");

  const trackedOrder = useMemo(
    () => myOrders.find((order) => order.id === selectedOrderId) || myOrders[0],
    [myOrders, selectedOrderId]
  );

  useEffect(() => {
    if (!myOrders.length) {
      setSelectedOrderId(null);
      return;
    }

    if (!trackedOrder) {
      setSelectedOrderId(myOrders[0].id);
    }
  }, [myOrders, trackedOrder]);

  useEffect(() => {
    setRating(trackedOrder?.rating || 0);
    setReview(trackedOrder?.review || "");
    setCancelReason(trackedOrder?.cancellationReason || "");
    setRescheduleText(trackedOrder?.appointmentText || "");
    setRefundReason(trackedOrder?.refundReason || "");
    setComplaintContent(trackedOrder?.complaintContent || "");
    setActiveAction("");
    setAfterSalesTab("cancel");
  }, [trackedOrder?.id, trackedOrder?.rating, trackedOrder?.review, trackedOrder?.cancellationReason, trackedOrder?.appointmentText, trackedOrder?.refundReason, trackedOrder?.complaintContent]);



  const statusMap = {
    待支付: 0,
    待派单: 1,
    已派单: 2,
    已接单: 2,
    服务中: 3,
    已完成: 4,
    已评价: 4,
    已取消: 4
  };
  const currentIndex = statusMap[trackedOrder?.status] ?? 0;
  const timelineSteps = [
    { title: "订单创建", time: trackedOrder?.createdAt || "—" },
    { title: "支付完成", time: trackedOrder?.paidAt || "待支付" },
    { title: "平台派单", time: trackedOrder?.assignedAt || "待派单" },
    { title: trackedOrder?.status === "已取消" ? "订单终止" : "服务履约", time: trackedOrder?.startedAt || trackedOrder?.cancelledAt || "等待开始" },
    { title: trackedOrder?.status === "已评价" ? "评价完成" : "服务闭环", time: trackedOrder?.completedAt || trackedOrder?.cancelledAt || "—" }
  ];

  const canCancel = ["待支付"].includes(trackedOrder?.status);
  const canReschedule = ["待支付", "待派单"].includes(trackedOrder?.status);
  const canRefund = ["已完成", "已评价", "服务中"].includes(trackedOrder?.status) && trackedOrder?.refundStatus !== "处理中";
  const canComplaint = ["已接单", "服务中", "已完成", "已评价"].includes(trackedOrder?.status) && trackedOrder?.complaintStatus !== "处理中";
  const canReview =
    ["已完成"].includes(trackedOrder?.status) &&
    trackedOrder?.refundStatus !== "处理中" &&
    trackedOrder?.complaintStatus !== "处理中";
  const hasAfterSalesRecord =
    trackedOrder?.refundStatus === "处理中" ||
    trackedOrder?.complaintStatus === "处理中" ||
    Boolean(trackedOrder?.refundReason) ||
    Boolean(trackedOrder?.complaintContent);
  const canOpenAfterSales =
    canCancel || canReschedule || canRefund || canComplaint || hasAfterSalesRecord || Boolean(activeAction);

  const serviceStateCards = [
    { label: "订单状态", value: trackedOrder?.status, badgeStatus: trackedOrder?.status },
    { label: "售后状态", value: trackedOrder?.refundStatus === "处理中" ? "退款处理中" : trackedOrder?.complaintStatus === "处理中" ? "投诉处理中" : "无进行中的售后", badgeStatus: trackedOrder?.refundStatus === "处理中" ? "退款处理中" : trackedOrder?.complaintStatus === "处理中" ? "投诉处理中" : null },
    { label: "服务人员", value: trackedOrder?.providerName || "待平台分配" },
    { label: "上门时段", value: trackedOrder?.appointmentText }
  ];

  useEffect(() => {
    if (activeAction) {
      setActivePanel("aftersales");
      return;
    }

    if (hasAfterSalesRecord) {
      setActivePanel("aftersales");
      return;
    }

    if (["已完成", "已评价"].includes(trackedOrder?.status)) {
      setActivePanel("review");
      return;
    }

    setActivePanel("info");
  }, [activeAction, hasAfterSalesRecord, trackedOrder?.id, trackedOrder?.status]);

  if (!myOrders.length) {
    return (
      <div className="min-h-screen bg-surface text-on-surface">
        <TopBar
          brand="PristineHome"
          navItems={[
            { to: "/", label: "首页" },
            { to: "/orders", label: "订单" },
            { to: "/booking", label: "下单" }
          ]}
          rightSlot={<UserActions />}
        />
        <main className="mx-auto max-w-container-max px-margin-mobile py-xl md:px-gutter">
          <EmptyState
            icon="receipt_long_off"
            title="你还没有自己的订单"
            description="暂时还没有订单记录，完成预约后会在这里查看订单进度。"
            action={
              <button
                className="rounded-xl bg-primary px-lg py-3 text-label-md font-semibold text-on-primary"
                onClick={() => navigate("/booking")}
              >
                去创建第一笔订单
              </button>
            }
          />
        </main>
        <Footer compact />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <TopBar
        brand="PristineHome"
        brandTo="/"
        navItems={[
          { to: "/", label: "首页" },
          { to: "/booking", label: "下单" },
          { to: "/orders", label: "订单" }
        ]}
        rightSlot={<UserActions />}
      />
      <main className="mx-auto max-w-container-max px-margin-mobile py-lg pb-32 md:px-gutter">
        <div className="mb-lg flex flex-col justify-between gap-md md:flex-row md:items-end">
          <div>
            <p className="text-label-md text-primary">我的订单中心</p>
            <h1 className="mt-xs text-headline-lg font-semibold">{trackedOrder?.serviceName}</h1>
            <p className="mt-xs max-w-2xl text-body-md text-on-surface-variant">{getLifecycleMessage(trackedOrder)}</p>
          </div>
          <div className="flex flex-wrap gap-sm">
            <button
              className="h-12 rounded-lg border border-outline px-md text-label-md text-primary transition-colors hover:bg-primary-fixed"
              onClick={() => navigate("/booking")}
            >
              再次预约
            </button>
            <button
              className="h-12 rounded-lg bg-primary px-md text-label-md text-on-primary transition-opacity hover:opacity-90"
              onClick={() => navigate("/overview")}
            >
              账户中心
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-lg xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-md xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <div className="mb-md flex items-center justify-between">
                <div>
                  <h2 className="text-headline-md font-semibold">我的订单</h2>
                  <p className="mt-xs text-label-md text-on-surface-variant">选择一笔订单查看完整进度</p>
                </div>
                <span className="rounded-full bg-surface-container-low px-sm py-xs text-label-sm text-on-surface-variant">
                  {myOrders.length} 笔
                </span>
              </div>
              <div className="space-y-sm">
                {myOrders.map((order) => (
                  <button
                    key={order.id}
                    className={`w-full rounded-2xl border p-md text-left transition-all ${
                      order.id === trackedOrder?.id
                        ? "border-primary bg-primary-fixed shadow-sm"
                        : "border-outline-variant bg-white hover:bg-surface-container-low"
                    }`}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <div className="flex items-start justify-between gap-sm">
                      <div className="min-w-0">
                        <div className="font-semibold">{order.serviceName}</div>
                        <div className="mt-xs text-label-md text-on-surface-variant">{order.appointmentShort}</div>
                        <div className="mt-xs truncate text-label-sm text-on-surface-variant">{order.id}</div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <h2 className="text-headline-md font-semibold">快捷操作</h2>
              <div className="mt-md flex flex-wrap gap-sm">
                {trackedOrder?.status === "待支付" ? (
                  <button
                    className="rounded-lg bg-primary px-md py-2 text-label-md font-semibold text-on-primary"
                    onClick={() => api.payOrder(trackedOrder.id)}
                  >
                    模拟支付
                  </button>
                ) : null}
                {canCancel ? (
                  <button
                    className={`rounded-lg px-md py-2 text-label-md ${activeAction === "cancel" ? "bg-error text-on-error" : "bg-surface-container-low text-on-surface"}`}
                    onClick={() => setActiveAction(activeAction === "cancel" ? "" : "cancel")}
                  >
                    取消订单
                  </button>
                ) : null}
                {canReschedule ? (
                  <button
                    className={`rounded-lg px-md py-2 text-label-md ${activeAction === "reschedule" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"}`}
                    onClick={() => setActiveAction(activeAction === "reschedule" ? "" : "reschedule")}
                  >
                    改约
                  </button>
                ) : null}
                {canRefund ? (
                  <button
                    className={`rounded-lg px-md py-2 text-label-md ${activeAction === "refund" ? "bg-tertiary text-white" : "bg-surface-container-low text-on-surface"}`}
                    onClick={() => setActiveAction(activeAction === "refund" ? "" : "refund")}
                  >
                    申请退款
                  </button>
                ) : null}
                {canComplaint ? (
                  <button
                    className={`rounded-lg px-md py-2 text-label-md ${activeAction === "complaint" ? "bg-primary-container text-on-primary-container" : "bg-surface-container-low text-on-surface"}`}
                    onClick={() => setActiveAction(activeAction === "complaint" ? "" : "complaint")}
                  >
                    发起投诉
                  </button>
                ) : null}
              </div>
              {!trackedOrder?.status || (!canCancel && !canReschedule && !canRefund && !canComplaint && trackedOrder?.status !== "待支付") ? (
                <p className="mt-sm text-label-md text-on-surface-variant">当前订单暂时没有可处理事项。</p>
              ) : null}
            </section>

            <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <h2 className="text-headline-md font-semibold">当前阶段</h2>
              <div className="mt-md space-y-sm">
                <button
                  className={`w-full rounded-2xl border px-md py-sm text-left transition-colors ${
                    activePanel === "info"
                      ? "border-primary bg-primary-fixed text-primary"
                      : "border-outline-variant bg-white text-on-surface"
                  }`}
                  onClick={() => {
                    setActivePanel("info");
                    setActiveAction("");
                  }}
                >
                  <div className="font-semibold">1. 订单信息</div>
                  <div className="mt-xs text-label-md text-on-surface-variant">查看履约进度、服务资料与费用信息</div>
                </button>

                <button
                  disabled={!canOpenAfterSales}
                  className={`w-full rounded-2xl border px-md py-sm text-left transition-colors ${
                    !canOpenAfterSales
                      ? "cursor-not-allowed border-outline-variant bg-surface-container-low text-outline"
                      : activePanel === "aftersales"
                        ? "border-primary bg-primary-fixed text-primary"
                        : "border-outline-variant bg-white text-on-surface"
                  }`}
                  onClick={() => {
                    if (canOpenAfterSales) {
                      setActivePanel("aftersales");
                    }
                  }}
                >
                  <div className="font-semibold">2. 售后服务</div>
                  <div className="mt-xs text-label-md text-on-surface-variant">
                    {canOpenAfterSales ? "在这里处理改约、退款、投诉等售后事项" : "订单进入相应阶段后可使用"}
                  </div>
                </button>

                <button
                  disabled={!["已完成", "已评价"].includes(trackedOrder?.status)}
                  className={`w-full rounded-2xl border px-md py-sm text-left transition-colors ${
                    !["已完成", "已评价"].includes(trackedOrder?.status)
                      ? "cursor-not-allowed border-outline-variant bg-surface-container-low text-outline"
                      : activePanel === "review"
                        ? "border-primary bg-primary-fixed text-primary"
                        : "border-outline-variant bg-white text-on-surface"
                  }`}
                  onClick={() => {
                    if (["已完成", "已评价"].includes(trackedOrder?.status)) {
                      setActivePanel("review");
                    }
                  }}
                >
                  <div className="font-semibold">3. 服务评价</div>
                  <div className="mt-xs text-label-md text-on-surface-variant">
                    {["已完成", "已评价"].includes(trackedOrder?.status) ? "服务完成后可提交评价" : "服务完成后开放"}
                  </div>
                </button>
              </div>
            </section>
          </aside>

          <div className="space-y-md">
            <section className="overflow-hidden rounded-[32px] border border-outline-variant bg-surface-container-lowest shadow-sm">
              <div className="bg-[linear-gradient(135deg,rgba(0,119,206,0.10),rgba(152,249,148,0.18))] p-lg">
                <div className="flex flex-col gap-md xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-sm">
                      <span className="rounded-full bg-white/80 px-sm py-xs text-label-sm font-semibold text-primary shadow-sm">
                        订单 {trackedOrder?.id}
                      </span>
                      <StatusBadge status={trackedOrder?.status} />
                    </div>
                    <h2 className="mt-md text-headline-lg font-semibold">{trackedOrder?.serviceName}</h2>
                    <p className="mt-sm max-w-3xl text-body-md leading-7 text-on-surface-variant">{getLifecycleMessage(trackedOrder)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-sm xl:min-w-[320px]">
                    <div className="rounded-2xl bg-white/80 p-md shadow-sm">
                      <p className="text-label-sm text-on-surface-variant">服务人员</p>
                      <p className="mt-xs text-body-lg font-semibold text-on-surface">{trackedOrder?.providerName || "待平台分配"}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-md shadow-sm">
                      <p className="text-label-sm text-on-surface-variant">上门时间</p>
                      <p className="mt-xs text-body-lg font-semibold text-on-surface">{trackedOrder?.appointmentShort}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm md:p-lg">
              <div className="mb-lg flex items-center justify-between">
                <div>
                  <h2 className="text-headline-md font-semibold">履约进度</h2>
                  <p className="mt-xs text-label-md text-on-surface-variant">从创建、支付、派单到履约闭环的完整状态追踪</p>
                </div>
                <StatusBadge status={trackedOrder?.status} />
              </div>
              <div className="relative">
                <div className="absolute bottom-[20px] left-[20px] top-[20px] w-[2px] bg-surface-variant lg:hidden" />
                <div className="absolute left-[24px] right-[24px] top-[24px] hidden h-[2px] bg-surface-variant lg:block" />
                <div className="relative flex flex-col gap-lg lg:flex-row lg:justify-between lg:gap-md">
                  {timelineSteps.map((step, index) => {
                    const complete = index < currentIndex || (index === 4 && ["已完成", "已评价", "已取消"].includes(trackedOrder?.status));
                    const active = index === currentIndex && !["已完成", "已评价", "已取消"].includes(trackedOrder?.status);
                    return (
                      <div key={step.title} className="flex items-start gap-md lg:w-1/5 lg:flex-col lg:items-center lg:text-center">
                        <div
                          className={[
                            "z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-surface shadow-sm",
                            complete ? "bg-secondary text-on-secondary" : active ? "animate-pulse bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant"
                          ].join(" ")}
                        >
                          <Icon name={complete ? "check_circle" : active ? "schedule" : "radio_button_unchecked"} className="text-[22px]" fill={complete} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-label-md ${complete ? "text-secondary" : active ? "font-semibold text-primary" : "text-outline"}`}>{step.title}</p>
                          <p className="mt-1 break-words text-label-sm text-on-surface-variant">{step.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {activePanel === "aftersales" ? (
              <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
                <div className="mb-md">
                  <h3 className="text-headline-md font-semibold">售后服务</h3>
                  <p className="mt-xs text-label-md text-on-surface-variant">如需调整预约或反馈问题，可在这里提交处理申请。</p>
                </div>

                <div className="mb-md grid grid-cols-1 gap-sm md:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      key: "cancel",
                      title: "取消订单",
                      desc: canCancel ? "适用于履约尚未开始时" : "当前订单不可取消",
                      enabled: canCancel
                    },
                    {
                      key: "reschedule",
                      title: "申请改约",
                      desc: canReschedule ? "重新选择新的上门时间" : "当前订单不可改约",
                      enabled: canReschedule
                    },
                    {
                      key: "refund",
                      title: "退款/售后",
                      desc: canRefund ? "服务完成后可提交售后申请" : "当前订单暂不支持退款",
                      enabled: canRefund
                    },
                    {
                      key: "complaint",
                      title: "提交投诉",
                      desc: canComplaint ? "如需客服协助可在这里反馈" : "当前订单暂不支持投诉",
                      enabled: canComplaint
                    }
                  ].map((item) => (
                    <button
                      key={item.key}
                      disabled={!item.enabled}
                      className={`rounded-2xl border p-md text-left transition-colors ${
                        !item.enabled
                          ? "cursor-not-allowed border-outline-variant bg-surface-container-low text-outline"
                          : afterSalesTab === item.key
                            ? "border-primary bg-primary-fixed text-primary"
                            : "border-outline-variant bg-white text-on-surface"
                      }`}
                      onClick={() => setAfterSalesTab(item.key)}
                    >
                      <div className="font-semibold">{item.title}</div>
                      <div className="mt-xs text-label-md text-on-surface-variant">{item.desc}</div>
                    </button>
                  ))}
                </div>

                {afterSalesTab === "cancel" ? (
                  <div className="rounded-2xl bg-surface-container-low p-md">
                    <div className="font-semibold">取消订单</div>
                    <p className="mt-xs text-label-md text-on-surface-variant">仅支持在支付前或平台尚未开始履约时取消。</p>
                    <textarea
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      className="mt-sm h-24 w-full rounded-xl border border-outline-variant bg-surface p-sm outline-none"
                      placeholder="请简要说明取消原因"
                    />
                    <button
                      className="mt-sm rounded-lg bg-error px-md py-2 text-label-md font-semibold text-on-error"
                      onClick={() => api.cancelOrder(trackedOrder.id, cancelReason)}
                      disabled={!canCancel}
                    >
                      确认取消订单
                    </button>
                  </div>
                ) : null}

                {afterSalesTab === "reschedule" ? (
                  <div className="rounded-2xl bg-surface-container-low p-md">
                    <div className="font-semibold">申请改约</div>
                    <p className="mt-xs text-label-md text-on-surface-variant">建议重新选择明确时段，改约成功后平台会重新协调排班。</p>
                    <input
                      value={rescheduleText}
                      onChange={(event) => setRescheduleText(event.target.value)}
                      className="mt-sm w-full rounded-xl border border-outline-variant bg-surface p-sm outline-none"
                      placeholder="例如：2026年06月05日 周五 • 上午 09:30"
                    />
                    <button
                      className="mt-sm rounded-lg bg-primary px-md py-2 text-label-md font-semibold text-on-primary"
                      onClick={() => api.rescheduleOrder(trackedOrder.id, rescheduleText, buildDateKey(rescheduleText, trackedOrder?.dateKey))}
                      disabled={!canReschedule}
                    >
                      提交改约申请
                    </button>
                  </div>
                ) : null}

                {afterSalesTab === "refund" ? (
                  <div className="rounded-2xl bg-surface-container-low p-md">
                    <div className="font-semibold">退款/售后</div>
                    <p className="mt-xs text-label-md text-on-surface-variant">请填写需要售后处理的原因，我们会尽快跟进。</p>
                    <textarea
                      value={refundReason}
                      onChange={(event) => setRefundReason(event.target.value)}
                      className="mt-sm h-24 w-full rounded-xl border border-outline-variant bg-surface p-sm outline-none"
                      placeholder="请描述退款或售后原因"
                    />
                    <button
                      className="mt-sm rounded-lg bg-tertiary px-md py-2 text-label-md font-semibold text-white"
                      onClick={() => api.requestRefund(trackedOrder.id, refundReason)}
                      disabled={!canRefund}
                    >
                      提交售后申请
                    </button>
                  </div>
                ) : null}

                {afterSalesTab === "complaint" ? (
                  <div className="rounded-2xl bg-surface-container-low p-md">
                    <div className="font-semibold">提交投诉</div>
                    <p className="mt-xs text-label-md text-on-surface-variant">投诉信息会进入平台客服流程，和评价区分开展示。</p>
                    <textarea
                      value={complaintContent}
                      onChange={(event) => setComplaintContent(event.target.value)}
                      className="mt-sm h-24 w-full rounded-xl border border-outline-variant bg-surface p-sm outline-none"
                      placeholder="请填写问题经过和诉求"
                    />
                    <button
                      className="mt-sm rounded-lg bg-primary-container px-md py-2 text-label-md font-semibold text-on-primary-container"
                      onClick={() => api.submitComplaint(trackedOrder.id, complaintContent)}
                      disabled={!canComplaint}
                    >
                      提交投诉
                    </button>
                  </div>
                ) : null}

                {hasAfterSalesRecord ? (
                  <section className="mt-md rounded-2xl border border-outline-variant bg-white p-md">
                    <h4 className="text-body-lg font-semibold">售后记录</h4>
                    <div className="mt-sm space-y-sm text-label-md">
                      <div className="rounded-2xl bg-surface-container-low p-sm">
                        <div className="flex items-center justify-between gap-md">
                          <span className="text-on-surface-variant">退款申请</span>
                          <span>{trackedOrder?.refundStatus}</span>
                        </div>
                        {trackedOrder?.refundReason ? <p className="mt-xs text-on-surface-variant">{trackedOrder.refundReason}</p> : null}
                      </div>
                      <div className="rounded-2xl bg-surface-container-low p-sm">
                        <div className="flex items-center justify-between gap-md">
                          <span className="text-on-surface-variant">投诉处理</span>
                          <span>{trackedOrder?.complaintStatus}</span>
                        </div>
                        {trackedOrder?.complaintContent ? <p className="mt-xs text-on-surface-variant">{trackedOrder.complaintContent}</p> : null}
                      </div>
                    </div>
                  </section>
                ) : null}
              </section>
            ) : null}

            {activePanel === "info" ? (
              <section className="grid grid-cols-1 gap-md 2xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
                <div className="mb-md">
                  <h3 className="text-headline-md font-semibold">订单详情</h3>
                  <p className="mt-xs text-label-md text-on-surface-variant">查看当前订单的预约信息、服务地址和联系人资料。</p>
                </div>
                <div className="space-y-sm">
                  {[
                    ["订单编号", trackedOrder?.id],
                    ["预约时间", trackedOrder?.appointmentText],
                    ["服务地址", trackedOrder?.address],
                    ["定位信息", trackedOrder?.serviceLocation ? formatLocationSummary(trackedOrder.serviceLocation, trackedOrder.address || "") : "未定位"],
                    ["联系人", trackedOrder?.contactName || trackedOrder?.customerName],
                    ["联系电话", trackedOrder?.contactPhone || state.auth.currentUser.phone],
                    ["服务人员", trackedOrder?.providerName || "平台待分配"],
                    ["上门备注", trackedOrder?.remark || "无"]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-surface-container-low px-md py-sm">
                      <div className="flex items-start gap-md">
                        <p className="w-24 shrink-0 whitespace-nowrap text-label-md font-medium text-on-surface-variant">
                          {label}
                        </p>
                        <p className="min-w-0 flex-1 break-words text-body-md leading-7 text-on-surface">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-md">
                <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
                  <div className="mb-md">
                    <h3 className="text-headline-md font-semibold">状态与费用</h3>
                    <p className="mt-xs text-label-md text-on-surface-variant">查看当前订单状态与本次服务费用明细。</p>
                  </div>
                  <div className="space-y-sm">
                    {serviceStateCards.map((item) => (
                      <div key={item.label} className="rounded-2xl bg-surface-container-low px-md py-sm">
                        <p className="text-label-sm font-medium text-on-surface-variant">{item.label}</p>
                        <div className="mt-2">
                          {item.badgeStatus ? (
                            <StatusBadge status={item.badgeStatus} />
                          ) : (
                            <p className="break-words text-body-md leading-7 text-on-surface">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="my-md h-px bg-outline-variant" />
                  <div className="space-y-sm">
                    <div className="flex items-center justify-between gap-md rounded-2xl bg-surface-container-low px-md py-sm">
                      <span className="text-body-md text-on-surface-variant">服务小计</span>
                      <span className="text-body-lg font-semibold text-on-surface">¥{trackedOrder?.baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-md rounded-2xl bg-surface-container-low px-md py-sm">
                      <span className="text-body-md text-on-surface-variant">平台服务费</span>
                      <span className="text-body-lg font-semibold text-on-surface">¥{trackedOrder?.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="rounded-2xl bg-primary-fixed px-md py-md">
                      <div className="flex items-center justify-between gap-md">
                        <span className="text-body-lg font-semibold text-primary">订单总额</span>
                        <span className="text-headline-md font-bold text-primary">¥{trackedOrder?.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
                  <h3 className="text-headline-md font-semibold">售后记录</h3>
                  <div className="mt-md space-y-sm text-label-md">
                    <div className="rounded-2xl bg-surface-container-low p-sm">
                      <div className="flex items-center justify-between gap-md">
                        <span className="text-on-surface-variant">退款申请</span>
                        <span>{trackedOrder?.refundStatus}</span>
                      </div>
                      {trackedOrder?.refundReason ? <p className="mt-xs text-on-surface-variant">{trackedOrder.refundReason}</p> : null}
                    </div>
                    <div className="rounded-2xl bg-surface-container-low p-sm">
                      <div className="flex items-center justify-between gap-md">
                        <span className="text-on-surface-variant">投诉处理</span>
                        <span>{trackedOrder?.complaintStatus}</span>
                      </div>
                      {trackedOrder?.complaintContent ? <p className="mt-xs text-on-surface-variant">{trackedOrder.complaintContent}</p> : null}
                    </div>
                  </div>
                </section>
              </div>
            </section>
            ) : null}

            {activePanel === "review" ? (
              <section className="rounded-3xl border border-outline-variant bg-surface-container-high p-md shadow-sm">
                <h2 className="mb-xs text-headline-md font-semibold">服务评价</h2>
                <p className="mb-md text-label-md text-on-surface-variant">欢迎对本次服务进行评分并留下反馈。</p>

                <div className={`${canReview ? "" : "pointer-events-none opacity-45 grayscale-[0.2]"} transition-opacity`}>
                  <div className="mb-md flex flex-col items-center">
                    <div className="mb-sm flex gap-xs">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <button key={index} onClick={() => setRating(index + 1)}>
                          <Icon
                            name="star"
                            className={`text-[32px] ${index < rating ? "text-tertiary" : "text-outline"}`}
                            fill={index < rating}
                          />
                        </button>
                      ))}
                    </div>
                    <p className={`text-label-md ${rating ? "font-semibold text-tertiary" : "text-on-surface-variant"}`}>
                      {rating ? ["非常差", "较差", "一般", "很好", "非常棒！"][rating - 1] : "为本次服务打分"}
                    </p>
                  </div>
                  <textarea
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    className="h-32 w-full rounded-xl border border-outline-variant bg-surface p-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="例如：服务人员是否准时、处理是否专业、沟通是否顺畅"
                  />
                  {canReview ? (
                    <button
                      className="mt-md flex w-full items-center justify-center gap-sm rounded-lg bg-primary py-3 text-label-md text-on-primary transition-opacity hover:opacity-90"
                      onClick={() => api.reviewOrder(trackedOrder.id, rating, review)}
                    >
                      提交评价
                    </button>
                  ) : (
                    <div className="mt-md rounded-lg bg-surface-container-low py-3 text-center text-label-md text-on-surface-variant">
                      {trackedOrder?.status === "已评价" ? "评价已提交" : "评价入口暂未开放"}
                    </div>
                  )}
                </div>

                <div
                  className={`mt-md flex items-start gap-sm rounded-lg border p-sm ${
                    canReview ? "border-secondary-container bg-secondary-container text-on-secondary-container" : "border-outline-variant bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  <Icon name={canReview ? "check_circle" : "info"} className={canReview ? "text-secondary" : "text-primary"} />
                  <p className="text-label-sm">
                    {canReview
                      ? "当前订单已满足评价条件，可以直接填写评分和文字反馈。"
                      : trackedOrder?.refundStatus === "处理中" || trackedOrder?.complaintStatus === "处理中"
                        ? "售后处理中，评价入口暂时关闭。"
                        : trackedOrder?.status === "已评价" ? "感谢反馈，本单评价已保存。" : "服务完成后可进行评价。"}
                  </p>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </main>
      <MobileBottomNav
        items={[
          { to: "/", icon: "home", label: "首页" },
          { to: "/booking", icon: "add", label: "下单" },
          { to: "/orders", icon: "receipt_long", label: "订单" },
          { to: "/overview", icon: "person", label: "我的" }
        ]}
      />
      <Footer compact />
    </div>
  );
}
