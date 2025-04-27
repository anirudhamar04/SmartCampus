package com.smartcampus.dto;

public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String role;
    private boolean enabled;
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;

    // Getters
    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
        System.out.println("Set ID: " + id);
    }

    public void setUsername(String username) {
        this.username = username;
        System.out.println("Set Username: " + username);
    }

    public void setPassword(String password) {
        this.password = password;
        System.out.println("Set Password: " + password);  // You may want to hide password in logs in production!
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        System.out.println("Set FullName: " + fullName);
    }

    public void setEmail(String email) {
        this.email = email;
        System.out.println("Set Email: " + email);
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
        System.out.println("Set PhoneNumber: " + phoneNumber);
    }

    public void setRole(String role) {
        this.role = role;
        System.out.println("Set Role: " + role);
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        System.out.println("Set Enabled: " + enabled);
    }

    public void setAccountNonExpired(boolean accountNonExpired) {
        this.accountNonExpired = accountNonExpired;
        System.out.println("Set AccountNonExpired: " + accountNonExpired);
    }

    public void setAccountNonLocked(boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
        System.out.println("Set AccountNonLocked: " + accountNonLocked);
    }

    public void setCredentialsNonExpired(boolean credentialsNonExpired) {
        this.credentialsNonExpired = credentialsNonExpired;
        System.out.println("Set CredentialsNonExpired: " + credentialsNonExpired);
    }
}
