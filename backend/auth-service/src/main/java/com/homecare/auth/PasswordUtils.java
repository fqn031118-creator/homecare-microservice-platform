package com.homecare.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/** BCrypt for new credentials; SHA-256 migration only after successful legacy login. */
public final class PasswordUtils {
  private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder(12);

  private PasswordUtils() {}

  public static String hash(String raw) {
    return ENCODER.encode(raw);
  }

  public static boolean matches(String raw, String stored) {
    if (raw == null || stored == null) return false;
    if (stored.startsWith("$2")) return ENCODER.matches(raw, stored);
    if (!stored.matches("[a-f0-9]{64}")) return false;
    try {
      return MessageDigest.isEqual(
          HexFormat.of().parseHex(stored),
          MessageDigest.getInstance("SHA-256").digest(raw.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      return false;
    }
  }

  public static boolean needsMigration(String stored) {
    return stored == null || !stored.startsWith("$2");
  }
}
