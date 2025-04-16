package com.smartcampus.service;

import com.smartcampus.dto.UserDTO;
import com.smartcampus.model.User;
import com.smartcampus.model.Role;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.exception.UserNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;  // For password hashing

    // Create User
    public UserDTO createUser(UserDTO userDTO) {
    System.out.println("Inside createUser method in UserService");

    // Log the UserDTO received
    System.out.println("Received UserDTO: " + userDTO);
    System.out.println("Received password: " + userDTO.getPassword());

    if (userDTO.getPassword() == null || userDTO.getPassword().isEmpty()) {
        throw new IllegalArgumentException("Password is required");
    }

    // Hash the password
    String encodedPassword = passwordEncoder.encode(userDTO.getPassword());
    System.out.println("Encoded password: " + encodedPassword);  // Log the encoded password

    User user = convertToEntity(userDTO);  // Convert DTO to Entity
    user.setPassword(encodedPassword);  // Set hashed password
    System.out.println("User entity after setting password: " + user);

    User savedUser = userRepository.save(user);
    System.out.println("User saved successfully: " + savedUser);

    return convertToDTO(savedUser);  // Convert saved entity back to DTO
}


    // Update User
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        System.out.println("Attempting to update user with ID: " + id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> {
                    System.out.println("User with ID: " + id + " not found");
                    return new UserNotFoundException("User not found");
                });

        System.out.println("User with ID: " + id + " found, proceeding to update");

        // Update properties of the existing user
        existingUser.setUsername(userDTO.getUsername());
        existingUser.setFullName(userDTO.getFullName());
        existingUser.setEmail(userDTO.getEmail());
        existingUser.setPhoneNumber(userDTO.getPhoneNumber());
        existingUser.setRole(Role.valueOf(userDTO.getRole()));  // Assuming Role is an enum
        existingUser.setEnabled(userDTO.isEnabled());
        existingUser.setAccountNonExpired(userDTO.isAccountNonExpired());
        existingUser.setAccountNonLocked(userDTO.isAccountNonLocked());
        existingUser.setCredentialsNonExpired(userDTO.isCredentialsNonExpired());

        System.out.println("User with ID: " + id + " updated with new values.");
        System.out.println("New Username: " + existingUser.getUsername());
        System.out.println("New Full Name: " + existingUser.getFullName());
        System.out.println("New Email: " + existingUser.getEmail());
        System.out.println("New Phone Number: " + existingUser.getPhoneNumber());

        // If password is updated, hash it
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));  // Hash the new password
            System.out.println("Password updated and hashed for user with ID: " + id);
        }

        User updatedUser = userRepository.save(existingUser);
        System.out.println("User with ID: " + id + " successfully updated");

        return convertToDTO(updatedUser);
    }

    // Delete User
    public void deleteUser(Long id) {
        System.out.println("Attempting to delete user with ID: " + id);
        userRepository.deleteById(id);
        System.out.println("User with ID: " + id + " successfully deleted");
    }

    // Get User by ID
    public UserDTO getUserDTOById(Long id) {
        System.out.println("Attempting to get user with ID: " + id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    System.out.println("User with ID: " + id + " not found");
                    return new UserNotFoundException("User not found");
                });

        System.out.println("User with ID: " + id + " found: " + user.getUsername());

        return convertToDTO(user);
    }

    // Get all Users
    public List<UserDTO> getAllUsersDTO() {
        System.out.println("Fetching all users");

        List<User> users = userRepository.findAll();
        System.out.println("Found " + users.size() + " users");

        return users.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Get Users by Role
    public List<UserDTO> getUsersByRole(String role) {
        System.out.println("Fetching users with role: " + role);

        List<User> users = userRepository.findByRole(Role.valueOf(role)); // Assuming Role is an enum
        System.out.println("Found " + users.size() + " users with role: " + role);

        return users.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Convert UserDTO to User
    private User convertToEntity(UserDTO userDTO) {
        System.out.println("Converting UserDTO to User entity for: " + userDTO.getUsername());
        
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword()); // Password will be hashed later in the service
        user.setFullName(userDTO.getFullName());
        user.setEmail(userDTO.getEmail());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setRole(Role.valueOf(userDTO.getRole())); // Assuming Role is an enum
        user.setEnabled(userDTO.isEnabled());
        user.setAccountNonExpired(userDTO.isAccountNonExpired());
        user.setAccountNonLocked(userDTO.isAccountNonLocked());
        user.setCredentialsNonExpired(userDTO.isCredentialsNonExpired());

        return user;
    }

    // Convert User to UserDTO
    private UserDTO convertToDTO(User user) {
        System.out.println("Converting User entity to UserDTO for: " + user.getUsername());

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole().toString()); // Assuming role is an enum
        dto.setEnabled(user.isEnabled());
        dto.setAccountNonExpired(user.isAccountNonExpired());
        dto.setAccountNonLocked(user.isAccountNonLocked());
        dto.setCredentialsNonExpired(user.isCredentialsNonExpired());

        return dto;
    }
}
