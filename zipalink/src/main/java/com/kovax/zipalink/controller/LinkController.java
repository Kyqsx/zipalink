package com.kovax.zipalink.controller;

import com.kovax.zipalink.dto.CreateLinkRequest;
import com.kovax.zipalink.dto.LinkResponse;
import com.kovax.zipalink.security.UserPrincipal;
import com.kovax.zipalink.service.LinkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    /**
     * Público: dá pra encurtar sem estar logado. Se vier um Bearer token válido,
     * o link é automaticamente associado ao usuário autenticado (principal != null).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LinkResponse create(
            @Valid @RequestBody CreateLinkRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return linkService.createShortLink(request, principal != null ? principal.getUser() : null);
    }

    /** Links do usuário autenticado. */
    @GetMapping("/mine")
    public List<LinkResponse> listMine(@AuthenticationPrincipal UserPrincipal principal) {
        return linkService.listByOwner(principal.getUser());
    }

    /** Todos os links da plataforma — só ADMIN. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<LinkResponse> listAll() {
        return linkService.listAll();
    }

    /** Dono do link ou ADMIN pode remover. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        linkService.deleteLink(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}
