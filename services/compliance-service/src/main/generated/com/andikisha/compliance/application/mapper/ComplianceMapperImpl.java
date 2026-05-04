package com.andikisha.compliance.application.mapper;

import com.andikisha.compliance.application.dto.response.StatutoryRateResponse;
import com.andikisha.compliance.application.dto.response.TaxBracketResponse;
import com.andikisha.compliance.application.dto.response.TaxReliefResponse;
import com.andikisha.compliance.domain.model.StatutoryRate;
import com.andikisha.compliance.domain.model.TaxBracket;
import com.andikisha.compliance.domain.model.TaxRelief;
import java.math.BigDecimal;
import java.time.LocalDate;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T19:57:03+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class ComplianceMapperImpl implements ComplianceMapper {

    @Override
    public TaxBracketResponse toResponse(TaxBracket bracket) {
        if ( bracket == null ) {
            return null;
        }

        int bandNumber = 0;
        BigDecimal lowerBound = null;
        BigDecimal upperBound = null;
        BigDecimal rate = null;
        LocalDate effectiveFrom = null;

        bandNumber = bracket.getBandNumber();
        lowerBound = bracket.getLowerBound();
        upperBound = bracket.getUpperBound();
        rate = bracket.getRate();
        effectiveFrom = bracket.getEffectiveFrom();

        TaxBracketResponse taxBracketResponse = new TaxBracketResponse( bandNumber, lowerBound, upperBound, rate, effectiveFrom );

        return taxBracketResponse;
    }

    @Override
    public TaxReliefResponse toResponse(TaxRelief relief) {
        if ( relief == null ) {
            return null;
        }

        String reliefType = null;
        BigDecimal monthlyAmount = null;
        BigDecimal rate = null;
        BigDecimal maxAmount = null;
        String description = null;

        reliefType = relief.getReliefType();
        monthlyAmount = relief.getMonthlyAmount();
        rate = relief.getRate();
        maxAmount = relief.getMaxAmount();
        description = relief.getDescription();

        TaxReliefResponse taxReliefResponse = new TaxReliefResponse( reliefType, monthlyAmount, rate, maxAmount, description );

        return taxReliefResponse;
    }

    @Override
    public StatutoryRateResponse toResponse(StatutoryRate rate) {
        if ( rate == null ) {
            return null;
        }

        String rateType = null;
        BigDecimal rateValue = null;
        BigDecimal limitAmount = null;
        BigDecimal secondaryLimit = null;
        BigDecimal fixedAmount = null;
        String description = null;
        LocalDate effectiveFrom = null;

        rateType = rate.getRateType();
        rateValue = rate.getRateValue();
        limitAmount = rate.getLimitAmount();
        secondaryLimit = rate.getSecondaryLimit();
        fixedAmount = rate.getFixedAmount();
        description = rate.getDescription();
        effectiveFrom = rate.getEffectiveFrom();

        StatutoryRateResponse statutoryRateResponse = new StatutoryRateResponse( rateType, rateValue, limitAmount, secondaryLimit, fixedAmount, description, effectiveFrom );

        return statutoryRateResponse;
    }
}
