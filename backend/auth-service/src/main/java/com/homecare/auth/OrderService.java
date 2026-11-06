package com.homecare.auth;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {
  private final OrderRepository repo;

  public OrderService(OrderRepository repo) {
    this.repo = repo;
  }

  public record Booking(
      String serviceId,
      String providerId,
      String providerMode,
      String dateKey,
      String address,
      String contactName,
      String contactPhone,
      String remark) {}

  public record Action(
      String providerId,
      Integer rating,
      String review,
      String reason,
      String content,
      String dateKey,
      Long version) {}

  @Transactional
  public Map<String, Object> create(StoredUser user, Booking b) {
    role(user, "customer");
    var services =
        repo.jdbc()
            .queryForList(
                "SELECT * FROM service_items WHERE service_code=? AND status=1",
                text(b.serviceId(), 50));
    if (services.isEmpty()) throw error(400, "服务项目不存在或已下架。");
    var s = services.get(0);
    var date = date(b.dateKey());
    String phone = text(b.contactPhone(), 20);
    if (!phone.matches("1[0-9]{10}")) throw error(400, "联系人手机号无效。");
    String no = "HC-" + UUID.randomUUID().toString();
    BigDecimal price = (BigDecimal) s.get("price");
    repo.jdbc()
        .update(
            "INSERT INTO"
                + " orders(order_no,user_id,service_item_id,order_status,appointment_time,address_detail,remark_text,base_amount,service_fee,pay_amount,contact_name,contact_phone)"
                + " VALUES(?,?,?,'待支付',?,?,?,?,15,?,?,?)",
            no,
            user.getId(),
            s.get("id"),
            date,
            text(b.address(), 255),
            optional(b.remark(), 500),
            price,
            price.add(new BigDecimal("15")),
            text(b.contactName(), 50),
            phone);
    audit(no, user, "CREATE");
    return repo.byNo(no);
  }

  @Transactional
  public Map<String, Object> act(StoredUser user, String no, String operation, Action a) {
    var o = repo.lock(no);
    String status = (String) o.get("order_status");
    long id = ((Number) o.get("id")).longValue();
    // Permission checks always precede idempotency checks, including paid/reviewed orders.
    switch (operation) {
      case "assign" -> role(user, "admin");
      case "accept", "start", "complete" -> role(user, "provider");
      case "pay", "review", "cancel", "reschedule", "refund", "complaint" -> owner(user, o);
      default -> throw error(400, "未知订单操作。");
    }
    if (a.version() != null && a.version().longValue() != ((Number) o.get("version")).longValue())
      throw error(409, "订单已更新，请刷新后重试。");
    switch (operation) {
      case "pay" -> {
        if (o.get("paid_at") != null) return repo.byNo(no);
        state(status, "待支付");
        repo.jdbc()
            .update(
                "INSERT INTO payment_records(order_id,pay_no,pay_amount,pay_status,pay_channel)"
                    + " VALUES(?,?,?,'成功','mock')",
                id,
                "MOCK-" + no,
                o.get("pay_amount"));
        repo.jdbc()
            .update(
                "UPDATE orders SET order_status='待派单',paid_at=CURRENT_TIMESTAMP WHERE id=?", id);
      }
      case "assign" -> {
        state(status, "待派单");
        var ps =
            repo.jdbc()
                .queryForList(
                    "SELECT p.id,p.work_status FROM providers p JOIN provider_accounts a ON"
                        + " a.provider_id=p.id WHERE p.provider_code=? AND a.online=TRUE FOR"
                        + " UPDATE",
                    text(a.providerId(), 50));
        if (ps.isEmpty()) throw error(400, "人员没有绑定账号或已离线。");
        if (!"空闲".equals(ps.get(0).get("work_status"))) throw error(409, "人员正在处理其他任务。");
        Object pid = ps.get(0).get("id");
        repo.jdbc().update("UPDATE providers SET work_status='待上门' WHERE id=?", pid);
        repo.jdbc()
            .update(
                "UPDATE orders SET provider_id=?,order_status='已派单',assigned_at=CURRENT_TIMESTAMP"
                    + " WHERE id=?",
                pid,
                id);
      }
      case "accept" -> {
        var p = provider(user);
        if (!Boolean.TRUE.equals(p.get("online")) && !Integer.valueOf(1).equals(p.get("online")))
          throw error(409, "请先上线接单。");
        if (o.get("provider_id") != null && !same(o.get("provider_id"), p.get("provider_id")))
          throw error(403, "不能接取他人任务。");
        state(status, "待派单", "已派单");
        if (status.equals("待派单") && !"空闲".equals(p.get("work_status")))
          throw error(409, "请先完成已有任务。");
        repo.jdbc()
            .update(
                "UPDATE orders SET"
                    + " provider_id=?,order_status='已接单',assigned_at=COALESCE(assigned_at,CURRENT_TIMESTAMP)"
                    + " WHERE id=?",
                p.get("provider_id"),
                id);
        repo.jdbc()
            .update("UPDATE providers SET work_status='待上门' WHERE id=?", p.get("provider_id"));
      }
      case "start", "complete" -> {
        var p = provider(user);
        if (!same(p.get("provider_id"), o.get("provider_id"))) throw error(403, "只能操作本人任务。");
        state(status, operation.equals("start") ? "已接单" : "服务中");
        if (operation.equals("start"))
          repo.jdbc()
              .update(
                  "UPDATE orders SET order_status='服务中',started_at=CURRENT_TIMESTAMP WHERE id=?",
                  id);
        else
          repo.jdbc()
              .update(
                  "UPDATE orders SET order_status='已完成',completed_at=CURRENT_TIMESTAMP WHERE id=?",
                  id);
        repo.jdbc()
            .update(
                "UPDATE providers SET work_status=? WHERE id=?",
                operation.equals("start") ? "服务中" : "空闲",
                p.get("provider_id"));
      }
      case "review" -> {
        state(status, "已完成");
        if (a.rating() == null || a.rating() < 1 || a.rating() > 5) throw error(400, "评分必须为1至5。");
        repo.jdbc()
            .update(
                "INSERT INTO order_reviews(order_id,user_id,rating,review_content) VALUES(?,?,?,?)",
                id,
                user.getId(),
                a.rating(),
                text(a.review(), 500));
        repo.jdbc().update("UPDATE orders SET order_status='已评价' WHERE id=?", id);
      }
      case "cancel" -> {
        // Paid cancellations must go through after-sales; never silently lose a payment.
        state(status, "待支付");
        repo.jdbc()
            .update(
                "UPDATE orders SET"
                    + " order_status='已取消',cancelled_at=CURRENT_TIMESTAMP,cancellation_reason=?"
                    + " WHERE id=?",
                text(a.reason(), 500),
                id);
      }
      case "reschedule" -> {
        state(status, "待支付", "待派单");
        repo.jdbc()
            .update("UPDATE orders SET appointment_time=? WHERE id=?", date(a.dateKey()), id);
      }
      case "refund" -> {
        if (o.get("paid_at") == null) throw error(409, "未支付订单不能退款。");
        if (!"未申请".equals(o.get("refund_status"))) throw error(409, "退款申请已存在。");
        repo.jdbc()
            .update(
                "UPDATE orders SET refund_status='处理中',refund_reason=? WHERE id=?",
                text(a.reason(), 500),
                id);
      }
      case "complaint" -> {
        if (!"无投诉".equals(o.get("complaint_status"))) throw error(409, "投诉已提交。");
        repo.jdbc()
            .update(
                "UPDATE orders SET complaint_status='处理中',complaint_content=? WHERE id=?",
                text(a.content(), 500),
                id);
      }
      default -> throw error(400, "未知操作。");
    }
    repo.jdbc().update("UPDATE orders SET version=version+1 WHERE id=?", id);
    audit(no, user, operation);
    return repo.byNo(no);
  }

  @Transactional
  public void online(StoredUser user, boolean online) {
    role(user, "provider");
    var p = provider(user);
    repo.jdbc()
        .update("UPDATE provider_accounts SET online=? WHERE user_id=?", online, user.getId());
  }

  private Map<String, Object> provider(StoredUser u) {
    var ps =
        repo.jdbc()
            .queryForList(
                "SELECT a.*,p.work_status FROM provider_accounts a JOIN providers p ON"
                    + " p.id=a.provider_id WHERE a.user_id=? FOR UPDATE",
                u.getId());
    if (ps.isEmpty()) throw error(403, "未绑定服务人员档案。");
    return ps.get(0);
  }

  private void audit(String no, StoredUser user, String action) {
    repo.jdbc()
        .update(
            "INSERT INTO order_events(order_no,actor_id,action_name) VALUES(?,?,?)",
            no,
            user.getId(),
            action);
  }

  static void role(StoredUser u, String role) {
    if (!role.equals(u.getRole())) throw error(403, "当前角色无权执行此操作。");
  }

  static void owner(StoredUser u, Map<String, Object> o) {
    role(u, "customer");
    if (!same(u.getId(), o.get("user_id"))) throw error(403, "只能操作本人订单。");
  }

  static boolean same(Object a, Object b) {
    return a != null && b != null && a.toString().equals(b.toString());
  }

  static void state(String current, String... allowed) {
    if (!Arrays.asList(allowed).contains(current)) throw error(409, "当前订单状态不允许此操作。");
  }

  static String text(String v, int max) {
    if (v == null || v.trim().isEmpty() || v.trim().length() > max)
      throw error(400, "必填信息为空或超出长度限制。");
    return v.trim();
  }

  static String optional(String v, int max) {
    if (v == null || v.isBlank()) return "";
    return text(v, max);
  }

  static LocalDateTime date(String value) {
    try {
      var d = LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
      if (d.isBefore(LocalDateTime.now().plusMinutes(30))) throw error(400, "预约至少提前30分钟。");
      return d;
    } catch (java.time.format.DateTimeParseException | NullPointerException e) {
      throw error(400, "预约时间格式应为 yyyy-MM-dd HH:mm。");
    }
  }

  static ResponseStatusException error(int status, String message) {
    return new ResponseStatusException(HttpStatus.valueOf(status), message);
  }
}
