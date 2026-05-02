package com.andikisha.compliance.unit;

import com.andikisha.compliance.application.mapper.ComplianceMapper;
import com.andikisha.compliance.application.service.ComplianceService;
import com.andikisha.compliance.domain.model.Country;
import com.andikisha.compliance.domain.repository.StatutoryRateRepository;
import com.andikisha.compliance.domain.repository.TaxBracketRepository;
import com.andikisha.compliance.domain.repository.TaxReliefRepository;
import com.andikisha.compliance.infrastructure.config.CacheConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {
        ComplianceService.class,
        CacheConfig.class,
        ComplianceServiceCacheTest.TestCacheManagerConfig.class
})
class ComplianceServiceCacheTest {

    /**
     * Override the Redis CacheManager with an in-memory one so this test
     * does not require a running Redis server.
     */
    @Configuration
    @EnableCaching
    static class TestCacheManagerConfig {
        @Bean
        ConcurrentMapCacheManager cacheManager() {
            return new ConcurrentMapCacheManager("tax-brackets", "statutory-rates", "tax-reliefs");
        }
    }

    @MockitoBean
    TaxBracketRepository taxBracketRepository;
    @MockitoBean
    StatutoryRateRepository statutoryRateRepository;
    @MockitoBean
    TaxReliefRepository taxReliefRepository;
    @MockitoBean
    ComplianceMapper mapper;

    @Autowired
    ComplianceService service;

    @Autowired
    CacheManager cacheManager;

    /** Clear all caches between tests so each test starts with a cold cache. */
    @BeforeEach
    void clearCaches() {
        cacheManager.getCacheNames().forEach(name -> {
            var cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.clear();
            }
        });
    }

    // ------------------------------------------------------------------
    // Tax brackets
    // ------------------------------------------------------------------

    @Test
    void getTaxBracketsAsOf_cachedAfterFirstCall_repositoryCalledOnce() {
        LocalDate date = LocalDate.of(2026, 4, 1);
        when(taxBracketRepository.findActiveByCountryAndDate(eq(Country.KE), eq(date)))
                .thenReturn(List.of());

        service.getTaxBracketsAsOf("KE", date);
        service.getTaxBracketsAsOf("KE", date);

        verify(taxBracketRepository, times(1)).findActiveByCountryAndDate(eq(Country.KE), eq(date));
    }

    @Test
    void getTaxBracketsAsOf_differentKeys_repositoryCalledForEachKey() {
        LocalDate date1 = LocalDate.of(2026, 4, 1);
        LocalDate date2 = LocalDate.of(2026, 5, 1);
        when(taxBracketRepository.findActiveByCountryAndDate(any(), any())).thenReturn(List.of());

        service.getTaxBracketsAsOf("KE", date1);
        service.getTaxBracketsAsOf("KE", date2);

        verify(taxBracketRepository, times(1)).findActiveByCountryAndDate(eq(Country.KE), eq(date1));
        verify(taxBracketRepository, times(1)).findActiveByCountryAndDate(eq(Country.KE), eq(date2));
    }

    // ------------------------------------------------------------------
    // Statutory rates
    // ------------------------------------------------------------------

    @Test
    void getStatutoryRatesAsOf_cachedAfterFirstCall_repositoryCalledOnce() {
        LocalDate date = LocalDate.of(2026, 4, 1);
        when(statutoryRateRepository.findActiveByCountryAndDate(eq(Country.KE), eq(date)))
                .thenReturn(List.of());

        service.getStatutoryRatesAsOf("KE", date);
        service.getStatutoryRatesAsOf("KE", date);

        verify(statutoryRateRepository, times(1)).findActiveByCountryAndDate(eq(Country.KE), eq(date));
    }

    // ------------------------------------------------------------------
    // Tax reliefs
    // ------------------------------------------------------------------

    @Test
    void getTaxReliefsAsOf_cachedAfterFirstCall_repositoryCalledOnce() {
        LocalDate date = LocalDate.of(2026, 4, 1);
        when(taxReliefRepository.findActiveByCountryAndDate(eq(Country.KE), eq(date)))
                .thenReturn(List.of());

        service.getTaxReliefsAsOf("KE", date);
        service.getTaxReliefsAsOf("KE", date);

        verify(taxReliefRepository, times(1)).findActiveByCountryAndDate(eq(Country.KE), eq(date));
    }
}
