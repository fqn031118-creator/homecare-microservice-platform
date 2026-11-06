import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../app-state";
import { EmptyState, Footer, Icon, MobileBottomNav, TopBar, UserActions } from "../components";
import { buildMapUrl, formatLocationMeta, formatLocationSummary, formatLocationTime } from "../location";

const dateOptions = Array.from({ length: 5 }, (_, i) => {
  const date = new Date(); date.setDate(date.getDate() + 1 + Math.floor(i / 2));
  const time = i % 2 ? "14:00" : "09:00";
  const dateKey = `${date.toLocaleDateString("sv-SE")} ${time}`;
  return { label: dateKey, appointmentText: dateKey, dateKey };
});

function buildAppointmentShort(value) {
  if (value.includes("明天")) {
    return value.split(" • ")[1] ? `明天${value.split(" • ")[1]}` : "明天可上门";
  }
  if (value.includes("周三")) {
    return value.includes("下午") ? "周三下午上门" : "周三上午上门";
  }
  if (value.includes("周四")) {
    return value.includes("上午") ? "周四上午上门" : "周四下午上门";
  }
  return "预约已提交";
}

function buildAutoAddress(location) {
  if (!location) {
    return "";
  }

  return "已锁定当前位置，请补充楼栋、单元和门牌号";
}

function buildAutoRemark(location) {
  if (!location) {
    return "";
  }

  return "已获取精确定位，服务人员可结合地图导航直接上门。";
}

export function BookingPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();
  const [serviceId, setServiceId] = useState(state.bookingDraft.selectedServiceId);
  const [providerMode, setProviderMode] = useState(state.bookingDraft.providerMode || "platform");
  const [providerId, setProviderId] = useState(state.bookingDraft.selectedProviderId);
  const [appointmentText, setAppointmentText] = useState(state.bookingDraft.appointmentText);
  const [dateKey, setDateKey] = useState(state.bookingDraft.dateKey);
  const [address, setAddress] = useState(state.bookingDraft.address);
  const [serviceLocation, setServiceLocation] = useState(state.bookingDraft.serviceLocation || null);
  const [contactName, setContactName] = useState(state.bookingDraft.contactName || state.auth.currentUser.name);
  const [contactPhone, setContactPhone] = useState(state.bookingDraft.contactPhone || state.auth.currentUser.phone);
  const [remark, setRemark] = useState(state.bookingDraft.remark);
  const [lastAutoAddress, setLastAutoAddress] = useState("");
  const [lastAutoRemark, setLastAutoRemark] = useState("");
  const [errors, setErrors] = useState({});
  const [isLocating, setIsLocating] = useState(false);

  const currentService = useMemo(
    () => state.serviceCatalog.find((item) => item.id === serviceId) || state.serviceCatalog[0],
    [serviceId, state.serviceCatalog]
  );

  const availableProviders = useMemo(
    () => state.providers.filter((provider) => currentService.providerIds.includes(provider.id)),
    [currentService, state.providers]
  );

  const recommendedProvider = availableProviders[0];
  const selectedProvider = availableProviders.find((provider) => provider.id === providerId) || recommendedProvider;
  const selectedSlot = dateOptions.find((option) => option.appointmentText === appointmentText);

  function syncService(nextServiceId) {
    const nextService = state.serviceCatalog.find((item) => item.id === nextServiceId) || state.serviceCatalog[0];
    const nextProviders = state.providers.filter((provider) => nextService.providerIds.includes(provider.id));
    setServiceId(nextService.id);
    setProviderId(nextProviders[0]?.id ?? "");
  }

  function handleSlotSelect(option) {
    setAppointmentText(option.appointmentText);
    setDateKey(option.dateKey);
  }

  function handleLocate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      dispatch({ type: "PUSH_TOAST", payload: { message: "当前设备不支持浏览器定位。", tone: "warning" } });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy || 0),
          locatedAt: Date.now(),
          source: "browser-geolocation"
        };

        const nextAddress = buildAutoAddress(nextLocation);
        const nextRemark = buildAutoRemark(nextLocation);

        setServiceLocation(nextLocation);
        setAddress((current) => {
          const currentValue = current.trim();
          const canReplace =
            !currentValue || currentValue === lastAutoAddress || currentValue === (state.bookingDraft.address || "").trim();
          return canReplace ? nextAddress : current;
        });
        setRemark((current) => {
          const currentValue = current.trim();
          const canReplace =
            !currentValue || currentValue === lastAutoRemark || currentValue === (state.bookingDraft.remark || "").trim();
          return canReplace ? nextRemark : current;
        });
        setContactName((current) => current.trim() || state.auth.currentUser.name);
        setContactPhone((current) => current.trim() || state.auth.currentUser.phone);
        setLastAutoAddress(nextAddress);
        setLastAutoRemark(nextRemark);
        setIsLocating(false);
        dispatch({
          type: "PUSH_TOAST",
          payload: { message: "已获取当前位置，并自动回填详细地址和上门备注。", tone: "success" }
        });
      },
      (error) => {
        setIsLocating(false);

        const messageMap = {
          1: "定位权限被拒绝，请允许浏览器访问位置信息。",
          2: "定位失败，请检查设备定位服务是否开启。",
          3: "定位超时，请稍后重试。"
        };

        dispatch({
          type: "PUSH_TOAST",
          payload: { message: messageMap[error.code] || "暂时无法获取当前位置，请稍后再试。", tone: "warning" }
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  async function handleSubmit() {
    const nextErrors = {};

    if (!serviceId) {
      nextErrors.serviceId = "请选择服务项目";
    }
    if (!appointmentText) {
      nextErrors.appointmentText = "请选择上门时段";
    }
    if (!address.trim() || address.trim().length < 6) {
      nextErrors.address = "请填写完整上门地址";
    }
    if (!contactName.trim()) {
      nextErrors.contactName = "请填写联系人";
    }
    if (!/^1\d{10}$/.test(contactPhone.trim())) {
      nextErrors.contactPhone = "请输入有效手机号";
    }
    if (providerMode === "recommended" && !providerId) {
      nextErrors.providerId = "请选择服务人员";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      dispatch({ type: "PUSH_TOAST", payload: { message: "下单信息还不完整，请补齐后再提交。", tone: "warning" } });
      return;
    }

    const saved = await dispatch({
      type: "CREATE_ORDER",
      payload: {
        serviceId,
        providerMode,
        providerId: providerMode === "platform" ? recommendedProvider?.id : providerId,
        appointmentText,
        appointmentShort: buildAppointmentShort(appointmentText),
        dateKey,
        address: address.trim(),
        serviceLocation,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        remark: remark.trim()
      }
    });
    if (saved) navigate("/orders");
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopBar
        brandTo="/"
        navItems={[
          { to: "/", label: "服务市场" },
          { to: "/booking", label: "立即下单" },
          { to: "/orders", label: "我的订单" }
        ]}
        rightSlot={<UserActions />}
      />
      <main className="mx-auto max-w-container-max px-margin-mobile py-lg pb-24 md:px-gutter">
        <div className="mb-lg flex flex-col gap-sm">
          <p className="text-label-md text-primary">预约流程</p>
          <h1 className="text-headline-lg font-semibold">确认服务信息并提交预约</h1>
          <p className="max-w-3xl text-body-md text-on-surface-variant">
            按真实平台的下单方式整理为 4 步：选服务、选时段、填上门信息、确认价格。支付后由平台安排服务人员。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-lg lg:grid-cols-12">
          <div className="space-y-md lg:col-span-8">
            <section className="rounded-3xl border border-outline-variant bg-surface p-lg shadow-sm">
              <div className="mb-md flex items-center gap-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">1</div>
                <div>
                  <h2 className="text-headline-md font-semibold">选择服务项目</h2>
                  <p className="text-label-md text-on-surface-variant">先确认需要解决的问题，再进入后续时段和人员匹配。</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
                {state.serviceCatalog.map((service) => (
                  <button
                    key={service.id}
                    className={`rounded-2xl border p-md text-left transition-all ${
                      service.id === serviceId
                        ? "border-primary bg-primary-fixed shadow-sm"
                        : "border-outline-variant bg-surface-container-low hover:border-primary/40"
                    }`}
                    onClick={() => syncService(service.id)}
                  >
                    <div className="flex items-start justify-between gap-sm">
                      <div>
                        <h3 className="text-body-lg font-semibold">{service.name}</h3>
                        <p className="mt-xs text-label-md text-on-surface-variant">{service.description}</p>
                      </div>
                      <span className="rounded-full bg-white px-sm py-xs text-label-sm font-semibold text-primary shadow-sm">
                        ¥{service.price}
                      </span>
                    </div>
                    <div className="mt-sm flex flex-wrap gap-xs">
                      {service.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-surface px-sm py-xs text-label-sm text-on-surface-variant">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-outline-variant bg-surface p-lg shadow-sm">
              <div className="mb-md flex items-center gap-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">2</div>
                <div>
                  <h2 className="text-headline-md font-semibold">选择上门时段</h2>
                  <p className="text-label-md text-on-surface-variant">为保证服务安排准确，平台提供标准可预约时段供你直接选择。</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
                {dateOptions.map((option) => (
                  <button
                    key={option.dateKey}
                    className={`rounded-2xl border p-md text-left transition-all ${
                      option.appointmentText === appointmentText
                        ? "border-secondary bg-secondary-container text-on-secondary-container"
                        : "border-outline-variant bg-surface-container-low hover:border-secondary/50"
                    }`}
                    onClick={() => handleSlotSelect(option)}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="mt-xs text-label-md opacity-80">{option.appointmentText}</div>
                  </button>
                ))}
              </div>
              {errors.appointmentText ? <p className="mt-sm text-label-sm text-error">{errors.appointmentText}</p> : null}
            </section>

            <section className="rounded-3xl border border-outline-variant bg-surface p-lg shadow-sm">
              <div className="mb-md flex items-center gap-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">3</div>
                <div>
                  <h2 className="text-headline-md font-semibold">上门信息</h2>
                  <p className="text-label-md text-on-surface-variant">补齐地址、联系人和上门说明，保证履约时不再反复沟通。</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-xs block text-label-md text-on-surface-variant">定位位置</label>
                  <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-md">
                    <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex items-center gap-xs text-body-md font-semibold">
                          <Icon name="my_location" className="text-[18px] text-primary" />
                          {serviceLocation ? "已获取真实定位" : "尚未获取定位"}
                        </div>
                        <p className="mt-xs text-label-md text-on-surface-variant">
                          {serviceLocation ? formatLocationSummary(serviceLocation, address) : "点击右侧按钮，使用浏览器定位当前上门位置。"}
                        </p>
                        {serviceLocation ? (
                          <div className="mt-xs space-y-1 text-label-sm text-on-surface-variant">
                            <p>{formatLocationMeta(serviceLocation)}</p>
                            <p>定位时间：{formatLocationTime(serviceLocation)}</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-sm">
                        <button
                          type="button"
                          className="rounded-xl bg-primary px-md py-2 text-label-md font-semibold text-on-primary disabled:opacity-60"
                          onClick={handleLocate}
                          disabled={isLocating}
                        >
                          {isLocating ? "定位中..." : serviceLocation ? "重新定位" : "使用当前位置"}
                        </button>
                        {serviceLocation ? (
                          <>
                            <a
                              className="rounded-xl border border-outline-variant px-md py-2 text-label-md text-primary"
                              href={buildMapUrl(serviceLocation, address || "上门位置")}
                              target="_blank"
                              rel="noreferrer"
                            >
                              地图查看
                            </a>
                            <button
                              type="button"
                              className="rounded-xl border border-outline-variant px-md py-2 text-label-md text-on-surface-variant"
                              onClick={() => {
                                setServiceLocation(null);
                                setAddress((current) => (current.trim() === lastAutoAddress ? "" : current));
                                setRemark((current) => (current.trim() === lastAutoRemark ? "" : current));
                                setLastAutoAddress("");
                                setLastAutoRemark("");
                              }}
                            >
                              清除定位
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-xs block text-label-md text-on-surface-variant">详细门牌地址</label>
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                      errors.address ? "border-error" : "border-outline-variant"
                    }`}
                    placeholder="例如：徐汇区漕溪北路 66 号 2 栋 1002 室"
                  />
                  <p className="mt-xs text-label-sm text-on-surface-variant">
                    定位负责锁定真实位置，详细地址继续补充楼栋、门牌和上门说明。
                  </p>
                  {errors.address ? <p className="mt-xs text-label-sm text-error">{errors.address}</p> : null}
                </div>
                <div>
                  <label className="mb-xs block text-label-md text-on-surface-variant">联系人</label>
                  <input
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                      errors.contactName ? "border-error" : "border-outline-variant"
                    }`}
                    placeholder="请输入联系人姓名"
                  />
                  {errors.contactName ? <p className="mt-xs text-label-sm text-error">{errors.contactName}</p> : null}
                </div>
                <div>
                  <label className="mb-xs block text-label-md text-on-surface-variant">联系电话</label>
                  <input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    className={`w-full rounded-xl border bg-surface-container-low px-md py-3 outline-none ${
                      errors.contactPhone ? "border-error" : "border-outline-variant"
                    }`}
                    placeholder="请输入 11 位手机号"
                  />
                  {errors.contactPhone ? <p className="mt-xs text-label-sm text-error">{errors.contactPhone}</p> : null}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-xs block text-label-md text-on-surface-variant">上门备注</label>
                  <textarea
                    value={remark}
                    onChange={(event) => setRemark(event.target.value)}
                    className="h-28 w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-3 outline-none"
                    placeholder="例如：门禁码、提前电话联系、家中有老人小孩、重点清洁区域"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-outline-variant bg-surface p-lg shadow-sm">
              <div className="mb-md flex items-center gap-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">4</div>
                <div>
                  <h2 className="text-headline-md font-semibold">服务人员安排</h2>
                  <p className="text-label-md text-on-surface-variant">服务人员将在支付后安排。</p>
                </div>
              </div>

              <p className="text-body-md text-on-surface-variant">支付后由管理员派单或在线服务人员接单，人员确认后可查看联系方式。</p>
            </section>
          </div>

          <div className="space-y-md lg:col-span-4">
            <section className="sticky top-24 rounded-3xl border border-outline-variant bg-surface p-lg shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-md font-semibold">订单确认</h2>
                <span className="rounded-full bg-primary-fixed px-sm py-xs text-label-sm font-semibold text-primary">
                  待支付
                </span>
              </div>

              <div className="mt-md rounded-2xl bg-surface-container-low p-md">
                <div className="text-body-lg font-semibold">{currentService.name}</div>
                <div className="mt-xs text-label-md text-on-surface-variant">{selectedSlot?.label || appointmentText}</div>
                <div className="mt-xs text-label-md text-on-surface-variant">{address || "请补充上门地址"}</div>
                {serviceLocation ? (
                  <div className="mt-xs flex items-center gap-xs text-label-md text-on-surface-variant">
                    <Icon name="my_location" className="text-[18px]" />
                    {formatLocationSummary(serviceLocation, address)}
                  </div>
                ) : null}
                <div className="mt-sm flex items-center gap-xs text-label-md text-on-surface-variant">
                  <Icon name="person" className="text-[18px]" />
                  {contactName || "待填写联系人"} / {contactPhone || "待填写手机号"}
                </div>
                <div className="mt-sm flex items-center gap-xs text-label-md text-on-surface-variant">
                  <Icon name="badge" className="text-[18px]" />
                  平台待分配
                </div>
              </div>

              <div className="mt-md space-y-sm border-t border-outline-variant pt-md text-body-md">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">服务小计</span>
                  <span>¥{currentService.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">平台服务费</span>
                  <span>¥15.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">支付方式</span>
                  <span>模拟支付（不扣款）</span>
                </div>
                <div className="flex items-center justify-between border-t border-outline-variant pt-sm text-headline-md font-semibold">
                  <span>合计</span>
                  <span className="text-primary">¥{(currentService.price + 15).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-md rounded-2xl bg-primary-fixed p-sm text-label-md text-on-primary-fixed-variant">
                提交后会先生成订单并进入待支付，支付完成后再进入派单流程，避免首页直接一键扣款的不自然体验。
              </div>

              <div className="mt-md flex flex-col gap-sm">
                <button
                  className="rounded-xl bg-primary px-lg py-3 text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90"
                  onClick={handleSubmit}
                >
                  提交预约订单
                </button>
                <button
                  className="rounded-xl border border-outline px-lg py-3 text-label-md text-primary"
                  onClick={() => navigate("/")}
                >
                  返回服务市场
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer compact />
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
