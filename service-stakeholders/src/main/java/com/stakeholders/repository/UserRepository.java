package com.stakeholders.repository;

import com.stakeholders.model.User;
import com.stakeholders.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByBlocked(boolean blocked);

    List<User> findByRoleAndBlocked(UserRole role, boolean blocked);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);
}

