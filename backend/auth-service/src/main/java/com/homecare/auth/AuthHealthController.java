package com.homecare.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class AuthHealthController {
  @GetMapping("/health")
  public String health() {
    return "auth-service ok";
  }
}
