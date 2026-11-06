package com.homecare.auth;

import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/platform")
public class OrderController {
  private final SessionService sessions;
  private final OrderService service;
  private final OrderRepository repo;

  public OrderController(SessionService sessions, OrderService service, OrderRepository repo) {
    this.sessions = sessions;
    this.service = service;
    this.repo = repo;
  }

  @GetMapping("/snapshot")
  public Map<String, Object> snapshot(
      @RequestHeader(value = "Authorization", required = false) String token) {
    var u = sessions.require(token);
    var providers = repo.providers();
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("orders", repo.list(u));
    result.put("serviceCatalog", repo.catalog());
    result.put("providers", providers);
    result.put(
        "currentProviderId",
        providers.stream()
            .filter(p -> OrderService.same(p.get("userId"), u.getId()))
            .map(p -> p.get("id"))
            .findFirst()
            .orElse(""));
    return result;
  }

  @PostMapping("/orders")
  public Map<String, Object> create(
      @RequestHeader(value = "Authorization", required = false) String token,
      @RequestBody OrderService.Booking booking) {
    return service.create(sessions.require(token), booking);
  }

  @PostMapping("/orders/{no}/{operation}")
  public Map<String, Object> action(
      @RequestHeader(value = "Authorization", required = false) String token,
      @PathVariable("no") String no,
      @PathVariable("operation") String operation,
      @RequestBody OrderService.Action action) {
    return service.act(sessions.require(token), no, operation, action);
  }

  public record Online(boolean online) {}

  @PutMapping("/provider/online")
  public void online(
      @RequestHeader(value = "Authorization", required = false) String token,
      @RequestBody Online request) {
    service.online(sessions.require(token), request.online());
  }
}
