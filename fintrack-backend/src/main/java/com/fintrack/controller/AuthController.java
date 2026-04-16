package com.fintrack.controller;

import com.fintrack.dto.AuthResponse;
import com.fintrack.dto.LoginRequest;
import com.fintrack.dto.RegisterRequest;
import com.fintrack.entity.User;
import com.fintrack.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        User user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "currency", user.getCurrency()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User user = authService.updateProfile(authentication.getName(),
                body.get("fullName"), body.get("currency"));
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "currency", user.getCurrency()
        ));
    }
}
