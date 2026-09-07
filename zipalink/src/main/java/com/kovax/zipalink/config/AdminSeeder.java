package com.kovax.zipalink.config;

import com.kovax.zipalink.model.Role;
import com.kovax.zipalink.model.User;
import com.kovax.zipalink.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;
    private final String adminName;

    public AdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword,
            @Value("${app.admin.name}") String adminName
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminName = adminName;
    }

    @Override
    public void run(String... args) {
        boolean hasAdmin = userRepository.findAll().stream()
                .anyMatch(user -> user.getRole() == Role.ADMIN);

        if (hasAdmin) {
            return;
        }

        User admin = new User(adminName, adminEmail, passwordEncoder.encode(adminPassword), Role.ADMIN);
        userRepository.save(admin);

        log.warn("Nenhum ADMIN encontrado — criado automaticamente: {} (troque a senha padrão assim que logar!)",
                adminEmail);
    }
}
