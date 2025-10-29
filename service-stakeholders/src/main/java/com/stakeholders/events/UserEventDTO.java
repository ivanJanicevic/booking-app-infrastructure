package com.stakeholders.events;

public class UserEventDTO {
    private Long userId;

    public UserEventDTO() {
    }

    public UserEventDTO(Long userId) {
        this.userId = userId;
    }

    // Getteri i setteri
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
