package com.homecare.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.*;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(
    properties = {
      "spring.datasource.url=jdbc:h2:mem:platform;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
      "spring.datasource.driver-class-name=org.h2.Driver",
      "spring.datasource.username=sa",
      "spring.datasource.password=",
      "spring.sql.init.mode=always"
    })
@AutoConfigureMockMvc
class PlatformIntegrationTest {
  @Autowired MockMvc mvc;
  @Autowired JdbcTemplate jdbc;
  @Autowired ObjectMapper json;
  @Autowired SessionService sessions;
  String customer, other, provider, admin;
  long customerId, otherId, providerId;

  @BeforeEach
  void setup() {
    for (String table :
        List.of(
            "order_events",
            "order_reviews",
            "payment_records",
            "orders",
            "auth_sessions",
            "provider_accounts",
            "users")) jdbc.update("DELETE FROM " + table);
    jdbc.update("UPDATE providers SET work_status='空闲'");
    customerId = user("13800000000", "customer");
    otherId = user("13800000001", "customer");
    providerId = user("13900000000", "provider");
    long aid = user("13700000000", "admin");
    jdbc.update(
        "INSERT INTO provider_accounts(user_id,provider_id,online) SELECT ?,id,TRUE FROM providers"
            + " WHERE provider_code='provider-2'",
        providerId);
    customer = sessions.issue(customerId);
    other = sessions.issue(otherId);
    provider = sessions.issue(providerId);
    admin = sessions.issue(aid);
  }

  long user(String phone, String role) {
    jdbc.update(
        "INSERT INTO users(name,phone,password,role) VALUES(?,?,?,?)",
        role,
        phone,
        PasswordUtils.hash("Test12345!"),
        role);
    return jdbc.queryForObject("SELECT id FROM users WHERE phone=?", Long.class, phone);
  }

  String booking() {
    return "{\"serviceId\":\"svc-001\",\"dateKey\":\""
        + LocalDate.now().plusDays(2)
        + " 10:00\",\"address\":\"测试地址88号\",\"contactName\":\"测试用户\",\"contactPhone\":\"13800000000\"}";
  }

  JsonNode postJson(String path, String token, String body, int status) throws Exception {
    var req = post(path).contentType("application/json").content(body);
    if (token != null) req.header("Authorization", "Bearer " + token);
    return json.readTree(
        mvc.perform(req)
            .andExpect(status().is(status))
            .andReturn()
            .getResponse()
            .getContentAsString(java.nio.charset.StandardCharsets.UTF_8));
  }

  String create() throws Exception {
    return postJson("/api/platform/orders", customer, booking(), 200).get("id").asText();
  }

  JsonNode act(String no, String op, String token, String body, int status) throws Exception {
    return postJson("/api/platform/orders/" + no + "/" + op, token, body, status);
  }

  void paid(String no) throws Exception {
    act(no, "pay", customer, "{}", 200);
  }

  void completed(String no) throws Exception {
    paid(no);
    act(no, "assign", admin, "{\"providerId\":\"provider-2\"}", 200);
    act(no, "accept", provider, "{}", 200);
    act(no, "start", provider, "{}", 200);
    act(no, "complete", provider, "{}", 200);
  }

  @Test
  void fullLifecycleAndPaymentIdempotency() throws Exception {
    String no = create();
    paid(no);
    paid(no);
    assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM payment_records", Integer.class));
    act(no, "assign", admin, "{\"providerId\":\"provider-2\"}", 200);
    act(no, "accept", provider, "{}", 200);
    act(no, "start", provider, "{}", 200);
    act(no, "complete", provider, "{}", 200);
    assertEquals(
        "已评价",
        act(no, "review", customer, "{\"rating\":5,\"review\":\"服务认真\"}", 200)
            .get("status")
            .asText());
    assertEquals(7, jdbc.queryForObject("SELECT COUNT(*) FROM order_events", Integer.class));
  }

  @Test
  void authenticationAndRoleBoundaries() throws Exception {
    postJson("/api/platform/orders", null, booking(), 401);
    String no = create();
    act(no, "assign", customer, "{\"providerId\":\"provider-2\"}", 403);
    act(no, "pay", admin, "{}", 403);
    act(no, "start", customer, "{}", 403);
  }

  @Test
  void ownershipBeforeIdempotency() throws Exception {
    String no = create();
    paid(no);
    act(no, "pay", other, "{}", 403);
    act(no, "refund", other, "{\"reason\":\"测试\"}", 403);
  }

  @Test
  void listsAreScopedAndPoolIsRedacted() throws Exception {
    String no = create();
    mvc.perform(get("/api/platform/snapshot").header("Authorization", "Bearer " + other))
        .andExpect(jsonPath("$.orders.length()").value(0));
    paid(no);
    mvc.perform(get("/api/platform/snapshot").header("Authorization", "Bearer " + provider))
        .andExpect(jsonPath("$.orders[0].address").value("接单后可查看详细地址"))
        .andExpect(jsonPath("$.orders[0].contactPhone").value(""));
  }

  @Test
  void strictStateTransitionsRollback() throws Exception {
    String no = create();
    act(no, "complete", provider, "{}", 403);
    paid(no);
    act(no, "assign", admin, "{\"providerId\":\"provider-2\"}", 200);
    act(no, "start", provider, "{}", 409);
    assertEquals(
        "已派单",
        jdbc.queryForObject("SELECT order_status FROM orders WHERE order_no=?", String.class, no));
  }

  @Test
  void reviewValidationAndUniqueness() throws Exception {
    String no = create();
    completed(no);
    act(no, "review", customer, "{\"rating\":6,\"review\":\"好\"}", 400);
    act(no, "review", customer, "{\"rating\":5,\"review\":\" \"}", 400);
    act(no, "review", customer, "{\"rating\":5,\"review\":\"好\"}", 200);
    act(no, "review", customer, "{\"rating\":5,\"review\":\"再次\"}", 409);
    assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM order_reviews", Integer.class));
  }

  @Test
  void offlineAndUnboundProvidersRejected() throws Exception {
    String no = create();
    paid(no);
    jdbc.update("UPDATE provider_accounts SET online=FALSE");
    act(no, "accept", provider, "{}", 409);
    act(no, "assign", admin, "{\"providerId\":\"provider-1\"}", 400);
  }

  @Test
  void optimisticVersionAndCancelRules() throws Exception {
    String no = create();
    paid(no);
    act(no, "refund", customer, "{\"version\":0,\"reason\":\"测试\"}", 409);
    act(no, "cancel", customer, "{\"reason\":\"测试\"}", 409);
    String unpaid = create();
    act(unpaid, "refund", customer, "{\"reason\":\"测试\"}", 409);
    act(unpaid, "cancel", customer, "{\"reason\":\"计划变化\"}", 200);
  }

  @Test
  void bookingValidationAndServerPricing() throws Exception {
    postJson("/api/platform/orders", customer, booking().replace("svc-001", "unknown"), 400);
    postJson(
        "/api/platform/orders",
        customer,
        booking().replace(LocalDate.now().plusDays(2).toString(), "2020-01-01"),
        400);
    var body = json.readTree(booking());
    ((com.fasterxml.jackson.databind.node.ObjectNode) body).put("amount", 1);
    assertEquals(
        195,
        postJson("/api/platform/orders", customer, body.toString(), 200).get("amount").asInt());
  }

  @Test
  void profileOwnershipAndCors() throws Exception {
    mvc.perform(
            put("/api/auth/profile")
                .header("Authorization", "Bearer " + customer)
                .contentType("application/json")
                .content("{\"id\":" + otherId + ",\"name\":\"攻击者\",\"phone\":\"13800000002\"}"))
        .andExpect(status().isForbidden());
    mvc.perform(
            options("/api/auth/profile")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "PUT"))
        .andExpect(status().isOk())
        .andExpect(
            header()
                .string(
                    "Access-Control-Allow-Methods", org.hamcrest.Matchers.containsString("PUT")));
  }

  @Test
  void sessionExpiryAndRevocation() throws Exception {
    jdbc.update(
        "UPDATE auth_sessions SET expires_at=? WHERE user_id=?",
        java.sql.Timestamp.valueOf(LocalDateTime.now().minusHours(1)),
        customerId);
    mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + customer))
        .andExpect(status().isUnauthorized());
    postJson("/api/auth/logout", other, "{}", 200);
    mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + other))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void bcryptAndLegacyMigration() throws Exception {
    String first = PasswordUtils.hash("Test12345!");
    assertNotEquals(first, PasswordUtils.hash("Test12345!"));
    assertTrue(PasswordUtils.matches("Test12345!", first));
    assertFalse(PasswordUtils.matches("123456", "123456"));
    jdbc.update(
        "UPDATE users SET password=? WHERE id=?", SessionService.digest("Test12345!"), customerId);
    var result =
        postJson(
            "/api/auth/login",
            null,
            "{\"phone\":\"13800000000\",\"password\":\"Test12345!\"}",
            200);
    assertTrue(result.has("token"));
    assertTrue(
        jdbc.queryForObject("SELECT password FROM users WHERE id=?", String.class, customerId)
            .startsWith("$2"));
    assertFalse(result.get("user").has("password"));
  }

  @Test
  void registrationValidationAndDuplicate() throws Exception {
    String body =
        "{\"name\":\"新用户\",\"phone\":\"13812345678\",\"password\":\"Test12345!\",\"confirmPassword\":\"Test12345!\"}";
    var response = postJson("/api/auth/register", null, body, 201);
    assertEquals("customer", response.get("user").get("role").asText());
    postJson("/api/auth/register", null, body, 409);
    postJson("/api/auth/register", null, body.replace("Test12345!", "1234567"), 400);
  }
}
