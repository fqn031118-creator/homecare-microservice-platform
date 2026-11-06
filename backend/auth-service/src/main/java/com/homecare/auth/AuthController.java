package com.homecare.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;
  private final SessionService sessions;

  public AuthController(AuthService authService, SessionService sessions) {
    this.authService = authService;
    this.sessions = sessions;
  }

  @PostMapping("/login")
  public AuthResult login(@RequestBody LoginRequest request) {
    return withToken(authService.login(request));
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResult register(@RequestBody RegisterRequest request) {
    return withToken(authService.register(request));
  }

  @GetMapping("/phone-exists")
  public PhoneExistsResponse phoneExists(@RequestParam("phone") String phone) {
    return new PhoneExistsResponse(authService.phoneExists(phone));
  }

  @PutMapping("/profile")
  public AuthResult updateProfile(
      @org.springframework.web.bind.annotation.RequestHeader(
              value = "Authorization",
              required = false)
          String authorization,
      @RequestBody UpdateProfileRequest request) {
    StoredUser current = sessions.require(authorization);
    if (request.getId() != null && request.getId() != current.getId())
      throw new org.springframework.web.server.ResponseStatusException(
          HttpStatus.FORBIDDEN, "不能修改他人资料。");
    request.setId(current.getId());
    return authService.updateProfile(request);
  }

  @GetMapping("/me")
  public AuthUserView me(
      @org.springframework.web.bind.annotation.RequestHeader(
              value = "Authorization",
              required = false)
          String authorization) {
    return AuthUserView.fromStoredUser(sessions.require(authorization));
  }

  @PostMapping("/logout")
  public void logout(
      @org.springframework.web.bind.annotation.RequestHeader(
              value = "Authorization",
              required = false)
          String authorization) {
    sessions.revoke(authorization);
  }

  private AuthResult withToken(AuthResult result) {
    result.setToken(sessions.issue(result.getUser().getId()));
    return result;
  }
}
