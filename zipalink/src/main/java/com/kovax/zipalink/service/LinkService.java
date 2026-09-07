package com.kovax.zipalink.service;

import com.kovax.zipalink.dto.CreateLinkRequest;
import com.kovax.zipalink.dto.LinkResponse;
import com.kovax.zipalink.exception.InvalidUrlException;
import com.kovax.zipalink.exception.LinkNotFoundException;
import com.kovax.zipalink.model.Link;
import com.kovax.zipalink.model.Role;
import com.kovax.zipalink.model.User;
import com.kovax.zipalink.repository.LinkRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URISyntaxException;
import java.security.SecureRandom;
import java.util.List;

@Service
public class LinkService {

    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int DEFAULT_CODE_LENGTH = 7;
    private static final int MAX_GENERATION_ATTEMPTS = 10;

    private final LinkRepository linkRepository;
    private final SecureRandom random = new SecureRandom();
    private final String baseUrl;

    public LinkService(LinkRepository linkRepository,
                        @Value("${app.base-url:http://localhost:8080}") String baseUrl) {
        this.linkRepository = linkRepository;
        this.baseUrl = baseUrl;
    }

    @Transactional
    public LinkResponse createShortLink(CreateLinkRequest request, User owner) {
        String normalizedUrl = normalizeAndValidateUrl(request.url());

        String shortCode = (request.customCode() != null && !request.customCode().isBlank())
                ? validateCustomCode(request.customCode())
                : generateUniqueCode();

        Link link = new Link(shortCode, normalizedUrl, owner);
        Link saved = linkRepository.save(link);
        return LinkResponse.from(saved, baseUrl);
    }

    @Transactional
    public Link resolveAndRegisterClick(String shortCode) {
        Link link = linkRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new LinkNotFoundException(shortCode));
        link.registerClick();
        return link;
    }

    @Transactional(readOnly = true)
    public List<LinkResponse> listAll() {
        return linkRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(link -> LinkResponse.from(link, baseUrl))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LinkResponse> listByOwner(User owner) {
        return linkRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
                .map(link -> LinkResponse.from(link, baseUrl))
                .toList();
    }

    @Transactional
    public void deleteLink(Long id, User requester) {
        Link link = linkRepository.findById(id)
                .orElseThrow(() -> new LinkNotFoundException("id " + id));

        boolean isOwner = link.getOwner() != null && link.getOwner().getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Você não tem permissão para remover este link.");
        }

        linkRepository.delete(link);
    }

    private String validateCustomCode(String customCode) {
        String trimmed = customCode.trim();
        if (!trimmed.matches("[A-Za-z0-9_-]{3,16}")) {
            throw new InvalidUrlException(
                    "O código customizado deve ter entre 3 e 16 caracteres alfanuméricos (também aceita '-' e '_').");
        }
        if (linkRepository.existsByShortCode(trimmed)) {
            throw new InvalidUrlException("Esse código já está em uso, escolha outro.");
        }
        return trimmed;
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            String candidate = randomCode(DEFAULT_CODE_LENGTH);
            if (!linkRepository.existsByShortCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Não foi possível gerar um código único, tente novamente.");
    }

    private String randomCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    private String normalizeAndValidateUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new InvalidUrlException("A URL não pode estar vazia.");
        }

        String candidate = rawUrl.trim();
        if (!candidate.matches("^[a-zA-Z][a-zA-Z0-9+.-]*://.*")) {
            candidate = "https://" + candidate;
        }

        try {
            URI uri = new URI(candidate);
            String scheme = uri.getScheme();
            if (scheme == null || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                throw new InvalidUrlException("Apenas URLs http:// ou https:// são permitidas.");
            }
            if (uri.getHost() == null || uri.getHost().isBlank()) {
                throw new InvalidUrlException("URL inválida: host não identificado.");
            }
            return uri.toString();
        } catch (URISyntaxException e) {
            throw new InvalidUrlException("URL inválida: " + rawUrl);
        }
    }
}
