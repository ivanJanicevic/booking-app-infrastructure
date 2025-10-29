package com.stakeholders.controller;

import com.stakeholders.model.User;
import com.stakeholders.model.UserProfile;
import com.stakeholders.model.UserRole;
import com.stakeholders.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/users")
//@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService userService;
    private static final String UPLOAD_DIR = "uploads/profile-pictures/";

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            System.err.println("Failed to create upload directory: " + e.getMessage());
        }
    }

    private boolean isAdmin(String username) {
        if (username == null) return false;
        // In a real implementation, you would check the user's role from database
        // For now, return true if user exists (this should be improved)
        return userService.getUserByUsername(username)
            .map(user -> user.getRole().equals(UserRole.ROLE_ADMIN))
            .orElse(false);
    }
    
    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "X-Username", required = false) String username) {
        if (username == null || !isAdmin(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Samo administratori mogu pristupiti ovoj funkciji");
        }
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> user = userService.getUserByUsername(username);
        return user.map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id, 
                                      @RequestHeader(value = "X-Username", required = false) String username) {
        if (username == null || !isAdmin(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Samo administratori mogu pristupiti ovoj funkciji");
        }
        try {
            User user = userService.blockUser(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id, 
                                         @RequestHeader(value = "X-Username", required = false) String username) {
        if (username == null || !isAdmin(username)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Samo administratori mogu pristupiti ovoj funkciji");
        }
        try {
            User user = userService.unblockUser(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/blocked")
    public ResponseEntity<List<User>> getBlockedUsers() {
        List<User> users = userService.getBlockedUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<User>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfile> getUserProfile(@PathVariable Long userId) {
        Optional<UserProfile> userProfile = userService.getUserProfile(userId);
        return userProfile.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/profile/{userId}")
    public ResponseEntity<UserProfile> createOrUpdateUserProfile(@PathVariable Long userId, @RequestBody UserProfile profileDetails) {
        try {
            UserProfile updatedProfile = userService.createOrUpdateUserProfile(
                    userId,
                    profileDetails.getFirstName(),
                    profileDetails.getLastName(),
                    profileDetails.getProfilePicture(), // Ovo će sada biti URL
                    profileDetails.getBiography(),
                    profileDetails.getMotto()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(updatedProfile);
        } catch (RuntimeException e) {
            // Logovati e.getMessage() za bolji uvid
            System.err.println("Error creating or updating user profile: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/profile/upload-picture/{userId}")
    public ResponseEntity<String> uploadProfilePicture(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload.");
        }
        System.out.println("Radi slika1");
        try {
            // Generisanje jedinstvenog imena fajla
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String newFileName = UUID.randomUUID().toString() + fileExtension;

            Path uploadPath = Paths.get(UPLOAD_DIR);
            Path filePath = uploadPath.resolve(newFileName);

            Files.copy(file.getInputStream(), filePath);
            System.out.println("Radi slika2");

            // Vrati relativnu putanju/URL do slike
            // Važno: Ovu putanju će front-end koristiti za prikaz,
            // a backend će je čuvati u bazi.
            // Morate obezbediti da je 'uploads/profile-pictures/' dostupna putem HTTP-a (npr. preko Spring Boot static resource handlera)
            String imageUrl = "/uploads/profile-pictures/" + newFileName;
            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            System.err.println("Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file.");
        }
    }
}

