package com.andikisha.compliance.domain.repository;

import com.andikisha.compliance.domain.model.Country;
import com.andikisha.compliance.domain.model.TaxRelief;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaxReliefRepository extends JpaRepository<TaxRelief, UUID> {

    @Query("""
        SELECT tr FROM TaxRelief tr
        WHERE tr.tenantId = 'SYSTEM'
        AND tr.country = :country
        AND tr.active = true
        AND tr.effectiveFrom <= :asOf
        AND (tr.effectiveTo IS NULL OR tr.effectiveTo >= :asOf)
        """)
    List<TaxRelief> findActiveByCountryAndDate(Country country, LocalDate asOf);
}