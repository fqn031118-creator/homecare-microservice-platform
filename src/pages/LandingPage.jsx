import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "../app-state";
import { Footer, Icon, MobileBottomNav, StatusBadge, TopBar, UserActions } from "../components";
import { categories } from "../data";

const categoryToService = {
  日常保洁: "svc-002",
  家电维修: "svc-003",
  月嫂育儿: "svc-002",
  除虫消杀: "svc-001",
  管道疏通: "svc-003",
  电路维修: "svc-004"
};

export function LandingPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();
  const myOrders = state.orders.filter((order) => order.customerName === state.auth.currentUser.name);
  const pendingPaymentOrder = myOrders.find((order) => order.status === "待支付");
  const nextServiceOrder = myOrders.find((order) => ["待派单", "已派单", "已接单", "服务中"].includes(order.status));
  const featuredProviders = state.providers.slice(0, 3);
  const highlightedOrders = myOrders.slice(0, 2);

  function goToBookingWithService(serviceId) {
    dispatch({ type: "PREPARE_BOOKING", payload: { serviceId } });
    navigate("/booking");
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopBar
        brandTo="/"
        navItems={[
          { to: "/", label: "服务市场" },
          { to: "/booking", label: "立即下单" },
          { to: "/orders", label: "我的订单" },
          { to: "/overview", label: "帮助中心" }
        ]}
        rightSlot={<UserActions />}
      />
      <main className="pb-24">
        <section className="hero-gradient overflow-hidden px-gutter pb-lg pt-xl">
          <div className="mx-auto grid max-w-container-max grid-cols-1 items-center gap-lg md:grid-cols-12">
            <div className="space-y-md md:col-span-7">
              <div className="inline-flex items-center gap-xs rounded-full bg-secondary-container px-sm py-base text-label-sm text-on-secondary-container">
                <Icon name="verified" className="text-[16px]" fill />
                认证专业人员 今日可约
              </div>
              <h1 className="text-display-lg font-bold leading-tight text-on-background max-md:text-headline-lg-mobile">
                上门服务不该只是能下单。
                <br />
                <span className="text-primary">更应该顺手、安心、可追踪。</span>
              </h1>
              <p className="max-w-2xl text-body-lg text-on-surface-variant">
                从选择服务、预约时段到支付派单、履约跟踪和售后处理，整条服务流程都可以在线完成并实时查看进展。
              </p>
              <div className="flex flex-wrap gap-sm pt-xs">
                <button
                  className="rounded-lg bg-primary px-lg py-sm text-headline-md font-semibold text-on-primary transition-all hover:bg-primary-container"
                  onClick={() => navigate("/booking")}
                >
                  立即预约
                </button>
                <button
                  className="rounded-lg border border-outline bg-surface px-lg py-sm text-headline-md font-semibold transition-all hover:bg-surface-variant"
                  onClick={() => navigate("/orders")}
                >
                  查看我的订单
                </button>
              </div>
            </div>

            <div className="space-y-sm md:col-span-5">
              <div className="rounded-3xl border border-outline-variant bg-white/80 p-md shadow-lg backdrop-blur">
                <p className="text-label-md font-semibold text-primary">最近服务动态</p>
                <div className="mt-md space-y-sm">
                  <div className="rounded-2xl bg-surface-container-low p-sm">
                    <div className="flex items-center justify-between gap-sm">
                      <div>
                        <p className="font-semibold">{nextServiceOrder?.serviceName || "还没有进行中的服务"}</p>
                        <p className="text-label-md text-on-surface-variant">
                          {nextServiceOrder ? `${nextServiceOrder.appointmentText} • ${nextServiceOrder.address}` : "现在预约后会在这里展示最新履约进展。"}
                        </p>
                      </div>
                      {nextServiceOrder ? <StatusBadge status={nextServiceOrder.status} /> : null}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-surface-container-low p-sm">
                    <div className="flex items-center gap-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                        <Icon name="support_agent" fill />
                      </div>
                      <div>
                        <p className="font-semibold">异常售后单独处理</p>
                        <p className="text-label-md text-on-surface-variant">退款、改约、投诉只在对应节点开放，避免用户被一堆表单干扰。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-sm">
                <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-md">
                  <p className="text-label-md text-on-surface-variant">累计订单</p>
                  <p className="mt-xs text-headline-md font-semibold">{myOrders.length} 笔</p>
                </div>
                <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-md">
                  <p className="text-label-md text-on-surface-variant">待处理</p>
                  <p className="mt-xs text-headline-md font-semibold">
                    {myOrders.filter((order) => !["已完成", "已评价", "已取消"].includes(order.status)).length} 笔
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto -mt-xs max-w-container-max px-gutter">
          <div className="grid grid-cols-1 gap-sm lg:grid-cols-2">
            <div className="rounded-2xl border border-outline-variant bg-surface p-md shadow-md">
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <h4 className="text-body-lg font-semibold">待支付订单</h4>
                  <p className="mt-xs text-label-md text-on-surface-variant">
                    {pendingPaymentOrder
                      ? `订单 ${pendingPaymentOrder.id} 已创建，建议先确认服务信息后再支付。`
                      : "当前没有待支付订单，预约完成后会先进入这里。"}
                  </p>
                </div>
                <div className="rounded-full bg-tertiary-fixed px-sm py-xs text-label-sm font-semibold text-on-tertiary-fixed-variant">
                  {pendingPaymentOrder ? "待处理" : "已结清"}
                </div>
              </div>
              <div className="mt-md flex flex-wrap gap-sm">
                <button
                  className="rounded-lg bg-primary px-md py-2 text-label-md font-semibold text-on-primary"
                  onClick={() => navigate("/orders")}
                >
                  查看订单详情
                </button>
                {pendingPaymentOrder ? (
                  <button
                    className="rounded-lg border border-outline px-md py-2 text-label-md text-primary"
                    onClick={() => navigate("/booking")}
                  >
                    修改预约信息
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant bg-surface p-md shadow-md">
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <h4 className="text-body-lg font-semibold">服务履约提醒</h4>
                  <p className="mt-xs text-label-md text-on-surface-variant">
                    {nextServiceOrder
                      ? `${nextServiceOrder.providerName || "平台"} 正在跟进 ${nextServiceOrder.serviceName}。`
                      : "支付后将进入派单，派单成功后会同步显示服务人员和最新状态。"}
                  </p>
                </div>
                {nextServiceOrder ? <StatusBadge status={nextServiceOrder.status} /> : null}
              </div>
              <div className="mt-md flex flex-wrap gap-sm">
                <button
                  className="rounded-lg bg-secondary px-md py-2 text-label-md font-semibold text-on-secondary"
                  onClick={() => navigate("/orders")}
                >
                  跟踪服务进度
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-container-max px-gutter pt-lg">
          <div className="mb-md flex items-end justify-between">
            <div>
              <h2 className="text-headline-lg font-semibold">从服务品类开始</h2>
              <p className="text-body-md text-on-surface-variant">每个入口都能直接带你进入预约流程，而不是只停留在展示层。</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-sm md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <button
                key={category.label}
                className="group rounded-xl border border-outline-variant bg-surface-container-low p-md text-center transition-all hover:border-primary hover:shadow-sm"
                onClick={() => goToBookingWithService(categoryToService[category.label] || "svc-001")}
              >
                <div className="mx-auto mb-sm flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed transition-transform group-hover:scale-110">
                  <Icon name={category.icon} fill />
                </div>
                <span className="text-label-md">{category.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-container-max px-gutter pt-xl">
          <div className="mb-md flex items-center justify-between">
            <div>
              <h2 className="text-headline-lg font-semibold">高分服务人员</h2>
              <p className="text-body-md text-on-surface-variant">优先展示口碑稳定、履约及时的服务人员，方便快速预约。</p>
            </div>
            <Link to="/overview" className="text-label-md font-semibold text-primary hover:underline">
              服务保障
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-md lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
                {featuredProviders.map((provider) => (
                  <div key={provider.id} className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface transition-all hover:shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      <img className="h-full w-full object-cover" src={provider.image} alt={provider.name} />
                      {provider.badge ? (
                        <div className="absolute right-sm top-sm rounded-full bg-secondary-container px-xs py-base text-label-sm font-semibold text-on-secondary-container">
                          {provider.badge}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-md">
                      <div className="mb-xs flex items-start justify-between">
                        <div>
                          <h3 className="text-headline-md font-semibold">{provider.name}</h3>
                          <p className="text-label-md text-on-surface-variant">
                            {provider.title} • {provider.subtitle}
                          </p>
                        </div>
                        <div className="flex items-center gap-xs text-tertiary">
                          <Icon name="star" className="text-[18px]" fill />
                          <span className="font-semibold">{provider.rating}</span>
                        </div>
                      </div>
                      <div className="mb-md flex flex-wrap gap-xs">
                        {provider.tags.map((tag) => (
                          <span key={tag} className="rounded bg-surface-container px-xs py-base text-label-sm text-on-surface-variant">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-md">
                        <span className="text-headline-md font-semibold text-primary">{provider.priceLabel}</span>
                        <button
                          className="rounded-lg bg-primary px-md py-2 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
                          onClick={() => {
                            const service = state.serviceCatalog.find((item) => item.providerIds.includes(provider.id));
                            dispatch({
                              type: "PREPARE_BOOKING",
                              payload: {
                                serviceId: service?.id,
                                providerId: provider.id
                              }
                            });
                            navigate("/booking");
                          }}
                        >
                          预约此人
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-md lg:col-span-4">
              <div className="rounded-3xl border border-outline-variant bg-surface-container-high p-md shadow-sm">
                <h2 className="mb-md text-headline-md font-semibold">我的预约概览</h2>
                <div className="space-y-sm">
                  {highlightedOrders.length ? (
                    highlightedOrders.map((order) => (
                      <button
                        key={order.id}
                        className="flex w-full items-center gap-md rounded-2xl border border-outline-variant bg-white p-sm text-left"
                        onClick={() => navigate("/orders")}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-variant text-primary">
                          <Icon name={order.category.includes("维修") ? "handyman" : "cleaning_services"} />
                        </div>
                        <div className="flex-1">
                          <p className="text-body-md font-semibold text-on-surface">{order.serviceName}</p>
                          <p className="text-label-md text-on-surface-variant">{order.appointmentShort}</p>
                        </div>
                        <Icon name="chevron_right" className="text-outline" />
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-outline-variant bg-white p-md text-label-md text-on-surface-variant">
                      当前还没有预约记录，完成首次下单后这里会自动展示。
                    </div>
                  )}
                </div>
                <Link
                  to="/orders"
                  className="mt-md block rounded-xl border border-outline-variant bg-white py-3 text-center text-label-md font-semibold text-primary transition-colors hover:bg-surface-container"
                >
                  管理所有订单
                </Link>
              </div>

              <div className="relative h-64 overflow-hidden rounded-3xl shadow-lg">
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBICfKYSWaVxwSU6o4_7FZjpQPCcxgrBstWhi6ZIZFS-aR8bYcSjjSDtSP3wLdbbfh3R4TU-llnrzkXZtjhZPyQSlaEUygie4cI7BLkI8nlbb6SXGZ63n-zgyZvM2Y0kU51CE1gG9QW4SHybWNr8eUeqpkb5eZLbBvqD8exb7RdoqLbhteAP4RJoLw7B0QdMW4GNcygWAUv8KKsKLQLswWfoW3SEH8BNlsEtuODKxtgbKDs8jho7s-R74cKkUowFyXNNT9HiGt9siYV"
                  alt="春季园艺"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 left-0 p-md text-white">
                  <p className="mb-1 text-label-md font-semibold text-secondary-container">产品化改造重点</p>
                  <h3 className="mb-md text-headline-md font-semibold">异常流程和履约状态被单独梳理，不再全部堆在一个页面里</h3>
                  <button
                    className="rounded-lg bg-white px-md py-2 text-label-md font-semibold text-on-surface transition-colors hover:bg-secondary-container"
                    onClick={() => navigate("/orders")}
                  >
                    去体验订单页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBottomNav
        items={[
          { to: "/", icon: "home", label: "首页" },
          { to: "/booking", icon: "add", label: "下单" },
          { to: "/orders", icon: "receipt_long", label: "订单" },
          { to: "/overview", icon: "person", label: "我的" }
        ]}
      />
    </div>
  );
}
