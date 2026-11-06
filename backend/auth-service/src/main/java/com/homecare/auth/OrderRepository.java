package com.homecare.auth;

import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class OrderRepository {
  private final JdbcTemplate jdbc;

  public JdbcTemplate jdbc() {
    return jdbc;
  }

  public OrderRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  static final String VIEW =
      "SELECT o.*,u.name AS"
          + " customer_name,s.service_name,s.category_name,p.provider_code,p.provider_name,p.title_name,r.rating,r.review_content"
          + " FROM orders o JOIN users u ON u.id=o.user_id JOIN service_items s ON"
          + " s.id=o.service_item_id LEFT JOIN providers p ON p.id=o.provider_id LEFT JOIN"
          + " order_reviews r ON r.order_id=o.id";

  public List<Map<String, Object>> list(StoredUser user) {
    String where =
        switch (user.getRole()) {
          case "admin" -> "";
          case "customer" -> " WHERE o.user_id=?";
          case "provider" ->
              " WHERE o.provider_id IN (SELECT provider_id FROM provider_accounts WHERE user_id=?)"
                  + " OR o.order_status='待派单'";
          default -> " WHERE 1=0";
        };
    var rows =
        user.getRole().equals("admin")
            ? jdbc.queryForList(VIEW + " ORDER BY o.id DESC")
            : jdbc.queryForList(VIEW + where + " ORDER BY o.id DESC", user.getId());
    return rows.stream()
        .map(this::view)
        .peek(
            m -> {
              if (user.getRole().equals("provider") && "待派单".equals(m.get("status"))) {
                m.put("address", "接单后可查看详细地址");
                m.put("contactName", "");
                m.put("contactPhone", "");
                m.put("customerName", "待接单客户");
                m.put("remark", "");
                m.put("customerId", null);
              }
            })
        .toList();
  }

  public Map<String, Object> lock(String no) {
    var rows = jdbc.queryForList("SELECT * FROM orders WHERE order_no=? FOR UPDATE", no);
    if (rows.isEmpty()) throw OrderService.error(404, "订单不存在。");
    return rows.get(0);
  }

  public Map<String, Object> byNo(String no) {
    return view(jdbc.queryForMap(VIEW + " WHERE o.order_no=?", no));
  }

  public List<Map<String, Object>> catalog() {
    return jdbc.query(
        "SELECT * FROM service_items WHERE status=1 ORDER BY id",
        (rs, n) -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("id", rs.getString("service_code"));
          m.put("name", rs.getString("service_name"));
          m.put("category", rs.getString("category_name"));
          m.put("price", rs.getBigDecimal("price"));
          m.put("unit", rs.getString("unit_name"));
          m.put("duration", rs.getString("duration_desc"));
          m.put("description", rs.getString("description_text"));
          m.put("tags", List.of());
          m.put("providerIds", providers().stream().map(p -> p.get("id")).toList());
          return m;
        });
  }

  public List<Map<String, Object>> providers() {
    return jdbc.query(
        "SELECT p.*,a.user_id,a.online FROM providers p LEFT JOIN provider_accounts a ON"
            + " a.provider_id=p.id ORDER BY p.id",
        (rs, n) -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("id", rs.getString("provider_code"));
          m.put("userId", rs.getObject("user_id"));
          m.put("name", rs.getString("provider_name"));
          m.put("title", rs.getString("title_name"));
          m.put("rating", rs.getBigDecimal("rating"));
          m.put("serviceType", rs.getString("service_type"));
          m.put("workStatus", rs.getString("work_status"));
          m.put("area", rs.getString("service_area"));
          m.put("online", rs.getBoolean("online"));
          m.put("available", rs.getObject("user_id") != null);
          return m;
        });
  }

  private Map<String, Object> view(Map<String, Object> row) {
    Map<String, Object> m = new LinkedHashMap<>();
    String[][] fields = {
      {"id", "order_no"},
      {"customerId", "user_id"},
      {"customerName", "customer_name"},
      {"serviceName", "service_name"},
      {"category", "category_name"},
      {"providerId", "provider_code"},
      {"providerName", "provider_name"},
      {"providerTitle", "title_name"},
      {"status", "order_status"},
      {"address", "address_detail"},
      {"baseAmount", "base_amount"},
      {"serviceFee", "service_fee"},
      {"amount", "pay_amount"},
      {"contactName", "contact_name"},
      {"contactPhone", "contact_phone"},
      {"remark", "remark_text"},
      {"refundStatus", "refund_status"},
      {"refundReason", "refund_reason"},
      {"complaintStatus", "complaint_status"},
      {"complaintContent", "complaint_content"},
      {"cancellationReason", "cancellation_reason"},
      {"review", "review_content"},
      {"version", "version"}
    };
    for (var f : fields) m.put(f[0], row.get(f[1]));
    String appointment = stamp(row.get("appointment_time"));
    m.put("dateKey", appointment);
    m.put("appointmentText", appointment);
    m.put("appointmentShort", appointment);
    for (String key : List.of("created", "paid", "assigned", "started", "completed", "cancelled"))
      m.put(key + "At", stamp(row.get(key + "_at")));
    m.put("rating", row.get("rating") == null ? 0 : row.get("rating"));
    m.put("review", row.get("review_content") == null ? "" : row.get("review_content"));
    return m;
  }

  private String stamp(Object value) {
    return value == null ? null : value.toString().replace('T', ' ').substring(0, 16);
  }
}
