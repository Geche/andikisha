package com.andikisha.tenant.application.mapper;

import com.andikisha.tenant.application.dto.response.FeatureFlagResponse;
import com.andikisha.tenant.application.dto.response.PlanResponse;
import com.andikisha.tenant.application.dto.response.TenantResponse;
import com.andikisha.tenant.domain.model.FeatureFlag;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.Tenant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TenantMapper {

    @Mapping(target = "status", expression = "java(tenant.getStatus().name())")
    @Mapping(target = "planName", source = "plan.name")
    @Mapping(target = "planTier", expression = "java(tenant.getPlan().getTier().name())")
    TenantResponse toResponse(Tenant tenant);

    @Mapping(target = "tier", expression = "java(plan.getTier().name())")
    @Mapping(target = "monthlyPrice", source = "monthlyPrice.amount")
    @Mapping(target = "currency", source = "monthlyPrice.currency")
    PlanResponse toResponse(Plan plan);

    FeatureFlagResponse toResponse(FeatureFlag flag);
}