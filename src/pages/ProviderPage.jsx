import { useMemo } from "react";
import { useAppState } from "../app-state";
import { EmptyState, Footer, Icon, MobileBottomNav, StatusBadge, TopBar } from "../components";
import { formatLocationSummary } from "../location";

function getTaskActions(task, dispatch) {
  if (task.status === "已派单") {
    return [
      {
        label: "确认接单",
        className: "bg-secondary text-on-secondary",
        onClick: () => dispatch({ type: "ACCEPT_ORDER", orderId: task.id })
      }
    ];
  }

  if (task.status === "已接单") {
    return [
      {
        label: "联系客户",
        className: "bg-surface-container-high text-on-surface",
        onClick: () => dispatch({ type: "PUSH_TOAST", payload: { message: `已通知 ${task.customerName}，请保持电话畅通。`, tone: "info" } })
      },
      {
        label: "开始服务",
        className: "bg-primary text-on-primary",
        onClick: () => dispatch({ type: "START_SERVICE", orderId: task.id })
      }
    ];
  }

  if (task.status === "服务中") {
    return [
      {
        label: "上传结果",
        className: "bg-surface-container-high text-on-surface",
        onClick: () => dispatch({ type: "PUSH_TOAST", payload: { message: `订单 ${task.id} 的现场结果已记录到服务日志。`, tone: "info" } })
      },
      {
        label: "完成服务",
        className: "bg-primary text-on-primary",
        onClick: () => dispatch({ type: "COMPLETE_ORDER", orderId: task.id })
      }
    ];
  }

  return [];
}

export function ProviderPage() {
  const { state, dispatch } = useAppState();
  const online = state.providerConsole.online;
  const matchedProvider = state.providers.find((item) => item.name === state.auth.currentUser.name);
  const currentProviderId = matchedProvider?.id || state.providerConsole.currentProviderId;
  const currentProvider = state.providers.find((item) => item.id === currentProviderId);

  const assignedToMe = useMemo(
    () => state.orders.filter((order) => order.providerId === currentProviderId && ["已派单", "已接单", "服务中"].includes(order.status)),
    [currentProviderId, state.orders]
  );

  const openPool = useMemo(
    () => state.orders.filter((order) => order.status === "待派单"),
    [state.orders]
  );

  const inService = assignedToMe.filter((order) => ["已接单", "服务中"].includes(order.status));
  const completedTasks = state.orders.filter((order) => order.providerId === currentProviderId && ["已完成", "已评价"].includes(order.status));
  const todaySchedule = state.orders
    .filter((order) => order.providerId === currentProviderId && ["已派单", "已接单", "服务中", "已完成", "已评价"].includes(order.status))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopBar
        brandTo="/provider"
        navItems={[
          { to: "/provider", label: "工作台" },
          { to: "/overview", label: "我的" }
        ]}
        rightSlot={
          <>
            <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant">
              <Icon name="notifications" />
            </button>
            <button className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant">
              <Icon name="settings" />
            </button>
            <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant">
              <img
                className="h-full w-full object-cover"
                alt="服务人员头像"
                src={currentProvider?.image}
              />
            </div>
          </>
        }
      />

      <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-gutter px-margin-mobile py-md md:grid-cols-12 md:px-margin-desktop">
        <div className="flex flex-col gap-md md:col-span-3">
          <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-base h-24 w-24">
                <img className="h-full w-full rounded-full border-4 border-surface-container object-cover" alt="服务人员" src={currentProvider?.image} />
                <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-secondary">
                  <span className="h-3 w-3 rounded-full bg-white" />
                </div>
              </div>
              <h2 className="text-headline-md font-semibold">{currentProvider?.name}</h2>
              <p className="text-label-md text-outline">
                {currentProvider?.title} • {currentProvider?.rating} ★
              </p>
              <p className="mt-xs text-label-md text-on-surface-variant">{currentProvider?.area}</p>
            </div>

            <div className="mt-md space-y-4">
              <div className="rounded-2xl bg-surface-container-low p-sm">
                <p className="text-label-sm text-on-surface-variant">当前服务方向</p>
                <p className="mt-xs text-body-md font-semibold text-on-surface">{currentProvider?.serviceType || "待分配"}</p>
                <p className="mt-xs text-label-md text-on-surface-variant">{currentProvider?.bio}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-surface-container p-base">
                <span className="px-2 text-label-md">接单状态</span>
                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${online ? "bg-secondary" : "bg-outline"}`}
                  onClick={() => dispatch({ type: "TOGGLE_PROVIDER_ONLINE" })}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${online ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-sm">
                <div className="rounded-2xl bg-surface-container-low p-sm text-center">
                  <p className="text-label-sm text-on-surface-variant">派发给我</p>
                  <p className="mt-xs text-headline-md font-semibold">{assignedToMe.length}</p>
                </div>
                <div className="rounded-2xl bg-surface-container-low p-sm text-center">
                  <p className="text-label-sm text-on-surface-variant">抢单池</p>
                  <p className="mt-xs text-headline-md font-semibold">{openPool.length}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl bg-primary p-md text-on-primary shadow-lg">
            <div className="relative z-10">
              <span className="text-label-md opacity-80">本周收入</span>
              <div className="mt-base text-headline-lg font-semibold">¥17,450.00</div>
              <div className="mt-base flex items-center text-label-md font-semibold text-secondary-fixed">
                <Icon name="trending_up" className="text-sm" />
                <span className="ml-1">较上周增长 12%</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-10">
              <Icon name="account_balance_wallet" className="text-9xl" />
            </div>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface-container-low p-md shadow-sm">
            <h3 className="mb-3 text-label-md font-semibold uppercase text-on-surface-variant">工作提示</h3>
            <div className="space-y-3 text-label-md text-on-surface-variant">
              <p>派发给我：平台已经明确指派给当前服务人员，只能本人确认。</p>
              <p>抢单池：尚未指定人员的订单，可由在线人员主动接单。</p>
              <p>开始服务和完工操作现在都绑定到本人任务，避免跨角色误操作。</p>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-md md:col-span-6">
          <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <div className="mb-md flex items-center justify-between">
              <h2 className="text-headline-md font-semibold">今日行程</h2>
              <span className="text-label-md font-semibold text-primary">2026年06月01日</span>
            </div>
            <div className="space-y-sm">
              {todaySchedule.length ? (
                todaySchedule.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-outline-variant bg-surface-container-low p-md">
                    <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-label-md font-semibold text-primary">{task.dateKey}</div>
                        <h3 className="mt-1 text-body-lg font-semibold">{task.serviceName}</h3>
                        <p className="text-body-md text-on-surface-variant">{task.address}</p>
                        {task.serviceLocation ? (
                          <p className="mt-xs text-label-md text-on-surface-variant">定位：{formatLocationSummary(task.serviceLocation, task.address || "")}</p>
                        ) : null}
                        <p className="mt-xs text-label-md text-on-surface-variant">
                          联系人：{task.contactName || task.customerName} / {task.contactPhone || "待补充"}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon="calendar_month" title="今天还没有排班" description="收到新的服务安排后，这里会自动更新今日行程。" />
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <div className="mb-md flex items-center justify-between">
              <div>
                <h2 className="text-headline-md font-semibold">派发给我</h2>
                <p className="text-label-md text-on-surface-variant">这些任务已经明确分配给当前服务人员，不再允许别人直接接走。</p>
              </div>
              <span className="text-label-md text-on-surface-variant">{assignedToMe.length} 条</span>
            </div>
            <div className="space-y-sm">
              {assignedToMe.length ? (
                assignedToMe.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-outline-variant bg-surface-container-low p-md">
                    <div className="flex flex-col gap-sm">
                      <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="font-semibold">{task.serviceName}</div>
                          <div className="text-label-md text-on-surface-variant">
                            {task.address} • {task.customerName}
                          </div>
                          {task.serviceLocation ? (
                            <div className="mt-xs text-label-md text-on-surface-variant">定位：{formatLocationSummary(task.serviceLocation, task.address || "")}</div>
                          ) : null}
                        </div>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="flex flex-wrap gap-sm">
                        {getTaskActions(task, dispatch).map((action) => (
                          <button
                            key={action.label}
                            className={`rounded-lg px-md py-2 text-label-md font-semibold ${action.className}`}
                            onClick={action.onClick}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon="assignment_turned_in" title="当前没有派发给我的任务" description="有新的指派任务时，这里会展示需要你确认和执行的订单。" />
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
            <div className="mb-md flex items-center justify-between">
              <div>
                <h2 className="text-headline-md font-semibold">执行中任务</h2>
                <p className="text-label-md text-on-surface-variant">突出联系客户、开始服务、上传结果、完成服务这些更真实的履约动作。</p>
              </div>
              <span className="text-label-md text-on-surface-variant">{inService.length} 条</span>
            </div>
            <div className="space-y-sm">
              {inService.length ? (
                inService.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-outline-variant bg-white p-md">
                    <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-semibold">{task.serviceName}</div>
                        <div className="text-label-md text-on-surface-variant">
                          {task.customerName} • {task.address}
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon="construction" title="暂无执行中的任务" description="确认接单并开始服务后，这里会自动聚合进行中的工单。" />
              )}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-md md:col-span-3">
          <section className="rounded-3xl border border-primary-container bg-surface-container-high p-md shadow-md">
            <div className="mb-md flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
              </span>
              <h2 className="text-headline-md font-semibold text-on-surface">抢单池</h2>
            </div>
            <p className="mb-md text-label-md text-on-surface-variant">只有尚未派给指定人员的待派单订单才会出现在这里，角色边界更清晰。</p>
            <div className="space-y-4">
              {openPool.length ? (
                openPool.map((request) => (
                  <div key={request.id} className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                        <Icon name={request.category.includes("维修") ? "home_repair_service" : "cleaning_services"} />
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <div>
                      <h4 className="text-body-md font-semibold">{request.serviceName}</h4>
                      <p className="text-label-md text-outline">
                        预计 ¥{request.amount.toFixed(2)} • {request.address}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        className="flex-1 rounded-lg bg-secondary py-2 text-label-md font-semibold text-on-secondary transition-opacity hover:opacity-90"
                        onClick={() => dispatch({ type: "ACCEPT_ORDER", orderId: request.id })}
                      >
                        抢单并接单
                      </button>
                      <button
                        className="rounded-lg border border-outline-variant px-3 transition-colors hover:bg-surface-container-low"
                        onClick={() =>
                          dispatch({
                            type: "PUSH_TOAST",
                            payload: { message: `订单 ${request.id} 已加入稍后处理列表。`, tone: "info" }
                          })
                        }
                      >
                        <Icon name="schedule" className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon="mark_email_read" title="当前没有开放抢单" description="待派单订单一旦出现，会在这里实时刷新。" />
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-outline-variant bg-surface-container-low p-md shadow-sm">
            <div className="mb-md flex items-center justify-between">
              <h3 className="text-headline-md font-semibold">最近完工</h3>
              <span className="text-label-md text-on-surface-variant">{completedTasks.length} 单</span>
            </div>
            <div className="space-y-sm">
              {completedTasks.length ? (
                completedTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-outline-variant bg-white p-sm">
                    <div className="flex flex-col gap-xs">
                      <div className="font-semibold">{task.serviceName}</div>
                      <div className="text-label-md text-on-surface-variant">
                        {task.completedAt || "已完工"} • {task.customerName}
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState icon="history" title="暂无历史完工记录" description="完工后的订单会沉淀到这里，便于后续复盘和客户回访。" />
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer compact />
      <MobileBottomNav
        items={[
          { to: "/provider", icon: "assignment", label: "任务" },
          { to: "/provider", icon: "calendar_month", label: "排班" },
          { to: "/provider", icon: "account_balance_wallet", label: "收入" },
          { to: "/overview", icon: "person", label: "我的" }
        ]}
      />
    </div>
  );
}
