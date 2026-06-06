import { useEffect, useRef, useState } from "react";
import { Footer, Icon, MobileBottomNav, TopBar, UserActions, roleHomeMap } from "../components";
import { useAppState } from "../app-state";
import { authApi } from "../api";

const avatarPresets = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDCt9qx6hiIJv4zO1hAm9IXqZJUfqjDgq6X_Rr4pTplewpNKSEWZcpZGCPxdZyMM2o1Lhbo9r0Nzww8vQrySFTPSoCB-SRlCUd_zTTGYwLE5vQEIsv1VbelarbyfrKxXQuQSjFPAaTU9ljYGnAnqayplwR5dwioKsw_ylYqdnbA3D4ArN3CHXDwWkSAKlB28mrgZK1nzDcgRr0l-167QiCwj4Cd4TXI4_5EjV2G8JkDKOwqLyCxy-FBSX2W-qkwNOnobAs_mzscJyl8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCZAJXYofLyWok8gqpVhTZsFzn9HNdZbxVzUHQjjtelIQGuS_Nkok6BoTmJg-kZoZbAapRv6v7gc8twjXbe-D4XiF2e24xKyH0GIpvuuUohdwax1c3YW_3ctU92_lwRoDrGBqiSWf68pfmoJq430AyhehKcyx6X3eu0MXGih_QkLuO9NToESZSkHPJORCif6xMU1EY7cYSai788_rW4ym-tMzI46cp9lxQVAUM037r4NXYOk-Fxt9SwlbsOGdeiaT9v8fYDbboBRT_T",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBkLFfhWjfVYN7JF4tackJTmdvYD9590rKuof5cMawPTn_wYCnr-u9oGaxte1rw1uydZidnRHuSMEYjRNkDNDeE2RPvwkWuRdMDCSpNaZp3YtVHI6iLm95Ec0uAjrN9UKz2vKcZ2qpFk8AzZzglZpsvNmSi-a2n1QZIJpPbW1k53_b2omyy1UM4ARzzviaU1Qb7RsRm3Ete_YSoZlEXO6vt8-haUPUM8c9hDBzWo0VAkqJaRYrXkWYxNrvHfqaRCMphp2uy_MbhKs5g",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
];

const roleContent = {
  customer: {
    navItems: [
      { to: "/", label: "首页" },
      { to: "/booking", label: "下单" },
      { to: "/orders", label: "订单" },
      { to: "/overview", label: "我的" }
    ],
    mobileItems: [
      { to: "/", icon: "home", label: "首页" },
      { to: "/orders", icon: "receipt_long", label: "订单" },
      { to: "/booking", icon: "add", label: "下单" },
      { to: "/overview", icon: "person", label: "我的" }
    ],
    heroEyebrow: "账户中心",
    heroTitle: "个人资料与服务支持",
    heroDescription: "在这里查看账户信息、常用服务说明、售后处理方式和服务保障内容。",
    summaryCards: [
      ["当前身份", "消费者", "可浏览服务、预约下单并查看订单进度"],
      ["会员等级", "尊享会员", "支持常用地址、订单记录与评价管理"],
      ["服务支持", "7 x 12 在线", "预约、改约、退款和投诉均可在线提交"]
    ],
    sections: [
      {
        title: "账户信息",
        items: [
          "登录后默认进入服务市场，可直接预约所需服务。",
          "订单页集中展示支付、履约、售后和评价记录。",
          "售后申请提交后，可在订单页持续查看处理进度。"
        ]
      },
      {
        title: "服务保障",
        items: [
          "服务人员完成接单后，平台会同步更新上门时间和联系人信息。",
          "已支付订单支持在可改约时间范围内申请调整服务时段。",
          "服务完成后，如对结果有异议，可发起退款或投诉申请。"
        ]
      }
    ]
  },
  provider: {
    navItems: [
      { to: "/provider", label: "工作台" },
      { to: "/overview", label: "我的" }
    ],
    mobileItems: [
      { to: "/provider", icon: "assignment", label: "任务" },
      { to: "/provider", icon: "calendar_month", label: "排班" },
      { to: "/provider", icon: "account_balance_wallet", label: "收入" },
      { to: "/overview", icon: "person", label: "我的" }
    ],
    heroEyebrow: "员工中心",
    heroTitle: "工作资料与履约规范",
    heroDescription: "集中查看服务规范、接单要求、到场流程和异常上报说明，保证履约过程统一顺畅。",
    summaryCards: [
      ["当前身份", "员工", "可查看任务、确认接单并更新服务状态"],
      ["工作区域", "按片区调度", "派单结果会根据技能、区域和时间自动匹配"],
      ["履约要求", "标准化执行", "到场、服务、完工和异常上报均需留痕"]
    ],
    sections: [
      {
        title: "接单规则",
        items: [
          "平台指派的订单仅对应服务人员本人可确认，避免任务冲突。",
          "抢单池仅展示未指派订单，成功接单后任务会自动进入个人工作台。",
          "暂停接单后不会再分配新任务，但已接订单仍需继续履约。"
        ]
      },
      {
        title: "服务流程",
        items: [
          "确认接单后请及时联系客户，核对上门时间与具体地址。",
          "开始服务前需确认现场情况，异常问题可通过订单记录上报。",
          "完工后系统将更新订单状态，并同步进入客户评价或售后阶段。"
        ]
      }
    ]
  },
  admin: {
    navItems: [
      { to: "/admin", label: "仪表盘" },
      { to: "/admin/schedule", label: "排班计划" },
      { to: "/admin/revenue", label: "营收统计" },
      { to: "/overview", label: "我的" }
    ],
    mobileItems: [
      { to: "/admin", icon: "dashboard", label: "仪表盘" },
      { to: "/admin/schedule", icon: "calendar_today", label: "排班" },
      { to: "/admin/revenue", icon: "payments", label: "营收" },
      { to: "/overview", icon: "person", label: "我的" }
    ],
    heroEyebrow: "管理中心",
    heroTitle: "平台规则与运营说明",
    heroDescription: "查看管理侧核心职责、调度原则、库存处理规则和客户服务标准。",
    summaryCards: [
      ["当前身份", "管理者", "可访问调度、营收、库存、客户与系统监控模块"],
      ["运营重点", "订单履约", "优先保障派单效率、服务质量和售后响应"],
      ["数据范围", "全平台", "覆盖订单、人员、库存、客户和监控数据"]
    ],
    sections: [
      {
        title: "调度与运营",
        items: [
          "排班计划用于分配人员、核对时间冲突并处理手动派单任务。",
          "营收统计会汇总订单收入、服务费和退款影响，便于运营复盘。",
          "库存模块记录耗材和配件的入库、出库及安全库存预警。"
        ]
      },
      {
        title: "客户与风控",
        items: [
          "客户列表支持搜索、查看消费记录和近期服务偏好。",
          "售后订单需根据退款、投诉和改约状态持续跟进处理。",
          "系统健康页面用于跟踪核心服务状态和关键运行指标。"
        ]
      }
    ]
  }
};

export function ProjectOverviewPage() {
  const { state, dispatch } = useAppState();
  const role = state.auth.currentUser.role || "customer";
  const currentContent = roleContent[role] || roleContent.customer;
  const fileInputRef = useRef(null);
  const [draftName, setDraftName] = useState(state.auth.currentUser.name);
  const [draftPhone, setDraftPhone] = useState(state.auth.currentUser.phone);
  const [draftAvatar, setDraftAvatar] = useState(state.auth.currentUser.avatar);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftName(state.auth.currentUser.name);
    setDraftPhone(state.auth.currentUser.phone);
    setDraftAvatar(state.auth.currentUser.avatar);
  }, [state.auth.currentUser.avatar, state.auth.currentUser.name, state.auth.currentUser.phone]);

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      dispatch({ type: "PUSH_TOAST", payload: { message: "请上传图片格式的头像文件。", tone: "warning" } });
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      dispatch({ type: "PUSH_TOAST", payload: { message: "头像图片请控制在 2MB 以内。", tone: "warning" } });
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraftAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function handleSaveProfile() {
    if (!draftName.trim()) {
      dispatch({ type: "PUSH_TOAST", payload: { message: "名字不能为空。", tone: "warning" } });
      return;
    }

    if (!/^1\d{10}$/.test(draftPhone.trim())) {
      dispatch({ type: "PUSH_TOAST", payload: { message: "请输入有效的 11 位手机号。", tone: "warning" } });
      return;
    }

    setSaving(true);

    try {
      const result = await authApi.updateProfile({
        id: state.auth.currentUser.id,
        name: draftName.trim(),
        phone: draftPhone.trim(),
        avatar: draftAvatar
      });

      dispatch({
        type: "UPDATE_PROFILE",
        payload: {
          name: result.user.name,
          phone: result.user.phone,
          avatar: result.user.avatar
        }
      });
    } catch (error) {
      dispatch({
        type: "PUSH_TOAST",
        payload: { message: error.message || "资料保存失败，请稍后再试。", tone: "warning" }
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <TopBar
        brand="HomeCare Pro"
        brandTo={roleHomeMap[role] || "/"}
        navItems={currentContent.navItems}
        rightSlot={<UserActions />}
      />
      <main className="mx-auto max-w-container-max px-margin-mobile py-lg pb-24 md:px-gutter">
        <section className="rounded-3xl bg-primary px-lg py-xl text-on-primary shadow-lg">
          <p className="mb-sm text-label-md uppercase tracking-wider text-primary-fixed">{currentContent.heroEyebrow}</p>
          <h1 className="text-display-lg font-bold max-md:text-headline-lg-mobile">{currentContent.heroTitle}</h1>
          <p className="mt-md max-w-3xl text-body-lg text-on-primary-container">{currentContent.heroDescription}</p>
        </section>

        <section className="mt-xl grid grid-cols-1 gap-md xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-3xl border border-outline-variant bg-surface p-lg shadow-sm">
            <p className="text-label-md text-primary">个人资料</p>
            <div className="mt-md flex flex-col gap-md sm:flex-row sm:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-highest">
                <img className="h-full w-full object-cover" src={draftAvatar} alt={`${draftName} 头像`} />
              </div>
              <div className="space-y-xs">
                <h2 className="text-headline-md font-semibold">{state.auth.currentUser.name}</h2>
                <p className="text-body-md text-on-surface-variant">{state.auth.currentUser.phone}</p>
                <div className="inline-flex rounded-full bg-secondary-container px-sm py-xs text-label-sm font-semibold text-on-secondary-container">
                  {state.auth.currentUser.level}
                </div>
              </div>
            </div>
            <div className="mt-md rounded-2xl bg-surface-container-low p-md text-label-md text-on-surface-variant">
              姓名、手机号和头像现在都会真实同步到账号数据库，重新登录或换设备进入时也能带出最新资料。
            </div>
          </div>

          <div className="rounded-3xl border border-outline-variant bg-surface p-lg shadow-sm">
            <div className="flex items-center justify-between gap-md">
              <div>
                <p className="text-label-md text-primary">资料编辑</p>
                <h2 className="mt-xs text-headline-md font-semibold">修改头像、名字和手机号</h2>
              </div>
              <button
                className="rounded-xl bg-primary px-md py-2 text-label-md font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "保存中..." : "保存资料"}
              </button>
            </div>

            <div className="mt-md">
              <label className="mb-xs block text-label-md text-on-surface-variant">显示名称</label>
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-3 outline-none"
                placeholder="请输入你的显示名称"
              />
            </div>

            <div className="mt-md">
              <label className="mb-xs block text-label-md text-on-surface-variant">手机号</label>
              <input
                value={draftPhone}
                onChange={(event) => setDraftPhone(event.target.value)}
                className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-md py-3 outline-none"
                placeholder="请输入 11 位手机号"
              />
              <p className="mt-xs text-label-sm text-on-surface-variant">保存后将使用新手机号作为真实登录账号。</p>
            </div>

            <div className="mt-md">
              <div className="mb-xs flex items-center justify-between gap-sm">
                <label className="block text-label-md text-on-surface-variant">头像样式</label>
                <button
                  className="rounded-lg border border-outline-variant px-sm py-2 text-label-sm text-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  上传本地图片
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <div className="grid grid-cols-4 gap-sm">
                {avatarPresets.map((avatar) => (
                  <button
                    key={avatar}
                    className={`overflow-hidden rounded-2xl border p-1 transition-all ${
                      draftAvatar === avatar ? "border-primary shadow-sm" : "border-outline-variant"
                    }`}
                    onClick={() => setDraftAvatar(avatar)}
                  >
                    <img className="h-16 w-full rounded-xl object-cover" src={avatar} alt="头像预设" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-md flex flex-wrap gap-sm">
              <button
                className="rounded-xl bg-primary px-lg py-3 text-label-md font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "保存中..." : "保存修改"}
              </button>
              <button
                className="rounded-xl border border-outline-variant px-lg py-3 text-label-md text-on-surface-variant"
                onClick={() => {
                  setDraftName(state.auth.currentUser.name);
                  setDraftPhone(state.auth.currentUser.phone);
                  setDraftAvatar(state.auth.currentUser.avatar);
                }}
                disabled={saving}
              >
                撤销未保存修改
              </button>
            </div>
          </div>
        </section>

        <section className="mt-xl grid grid-cols-1 gap-md md:grid-cols-3">
          {currentContent.summaryCards.map(([label, value, desc]) => (
            <div key={label} className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm">
              <div className="text-label-md text-on-surface-variant">{label}</div>
              <div className="mt-sm text-headline-md font-semibold">{value}</div>
              <div className="mt-xs text-label-sm text-outline">{desc}</div>
            </div>
          ))}
        </section>

        <section className="mt-xl grid grid-cols-1 gap-md lg:grid-cols-2">
          {currentContent.sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-outline-variant bg-surface p-lg shadow-sm">
              <h2 className="mb-md text-headline-md font-semibold">{section.title}</h2>
              <div className="space-y-sm">
                {section.items.map((item) => (
                  <div key={item} className="rounded-2xl bg-surface-container-low px-md py-sm text-body-md text-on-surface-variant">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
      <Footer compact />
      <MobileBottomNav items={currentContent.mobileItems} />
    </div>
  );
}
