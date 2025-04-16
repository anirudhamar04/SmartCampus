package com.smartcampus.controller;

import com.smartcampus.dto.UserDTO;
import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import com.smartcampus.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Autowired
    public AuthenticationController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            System.out.println("Login attempt with username: " + loginRequest.get("username"));
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.get("username"),
                    loginRequest.get("password")
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();
            String jwt = jwtUtil.generateToken(user);

            System.out.println("Login successful. JWT generated for user: " + user.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", convertToDTO(user));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error during login: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody User user) {
        // Log the incoming request to see if it's hitting the controller
        System.out.println("Inside register method");
        System.out.println("Received user: " + user);

        // Log the user password
        System.out.println("User password: " + user.getPassword());

        // Convert User to UserDTO
        UserDTO userDTO = convertToDTO(user);
        System.out.println("Converted UserDTO: " + userDTO);

        // Call the userService to create the user
        UserDTO createdUser = userService.createUser(userDTO);
        System.out.println("User created successfully: " + createdUser);

        return ResponseEntity.ok(createdUser);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            System.out.println("Current authenticated user: " + user.getUsername());
            return ResponseEntity.ok(convertToDTO(user));
        }
        System.out.println("User not authenticated");
        return ResponseEntity.badRequest().body("User not authenticated");
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setPassword(user.getPassword());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().toString());
        dto.setEnabled(user.isEnabled());
        dto.setAccountNonExpired(user.isAccountNonExpired());
        dto.setAccountNonLocked(user.isAccountNonLocked());
        dto.setCredentialsNonExpired(user.isCredentialsNonExpired());

        // Log the converted UserDTO
        System.out.println("Converted UserDTO: " + dto);
        return dto;
    }
}
