package com.stakeholders.controller;

import com.stakeholders.dto.LoginRequest;
import com.stakeholders.dto.LoginResponse;
import com.stakeholders.dto.ValidationResponse;
import com.stakeholders.model.User;
import com.stakeholders.model.UserProfile;
import com.stakeholders.service.AuthService;
import com.stakeholders.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @Autowired
    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            User registeredUser = authService.registerUser(user);
            userService.createOrUpdateUserProfile(registeredUser.getId(), "", "", "/uploads/profile-pictures/user.png", "", "");
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = authService.login(loginRequest);
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<ValidationResponse> validateToken(@RequestHeader("Authorization") String authHeader) {
        System.out.println("POZVAN JE VALIDATE");
        try {
            String token = authHeader.substring(7);
            ValidationResponse response = authService.validateToken(token);
            if (response.isValid()) {
                System.out.println("Validan token za korisnika: " + response.getUsername() + " sa ulogom: " + response.getRole());
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            // Log the exception if needed
        }
        System.out.println("Nevalidan token.");
        return new ResponseEntity<>(new ValidationResponse(null, null, false), HttpStatus.UNAUTHORIZED);
    }
}