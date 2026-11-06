package com.homecare.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SessionService {
  private final JdbcTemplate jdbc;
  private final UserStoreService users;

  public SessionService(JdbcTemplate jdbc, UserStoreService users) {
    this.jdbc = jdbc;
    this.users = users;
  }

  public String issue(long userId) {
    byte[] bytes = new byte[32];
    new SecureRandom().nextBytes(bytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    jdbc.update("DELETE FROM auth_sessions WHERE expires_at < ?", Timestamp.from(Instant.now()));
    jdbc.update(
        "INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)",
        digest(token),
        userId,
        Timestamp.from(Instant.now().plusSeconds(7200)));
    return token;
  }

  public StoredUser require(String header) {
    if (header == null || !header.startsWith("Bearer ") || header.length() > 256)
      throw unauthorized();
    var ids =
        jdbc.query(
            "SELECT user_id FROM auth_sessions WHERE token_hash=? AND expires_at>?",
            (rs, n) -> rs.getLong(1),
            digest(header.substring(7)),
            Timestamp.from(Instant.now()));
    StoredUser user = ids.isEmpty() ? null : users.findById(ids.get(0));
    if (user == null) throw unauthorized();
    return user;
  }

  public void revoke(String header) {
    require(header);
    jdbc.update("DELETE FROM auth_sessions WHERE token_hash=?", digest(header.substring(7)));
  }

  static String digest(String value) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  private ResponseStatusException unauthorized() {
    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "登录已失效，请重新登录。");
  }
}
