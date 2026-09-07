package com.kovax.zipalink.service;

import com.kovax.zipalink.dto.AuthResponse;
import com.kovax.zipalink.dto.LoginRequest;
import com.kovax.zipalink.dto.RegisterRequest;
import com.kovax.zipalink.dto.UserResponse;
import com.kovax.zipalink.exception.EmailAlreadyInUseException;
import com.kovax.zipalink.model.Role;
import com.kovax.zipalink.model.User;
import com.kovax.zipalink.repository.UserRepository;
import com.kovax.zipalink.security.JwtService;
import com.kovax.zipalink.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyInUseException(email);
        }

        // Todo cadastro público nasce como USER. Promover alguém a ADMIN é uma
        // ação manual (via banco, ou por outro ADMIN através de um endpoint futuro) —
        // nunca deixamos o próprio cliente escolher a role no registro.
        User user = new User(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password()),
                Role.USER
        );
        User saved = userRepository.save(user);

        UserPrincipal principal = new UserPrincipal(saved);
        String token = jwtService.generateToken(principal);

        return AuthResponse.of(token, UserResponse.from(saved));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("E-mail ou senha inválidos.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos."));

        UserPrincipal principal = new UserPrincipal(user);
        String token = jwtService.generateToken(principal);

        return AuthResponse.of(token, UserResponse.from(user));
    }
}
