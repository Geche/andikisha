package com.andikisha.compliance.domain.repository;

import com.andikisha.compliance.domain.model.Country;
import com.andikisha.compliance.domain.model.TaxBracket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaxBracketRepository extends JpaRepository<TaxBracket, UUID> {

    @Query("""
        SELECT tb FROM TaxBracket tb
        WHERE tb.tenantId = 'SYSTEM'
        AND tb.country = :country
        AND tb.active = true
        AND tb.effectiveFrom <= :asOf
        AND (tb.effectiveTo IS NULL OR tb.effectiveTo >= :asOf)
        ORDER BY tb.bandNumber ASC
        """)
    List<TaxBracket> findActiveByCountryAndDate(Country country, LocalDate asOf);

    List<TaxBracket> findByTenantIdAndCountryAndActiveTrue(String tenantId, Country country);
}