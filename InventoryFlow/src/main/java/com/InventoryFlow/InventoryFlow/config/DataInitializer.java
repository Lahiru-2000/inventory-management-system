package com.InventoryFlow.InventoryFlow.config;

import com.InventoryFlow.InventoryFlow.entity.Role;
import com.InventoryFlow.InventoryFlow.entity.User;
import com.InventoryFlow.InventoryFlow.repository.RoleRepository;
import com.InventoryFlow.InventoryFlow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Initialize roles
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName(Role.RoleType.ADMIN);
            roleRepository.save(adminRole);

            Role managerRole = new Role();
            managerRole.setName(Role.RoleType.STORE_MANAGER);
            roleRepository.save(managerRole);

            Role staffRole = new Role();
            staffRole.setName(Role.RoleType.STAFF);
            roleRepository.save(staffRole);
        }

        // Initialize admin user
        if (!userRepository.existsByUsername("admin")) {
            Role adminRole = roleRepository.findByName(Role.RoleType.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@inventoryflow.com");
            admin.setFullName("Administrator");
            admin.setActive(true);
            admin.setRole(adminRole);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());

            userRepository.save(admin);
        }
    }
}


