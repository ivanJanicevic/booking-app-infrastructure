package com.stakeholders.service;


import com.stakeholders.dto.LoginRequest;
import com.stakeholders.dto.ValidationResponse;
import com.stakeholders.model.User;
import com.stakeholders.repository.UserRepository;
import com.stakeholders.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public User registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Korisničko ime '" + user.getUsername() + "' već postoji.");
        }

        user = userRepository.save(user);
        return user;
    }

    public String login(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Korisnik nije pronađen: " + loginRequest.getUsername()));
        
        if (user.isBlocked()) {
            throw new RuntimeException("Vaš nalog je blokiran. Molimo kontaktirajte administratora.");
        }
        
        if (!loginRequest.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Pogrešna lozinka.");
        }

        return jwtUtil.generateToken(user);
    }

    public ValidationResponse validateToken(String token) {
        try {
            if (jwtUtil.validateToken(token)) {
                Claims claims = jwtUtil.getAllClaimsFromToken(token);
                String username = claims.getSubject();

                User user = userRepository.findByUsername(username)
                        .orElseThrow(() -> new RuntimeException("Korisnik iz tokena ne postoji"));

                if (user.isBlocked()) {
                    throw new RuntimeException("Korisnik je blokiran");
                }

                String role = claims.get("role", String.class);
                return new ValidationResponse(username, role, true);
            }
        } catch (Exception e) {
            System.out.println("Token validacija nije uspela: " + e.getMessage());
        }
        return new ValidationResponse(null, null, false);
    }
}