package com.stakeholders.service;

import com.stakeholders.model.User;
import com.stakeholders.model.UserProfile;
import com.stakeholders.model.UserRole;
import com.stakeholders.repository.UserProfileRepository;
import com.stakeholders.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    @Autowired
    public UserService(UserRepository userRepository, UserProfileRepository userProfileRepository) {

        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public User blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        if (user.getRole() == UserRole.ROLE_ADMIN) {
            throw new RuntimeException("Cannot block administrator accounts");
        }
        
        user.setBlocked(true);
        return userRepository.save(user);
    }
    
    public User unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setBlocked(false);
        return userRepository.save(user);
    }
    
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public List<User> getBlockedUsers() {
        return userRepository.findByBlocked(true);
    }
    
    public List<User> getActiveUsers() {
        return userRepository.findByBlocked(false);
    }

    public Optional<UserProfile> getUserProfile(Long userId) {
        return userProfileRepository.findByUserId(userId);
    }

    public UserProfile createOrUpdateUserProfile(Long userId, String firstName, String lastName, String profilePictureUrl, String biography, String motto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Optional<UserProfile> existingProfile = userProfileRepository.findByUserId(userId);

        UserProfile profile;
        if (existingProfile.isPresent()) {
            profile = existingProfile.get();
        } else {
            profile = new UserProfile();
            profile.setUser(user);
        }

        profile.setFirstName(firstName);
        profile.setLastName(lastName);
        profile.setProfilePicture(profilePictureUrl);
        profile.setBiography(biography);
        profile.setMotto(motto);

        return userProfileRepository.save(profile);
    }
}

