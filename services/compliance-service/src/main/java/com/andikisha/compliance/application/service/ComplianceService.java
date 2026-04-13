package com.andikisha.compliance.application.service;

import com.andikisha.compliance.application.dto.response.ComplianceSummaryResponse;
import com.andikisha.compliance.application.dto.response.StatutoryRateResponse;
import com.andikisha.compliance.application.dto.response.TaxBracketResponse;
import com.andikisha.compliance.application.dto.response.TaxReliefResponse;
import com.andikisha.compliance.application.mapper.ComplianceMapper;
import com.andikisha.compliance.domain.exception.InvalidCountryCodeException;
import com.andikisha.compliance.domain.model.Country;
import com.andikisha.compliance.domain.repository.StatutoryRateRepository;
import com.andikisha.compliance.domain.repository.TaxBracketRepository;
import com.andikisha.compliance.domain.repository.TaxReliefRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ComplianceService {

    private final TaxBracketRepository taxBracketRepository;
    private final StatutoryRateRepository statutoryRateRepository;
    private final TaxReliefRepository taxReliefRepository;
    private final ComplianceMapper mapper;

    public ComplianceService(TaxBracketRepository taxBracketRepository,
                             StatutoryRateRepository statutoryRateRepository,
                             TaxReliefRepository taxReliefRepository,
                             ComplianceMapper mapper) {
        this.taxBracketRepository = taxBracketRepository;
        this.statutoryRateRepository = statutoryRateRepository;
        this.taxReliefRepository = taxReliefRepository;
        this.mapper = mapper;
    }

    public ComplianceSummaryResponse getComplianceSummary(String countryCode,
                                                          LocalDate effectiveDate) {
        Country country = parseCountry(countryCode);
        LocalDate asOf = effectiveDate != null ? effectiveDate : LocalDate.now();

        List<TaxBracketResponse> brackets = taxBracketRepository
                .findActiveByCountryAndDate(country, asOf)
                .stream().map(mapper::toResponse).toList();

        List<StatutoryRateResponse> rates = statutoryRateRepository
                .findActiveByCountryAndDate(country, asOf)
                .stream().map(mapper::toResponse).toList();

        List<TaxReliefResponse> reliefs = taxReliefRepository
                .findActiveByCountryAndDate(country, asOf)
                .stream().map(mapper::toResponse).toList();

        return new ComplianceSummaryResponse(
                country.name(), asOf.toString(), brackets, rates, reliefs);
    }

    public List<TaxBracketResponse> getTaxBrackets(String countryCode) {
        return getTaxBracketsAsOf(countryCode, LocalDate.now());
    }

    public List<TaxBracketResponse> getTaxBracketsAsOf(String countryCode, LocalDate asOf) {
        Country country = parseCountry(countryCode);
        return taxBracketRepository.findActiveByCountryAndDate(country, asOf)
                .stream().map(mapper::toResponse).toList();
    }

    public List<StatutoryRateResponse> getStatutoryRates(String countryCode) {
        return getStatutoryRatesAsOf(countryCode, LocalDate.now());
    }

    public List<StatutoryRateResponse> getStatutoryRatesAsOf(String countryCode, LocalDate asOf) {
        Country country = parseCountry(countryCode);
        return statutoryRateRepository.findActiveByCountryAndDate(country, asOf)
                .stream().map(mapper::toResponse).toList();
    }

    public List<TaxReliefResponse> getTaxReliefs(String countryCode) {
        return getTaxReliefsAsOf(countryCode, LocalDate.now());
    }

    public List<TaxReliefResponse> getTaxReliefsAsOf(String countryCode, LocalDate asOf) {
        Country country = parseCountry(countryCode);
        return taxReliefRepository.findActiveByCountryAndDate(country, asOf)
                .stream().map(mapper::toResponse).toList();
    }

    private Country parseCountry(String countryCode) {
        try {
            return Country.valueOf(countryCode.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidCountryCodeException(countryCode);
        }
    }
}
