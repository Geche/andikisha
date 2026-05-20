package com.andikisha.tenant.application.service;

import com.andikisha.tenant.domain.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class SlugGeneratorService {

    private final TenantRepository tenantRepository;

    public SlugGeneratorService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    /**
     * Generates a unique kebab-case slug.
     * If {@code requested} is non-blank, sanitises and deduplicates it.
     * Otherwise derives the slug from {@code organisationName}.
     */
    public String generate(String organisationName, String requested) {
        String base = (requested != null && !requested.isBlank())
                ? toSlug(requested)
                : toSlug(organisationName);
        return deduplicate(base);
    }

    /** Converts free text to kebab-case, max 50 chars. */
    public static String toSlug(String name) {
        String slug = name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.length() > 50 ? slug.substring(0, 50).replaceAll("-+$", "") : slug;
    }

    private String deduplicate(String base) {
        if (!tenantRepository.existsByWorkspaceSlug(base)) {
            return base;
        }
        String truncBase = base.length() > 47 ? base.substring(0, 47) : base;
        int n = 1;
        String candidate;
        do {
            candidate = truncBase + "-" + n;
            n++;
        } while (tenantRepository.existsByWorkspaceSlug(candidate));
        return candidate;
    }
}
