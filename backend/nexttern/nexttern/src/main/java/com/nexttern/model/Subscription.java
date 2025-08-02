package com.nexttern.model;

/**
 * Model class for user keyword subscriptions from Supabase
 */
public class Subscription {
    
    private String id;
    private String userId;
    private String keyword;
    private String createdAt;
    
    // Default constructor
    public Subscription() {
    }
    
    // All-args constructor
    public Subscription(String id, String userId, String keyword, String createdAt) {
        this.id = id;
        this.userId = userId;
        this.keyword = keyword;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getKeyword() {
        return keyword;
    }
    
    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
    
    public String getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "Subscription{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", keyword='" + keyword + '\'' +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}
