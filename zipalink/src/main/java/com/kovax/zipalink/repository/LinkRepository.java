package com.kovax.zipalink.repository;

import com.kovax.zipalink.model.Link;
import com.kovax.zipalink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LinkRepository extends JpaRepository<Link, Long> {

    Optional<Link> findByShortCode(String shortCode);

    boolean existsByShortCode(String shortCode);

    List<Link> findByOwnerOrderByCreatedAtDesc(User owner);
}
