package com.andikisha.compliance.unit;

import com.andikisha.compliance.application.dto.response.ComplianceSummaryResponse;
import com.andikisha.compliance.application.dto.response.StatutoryRateResponse;
import com.andikisha.compliance.application.dto.response.TaxBracketResponse;
import com.andikisha.compliance.application.mapper.ComplianceMapper;
import com.andikisha.compliance.application.service.ComplianceService;
import com.andikisha.compliance.domain.model.Country;
import com.andikisha.compliance.domain.model.StatutoryRate;
import com.andikisha.compliance.domain.model.TaxBracket;
import com.andikisha.compliance.domain.model.TaxRelief;
import com.andikisha.compliance.domain.repository.StatutoryRateRepository;
import com.andikisha.compliance.domain.repository.TaxBracketRepository;
import com.andikisha.compliance.domain.repository.TaxReliefRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComplianceServiceTest {

    @Mock TaxBracketRepository taxBracketRepository;
    @Mock StatutoryRateRepository statutoryRateRepository;
    @Mock TaxReliefRepository taxReliefRepository;

    ComplianceService service;

    private static final LocalDate EFFECTIVE_DATE = LocalDate.of(2025, 1, 1);

    @BeforeEach
    void setUp() {
        ComplianceMapper mapper = Mappers.getMapper(ComplianceMapper.class);
        service = new ComplianceService(taxBracketRepository, statutoryRateRepository,
                taxReliefRepository, mapper);
    }

    // ------------------------------------------------------------------
    // getComplianceSummary
    // ------------------------------------------------------------------

    @Test
    void getComplianceSummary_returnsBracketsRatesAndReliefs() {
        TaxBracket band1 = taxBracket(1, "0", "24000", "0.10");
        StatutoryRate nssf  = statutoryRate("NSSF", "0.06", "7000", "36000", null);
        TaxRelief personalRelief = taxReliefMock("PERSONAL_RELIEF", "2400", null, null);

        when(taxBracketRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of(band1));
        when(statutoryRateRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of(nssf));
        when(taxReliefRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of(personalRelief));

        ComplianceSummaryResponse result = service.getComplianceSummary("KE", EFFECTIVE_DATE);

        assertThat(result.country()).isEqualTo("KE");
        assertThat(result.taxBrackets()).hasSize(1);
        assertThat(result.taxBrackets().get(0).bandNumber()).isEqualTo(1);
        assertThat(result.taxBrackets().get(0).rate()).isEqualByComparingTo("0.10");
        assertThat(result.statutoryRates()).hasSize(1);
        assertThat(result.statutoryRates().get(0).rateType()).isEqualTo("NSSF");
        assertThat(result.taxReliefs()).hasSize(1);
        assertThat(result.taxReliefs().get(0).reliefType()).isEqualTo("PERSONAL_RELIEF");
    }

    @Test
    void getComplianceSummary_nullEffectiveDate_defaultsToToday() {
        when(taxBracketRepository.findActiveByCountryAndDate(any(), any())).thenReturn(List.of());
        when(statutoryRateRepository.findActiveByCountryAndDate(any(), any())).thenReturn(List.of());
        when(taxReliefRepository.findActiveByCountryAndDate(any(), any())).thenReturn(List.of());

        ComplianceSummaryResponse result = service.getComplianceSummary("KE", null);

        assertThat(result.effectiveDate()).isEqualTo(LocalDate.now().toString());
    }

    @Test
    void getComplianceSummary_invalidCountryCode_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> service.getComplianceSummary("XX", EFFECTIVE_DATE))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getComplianceSummary_countryCodeIsCaseInsensitive() {
        when(taxBracketRepository.findActiveByCountryAndDate(eq(Country.KE), any())).thenReturn(List.of());
        when(statutoryRateRepository.findActiveByCountryAndDate(eq(Country.KE), any())).thenReturn(List.of());
        when(taxReliefRepository.findActiveByCountryAndDate(eq(Country.KE), any())).thenReturn(List.of());

        ComplianceSummaryResponse result = service.getComplianceSummary("ke", EFFECTIVE_DATE);
        assertThat(result.country()).isEqualTo("KE");
    }

    // ------------------------------------------------------------------
    // getTaxBrackets
    // ------------------------------------------------------------------

    @Test
    void getTaxBrackets_mapsBandNumberLowerUpperAndRate() {
        TaxBracket band2 = taxBracket(2, "24000.01", "32300", "0.25");
        when(taxBracketRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of(band2));

        List<TaxBracketResponse> result = service.getTaxBrackets("KE");

        assertThat(result).hasSize(1);
        TaxBracketResponse r = result.get(0);
        assertThat(r.bandNumber()).isEqualTo(2);
        assertThat(r.lowerBound()).isEqualByComparingTo("24000.01");
        assertThat(r.upperBound()).isEqualByComparingTo("32300");
        assertThat(r.rate()).isEqualByComparingTo("0.25");
    }

    @Test
    void getTaxBrackets_topBracketHasNullUpperBound() {
        TaxBracket band5 = taxBracket(5, "800000.01", null, "0.35");
        when(taxBracketRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of(band5));

        List<TaxBracketResponse> result = service.getTaxBrackets("KE");

        assertThat(result.get(0).upperBound()).isNull();
    }

    // ------------------------------------------------------------------
    // getStatutoryRates
    // ------------------------------------------------------------------

    @Test
    void getStatutoryRates_mapsAllMandatoryFields() {
        StatutoryRate shif = statutoryRate("SHIF", "0.0275", null, null, null);
        when(statutoryRateRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of(shif));

        List<StatutoryRateResponse> result = service.getStatutoryRates("KE");

        assertThat(result).hasSize(1);
        StatutoryRateResponse r = result.get(0);
        assertThat(r.rateType()).isEqualTo("SHIF");
        assertThat(r.rateValue()).isEqualByComparingTo("0.0275");
    }

    @Test
    void getStatutoryRates_nssfHasTierLimits() {
        StatutoryRate nssf = statutoryRate("NSSF", "0.06", "7000", "36000", null);
        when(statutoryRateRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of(nssf));

        List<StatutoryRateResponse> result = service.getStatutoryRates("KE");

        StatutoryRateResponse r = result.get(0);
        assertThat(r.limitAmount()).isEqualByComparingTo("7000");
        assertThat(r.secondaryLimit()).isEqualByComparingTo("36000");
    }

    @Test
    void getStatutoryRates_nitaHasFixedAmount() {
        StatutoryRate nita = statutoryRate("NITA", "0", null, null, "50");
        when(statutoryRateRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of(nita));

        List<StatutoryRateResponse> result = service.getStatutoryRates("KE");

        assertThat(result.get(0).fixedAmount()).isEqualByComparingTo("50");
    }

    @Test
    void getStatutoryRates_callsRepositoryWithCurrentDate() {
        when(statutoryRateRepository.findActiveByCountryAndDate(eq(Country.KE), any()))
                .thenReturn(List.of());

        service.getStatutoryRates("KE");

        verify(statutoryRateRepository).findActiveByCountryAndDate(eq(Country.KE), any());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private TaxBracket taxBracket(int band, String lower, String upper, String rate) {
        return TaxBracket.create(
                "SYSTEM", Country.KE, band,
                new BigDecimal(lower),
                upper != null ? new BigDecimal(upper) : null,
                new BigDecimal(rate),
                LocalDate.of(2024, 7, 1));
    }

    private StatutoryRate statutoryRate(String type, String rate,
                                        String limit, String secondaryLimit,
                                        String fixedAmount) {
        return StatutoryRate.create(
                "SYSTEM", Country.KE, type,
                new BigDecimal(rate),
                limit != null ? new BigDecimal(limit) : null,
                secondaryLimit != null ? new BigDecimal(secondaryLimit) : null,
                fixedAmount != null ? new BigDecimal(fixedAmount) : null,
                type + " description",
                LocalDate.of(2024, 1, 1));
    }

    private TaxRelief taxReliefMock(String type, String monthlyAmount,
                                    String rate, String maxAmount) {
        return TaxRelief.create(
                "SYSTEM", Country.KE, type,
                monthlyAmount != null ? new BigDecimal(monthlyAmount) : null,
                rate != null ? new BigDecimal(rate) : null,
                maxAmount != null ? new BigDecimal(maxAmount) : null,
                type + " description",
                LocalDate.of(2024, 1, 1));
    }
}
