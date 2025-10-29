package com.stakeholders.config;

import com.stakeholders.model.User;
import com.stakeholders.model.UserRole;
import com.stakeholders.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User("admin", "admin123", "admin@test.com", UserRole.ROLE_ADMIN);
            userRepository.save(admin);
            
            User vodic1 = new User("vodic1", "vodic123", "vodic1@test.com", UserRole.ROLE_GUIDE);
            userRepository.save(vodic1);
            
            User vodic2 = new User("vodic2", "vodic123", "vodic2@test.com", UserRole.ROLE_GUIDE);
            vodic2.setBlocked(true);
            userRepository.save(vodic2);
            
            User turista1 = new User("turista1", "turista123", "turista1@test.com", UserRole.ROLE_TOURIST);
            userRepository.save(turista1);
            
            User turista2 = new User("turista2", "turista123", "turista2@test.com", UserRole.ROLE_TOURIST);
            turista2.setBlocked(true);
            userRepository.save(turista2);
        }
    }
}

