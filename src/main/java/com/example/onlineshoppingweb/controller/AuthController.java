package com.example.onlineshoppingweb.controller;

import com.example.onlineshoppingweb.dto.ApiResponse;
import com.example.onlineshoppingweb.dto.AuthResponse;
import com.example.onlineshoppingweb.dto.LoginRequest;
import com.example.onlineshoppingweb.dto.RegisterRequest;
import com.example.onlineshoppingweb.model.Role;
import com.example.onlineshoppingweb.model.User;
import com.example.onlineshoppingweb.repository.UserRepository;
import com.example.onlineshoppingweb.security.JwtUtil;
import com.example.onlineshoppingweb.security.UserDetailsImpl;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository, 
                          PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(userDetails.getUsername()).get();
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", 
                new AuthResponse(jwt, user.getFullName(), user.getRole().name())));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Error: Email is already in use!", null));
        }

        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setFullName(signUpRequest.getFullName());
        user.setPasswordHash(encoder.encode(signUpRequest.getPassword()));
        user.setMobile(signUpRequest.getMobile());
        user.setCity(signUpRequest.getCity());
        user.setAddress(signUpRequest.getAddress());
        user.setRole(Role.USER); // Default to USER role

        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse<>(true, "User registered successfully!", null));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody RegisterRequest profileReq, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        user.setFullName(profileReq.getFullName());
        user.setMobile(profileReq.getMobile());
        user.setCity(profileReq.getCity());
        user.setAddress(profileReq.getAddress());
        
        userRepository.save(user);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully!", user));
    }
}
