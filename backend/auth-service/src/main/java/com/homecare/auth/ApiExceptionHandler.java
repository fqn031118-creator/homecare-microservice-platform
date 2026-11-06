package com.homecare.auth;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<?> status(ResponseStatusException e) {
    return ResponseEntity.status(e.getStatusCode())
        .body(Map.of("message", e.getReason() == null ? "请求失败" : e.getReason()));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<?> conflict(DataIntegrityViolationException e) {
    return ResponseEntity.status(409).body(Map.of("message", "记录已存在或数据约束冲突，请刷新重试。"));
  }

  @ExceptionHandler({
    org.springframework.http.converter.HttpMessageNotReadableException.class,
    IllegalArgumentException.class
  })
  ResponseEntity<?> invalid(Exception e) {
    return ResponseEntity.badRequest().body(Map.of("message", "请求格式或参数无效。"));
  }
}
