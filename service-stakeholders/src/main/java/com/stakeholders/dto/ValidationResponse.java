package com.stakeholders.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidationResponse {
    private String username;
    private String role;
    private boolean valid;

    public ValidationResponse() {
    }

    public ValidationResponse(String username, String role, boolean b) {
        this.username = username;
        this.role = role;
        this.valid = b;
    }
}