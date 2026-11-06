package com.homecare.auth;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
  private final UserStoreService userStoreService;

  public AuthService(UserStoreService userStoreService) {
    this.userStoreService = userStoreService;
  }

  public AuthResult login(LoginRequest request) {
    String phone = normalizePhone(request.getPhone());
    String password = request.getPassword() == null ? "" : request.getPassword();

    if (phone.isEmpty() || password.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请输入手机号和密码。");
    }

    StoredUser user = userStoreService.findByPhone(phone);
    if (user == null || !PasswordUtils.matches(password, user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "手机号或密码错误。");
    }

    if (PasswordUtils.needsMigration(user.getPasswordHash())) {
      String hashedPassword = PasswordUtils.hash(password);
      userStoreService.updatePasswordHash(user.getId(), hashedPassword);
      user.setPasswordHash(hashedPassword);
    }

    return AuthResult.success("登录成功。", AuthUserView.fromStoredUser(user));
  }

  public AuthResult register(RegisterRequest request) {
    String name = normalizeText(request.getName());
    String phone = normalizePhone(request.getPhone());
    String password = request.getPassword() == null ? "" : request.getPassword();
    String confirmPassword =
        request.getConfirmPassword() == null ? "" : request.getConfirmPassword();

    if (name.isEmpty() || name.length() > 50) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请输入姓名。");
    }
    if (!phone.matches("^1\\d{10}$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请输入有效的 11 位手机号。");
    }
    if (password.length() < 8
        || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "密码至少 8 位，UTF-8 编码不超过 72 字节。");
    }
    if (!password.equals(confirmPassword)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "两次输入的密码不一致。");
    }
    if (userStoreService.findByPhone(phone) != null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "该手机号已注册。");
    }

    StoredUser user = userStoreService.createCustomer(name, phone, PasswordUtils.hash(password));
    return AuthResult.success("注册成功，已自动登录。", AuthUserView.fromStoredUser(user));
  }

  public boolean phoneExists(String phone) {
    return userStoreService.findByPhone(normalizePhone(phone)) != null;
  }

  public AuthResult updateProfile(UpdateProfileRequest request) {
    long userId = request.getId() == null ? 0L : request.getId();
    String name = normalizeText(request.getName());
    String phone = normalizePhone(request.getPhone());
    String avatar = normalizeAvatar(request.getAvatar());

    if (userId <= 0) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "用户信息无效，请重新登录后再试。");
    }
    if (name.isEmpty() || name.length() > 50) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请输入姓名。");
    }
    if (!phone.matches("^1\\d{10}$")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "请输入有效的 11 位手机号。");
    }

    StoredUser currentUser = userStoreService.findById(userId);
    if (currentUser == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在，请重新登录后再试。");
    }

    StoredUser existingUser = userStoreService.findByPhone(phone);
    if (existingUser != null && existingUser.getId() != userId) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "该手机号已被其他账号使用。");
    }
    if (avatar != null && avatar.length() > 4_000_000) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "头像内容过大，请换一张更小的图片。");
    }

    StoredUser updatedUser = userStoreService.updateProfile(userId, name, phone, avatar);
    return AuthResult.success("资料更新成功。", AuthUserView.fromStoredUser(updatedUser));
  }

  private String normalizePhone(String phone) {
    return phone == null ? "" : phone.trim();
  }

  private String normalizeText(String value) {
    return value == null ? "" : value.trim();
  }

  private String normalizeAvatar(String avatar) {
    if (avatar == null) {
      return null;
    }
    String normalized = avatar.trim();
    return normalized.isEmpty() ? null : normalized;
  }
}
