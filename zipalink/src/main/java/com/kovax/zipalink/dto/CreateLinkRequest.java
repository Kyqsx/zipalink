package com.kovax.zipalink.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateLinkRequest(
        @NotBlank(message = "A URL é obrigatória")
        String url,

        String customCode
) {
}
