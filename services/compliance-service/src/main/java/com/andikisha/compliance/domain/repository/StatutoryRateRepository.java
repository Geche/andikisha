package com.andikisha.compliance.domain.repository;

import com.andikisha.compliance.domain.model.Country;
import com.andikisha.compliance.domain.model.StatutoryRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StatutoryRateRepository extends JpaRepository<StatutoryRate, UUID> {

    @Query("""
        SELECT sr FROM StatutoryRate sr
        WHERE sr.tenantId = 'SYSTEM'
        AND sr.country = :country
        AND sr.active = true
        AND sr.effectiveFrom <= :asOf
        AND (sr.effectiveTo IS NULL OR sr.effectiveTo >= :asOf)
        """)
    List<StatutoryRate> findActiveByCountryAndDate(Country country, LocalDate asOf);

    // Uses Pageable(0,1) at the call site instead of non-standard JPQL LIMIT clause
    @Query("""
        SELECT sr FROM StatutoryRate sr
        WHERE sr.tenantId = 'SYSTEM'
        AND sr.country = :country
        AND sr.rateType = :rateType
        AND sr.active = true
        AND sr.effectiveFrom <= :asOf
        AND (sr.effectiveTo IS NULL OR sr.effectiveTo >= :asOf)
        ORDER BY sr.effectiveFrom DESC
        """)
    List<StatutoryRate> findCurrentRates(Country country, String rateType,
                                         LocalDate asOf, Pageable pageable);

    default Optional<StatutoryRate> findCurrentRate(Country country,
                                                    String rateType, LocalDate asOf) {
        List<StatutoryRate> results = findCurrentRates(
                country, rateType, asOf,
                org.springframework.data.domain.PageRequest.of(0, 1));
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    List<StatutoryRate> findByTenantIdAndCountryAndActiveTrue(String tenantId, Country country);
}