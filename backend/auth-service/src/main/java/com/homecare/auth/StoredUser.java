package com.homecare.auth;

public class StoredUser {
  private long id;
  private String name;
  private String phone;
  private String passwordHash;
  private String role;
  private String levelName;
  private String avatar;
  private long createdAt;

  public long getId() {
    return id;
  }

  public void setId(long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public String getLevelName() {
    return levelName;
  }

  public void setLevelName(String levelName) {
    this.levelName = levelName;
  }

  public String getAvatar() {
    return avatar;
  }

  public void setAvatar(String avatar) {
    this.avatar = avatar;
  }

  public long getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(long createdAt) {
    this.createdAt = createdAt;
  }

  public StoredUser copy() {
    StoredUser user = new StoredUser();
    user.setId(id);
    user.setName(name);
    user.setPhone(phone);
    user.setPasswordHash(passwordHash);
    user.setRole(role);
    user.setLevelName(levelName);
    user.setAvatar(avatar);
    user.setCreatedAt(createdAt);
    return user;
  }
}
