package com.kovax.zipalink.dto.auth;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email,
        String role
) {
}
