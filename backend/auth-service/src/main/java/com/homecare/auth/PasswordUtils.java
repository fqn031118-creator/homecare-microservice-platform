package com.homecare.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public final class PasswordUtils {
    private static final String SHA_256_HEX_PATTERN = "^[a-f0-9]{64}$";

    private PasswordUtils() {
    }

    public static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte current : bytes) {
                builder.append(String.format("%02x", current));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("密码加密失败。", exception);
        }
    }

    public static boolean matches(String raw, String storedValue) {
        if (storedValue == null || storedValue.trim().isEmpty()) {
            return false;
        }

        String normalized = storedValue.trim();
        return normalized.equals(hash(raw)) || normalized.equals(raw);
    }

    public static boolean needsMigration(String storedValue) {
        if (storedValue == null) {
            return true;
        }
        return !storedValue.trim().matches(SHA_256_HEX_PATTERN);
    }
}
