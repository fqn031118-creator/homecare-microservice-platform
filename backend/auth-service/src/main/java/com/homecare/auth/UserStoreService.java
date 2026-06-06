package com.homecare.auth;

import jakarta.annotation.PostConstruct;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;

@Service
public class UserStoreService {
    private static final RowMapper<StoredUser> USER_ROW_MAPPER = (resultSet, rowNum) -> {
        StoredUser user = new StoredUser();
        user.setId(resultSet.getLong("id"));
        user.setName(resultSet.getString("name"));
        user.setPhone(resultSet.getString("phone"));
        user.setPasswordHash(resultSet.getString("password"));
        user.setRole(resultSet.getString("role"));
        user.setLevelName(resultSet.getString("level_name"));
        user.setAvatar(resultSet.getString("avatar_url"));

        Timestamp createdAt = resultSet.getTimestamp("created_at");
        user.setCreatedAt(createdAt == null ? 0L : createdAt.getTime());
        return user;
    };

    private final JdbcTemplate jdbcTemplate;

    public UserStoreService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void init() {
        ensureDemoUser("林然", "13800000000", "123456", "customer", "尊享会员");
        ensureDemoUser("Sarah Jenkins", "13900000000", "123456", "provider", "服务人员");
        ensureDemoUser("James Wilson", "13700000000", "123456", "admin", "平台管理员");
    }

    public StoredUser findByPhone(String phone) {
        List<StoredUser> users = jdbcTemplate.query(
            "SELECT id, name, phone, password, role, level_name, avatar_url, created_at FROM users WHERE phone = ? LIMIT 1",
            USER_ROW_MAPPER,
            phone
        );
        return users.isEmpty() ? null : users.get(0);
    }

    public StoredUser createCustomer(String name, String phone, String passwordHash) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO users (name, phone, password, role, level_name) VALUES (?, ?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS
            );
            statement.setString(1, name);
            statement.setString(2, phone);
            statement.setString(3, passwordHash);
            statement.setString(4, "customer");
            statement.setString(5, "普通会员");
            return statement;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("创建用户失败，未返回主键。");
        }
        return requireById(key.longValue());
    }

    public void updatePasswordHash(long userId, String passwordHash) {
        jdbcTemplate.update("UPDATE users SET password = ? WHERE id = ?", passwordHash, userId);
    }

    public StoredUser findById(long id) {
        List<StoredUser> users = jdbcTemplate.query(
            "SELECT id, name, phone, password, role, level_name, avatar_url, created_at FROM users WHERE id = ? LIMIT 1",
            USER_ROW_MAPPER,
            id
        );
        return users.isEmpty() ? null : users.get(0);
    }

    public StoredUser updateProfile(long userId, String name, String phone, String avatar) {
        int updated = jdbcTemplate.update(
            "UPDATE users SET name = ?, phone = ?, avatar_url = ? WHERE id = ?",
            name,
            phone,
            avatar,
            userId
        );
        if (updated == 0) {
            throw new IllegalStateException("更新用户资料失败。");
        }
        return requireById(userId);
    }

    private StoredUser requireById(long id) {
        List<StoredUser> users = jdbcTemplate.query(
            "SELECT id, name, phone, password, role, level_name, avatar_url, created_at FROM users WHERE id = ? LIMIT 1",
            USER_ROW_MAPPER,
            id
        );
        if (users.isEmpty()) {
            throw new IllegalStateException("查询新建用户失败。");
        }
        return users.get(0);
    }

    private void ensureDemoUser(String name, String phone, String rawPassword, String role, String levelName) {
        StoredUser existingUser = findByPhone(phone);
        String hashedPassword = PasswordUtils.hash(rawPassword);

        if (existingUser == null) {
            jdbcTemplate.update(
                "INSERT INTO users (name, phone, password, role, level_name) VALUES (?, ?, ?, ?, ?)",
                name,
                phone,
                hashedPassword,
                role,
                levelName
            );
            return;
        }

        boolean shouldUpgradePassword = PasswordUtils.needsMigration(existingUser.getPasswordHash())
            && PasswordUtils.matches(rawPassword, existingUser.getPasswordHash());
        boolean shouldRefreshProfile = !name.equals(existingUser.getName())
            || !role.equals(existingUser.getRole())
            || !levelName.equals(existingUser.getLevelName());

        if (shouldUpgradePassword || shouldRefreshProfile) {
            jdbcTemplate.update(
                "UPDATE users SET name = ?, password = ?, role = ?, level_name = ? WHERE id = ?",
                name,
                shouldUpgradePassword ? hashedPassword : existingUser.getPasswordHash(),
                role,
                levelName,
                existingUser.getId()
            );
        }
    }
}
