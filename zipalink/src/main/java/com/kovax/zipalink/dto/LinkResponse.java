package com.kovax.zipalink.dto;

import com.kovax.zipalink.model.Link;

import java.time.Instant;

public record LinkResponse(
        Long id,
        String shortCode,
        String shortUrl,
        String originalUrl,
        long clicks,
        Instant createdAt,
        String ownerName
) {
    public static LinkResponse from(Link link, String baseUrl) {
        String normalizedBase = baseUrl.endsWith("/")
                ? baseUrl.substring(0, baseUrl.length() - 1)
                : baseUrl;

        return new LinkResponse(
                link.getId(),
                link.getShortCode(),
                normalizedBase + "/" + link.getShortCode(),
                link.getOriginalUrl(),
                link.getClicks(),
                link.getCreatedAt(),
                link.getOwner() != null ? link.getOwner().getName() : null
        );
    }
}
