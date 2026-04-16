package com.fintrack.service;

import com.fintrack.config.JwtUtils;
import com.fintrack.dto.AuthResponse;
import com.fintrack.dto.LoginRequest;
import com.fintrack.dto.RegisterRequest;
import com.fintrack.entity.Category;
import com.fintrack.entity.User;
import com.fintrack.repository.CategoryRepository;
import com.fintrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .build();

        user = userRepository.save(user);

        // Seed default categories
        seedDefaultCategories(user);

        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .build();
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(String email, String fullName, String currency) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (fullName != null && !fullName.isBlank()) user.setFullName(fullName);
        if (currency != null && !currency.isBlank()) user.setCurrency(currency);
        return userRepository.save(user);
    }

    private void seedDefaultCategories(User user) {
        List<Category> defaults = List.of(
                Category.builder().name("Salary").type("INCOME").icon("💰").color("#10b981").user(user).build(),
                Category.builder().name("Freelance").type("INCOME").icon("💻").color("#06b6d4").user(user).build(),
                Category.builder().name("Investments").type("INCOME").icon("📈").color("#8b5cf6").user(user).build(),
                Category.builder().name("Other Income").type("INCOME").icon("🎁").color("#f59e0b").user(user).build(),
                Category.builder().name("Food & Dining").type("EXPENSE").icon("🍔").color("#ef4444").user(user).build(),
                Category.builder().name("Transportation").type("EXPENSE").icon("🚗").color("#f97316").user(user).build(),
                Category.builder().name("Shopping").type("EXPENSE").icon("🛒").color("#ec4899").user(user).build(),
                Category.builder().name("Entertainment").type("EXPENSE").icon("🎬").color("#a855f7").user(user).build(),
                Category.builder().name("Bills & Utilities").type("EXPENSE").icon("💡").color("#eab308").user(user).build(),
                Category.builder().name("Healthcare").type("EXPENSE").icon("🏥").color("#14b8a6").user(user).build(),
                Category.builder().name("Education").type("EXPENSE").icon("📚").color("#6366f1").user(user).build(),
                Category.builder().name("Rent").type("EXPENSE").icon("🏠").color("#78716c").user(user).build()
        );
        categoryRepository.saveAll(defaults);
    }
}
