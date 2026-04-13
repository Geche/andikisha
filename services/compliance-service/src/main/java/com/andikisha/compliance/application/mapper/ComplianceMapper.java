package com.andikisha.compliance.application.mapper;

import com.andikisha.compliance.application.dto.response.StatutoryRateResponse;
import com.andikisha.compliance.application.dto.response.TaxBracketResponse;
import com.andikisha.compliance.application.dto.response.TaxReliefResponse;
import com.andikisha.compliance.domain.model.StatutoryRate;
import com.andikisha.compliance.domain.model.TaxBracket;
import com.andikisha.compliance.domain.model.TaxRelief;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ComplianceMapper {

    TaxBracketResponse toResponse(TaxBracket bracket);

    TaxReliefResponse toResponse(TaxRelief relief);

    StatutoryRateResponse toResponse(StatutoryRate rate);
}
