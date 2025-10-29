package com.stakeholders.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test") // Osnovna putanja za ovaj kontroler
public class TestController {

    @GetMapping("/status")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ADMIN')")
    public String checkStatus() {
        return "Test endpoint radi!";
    }
}