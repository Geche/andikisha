package com.andikisha.tenant.unit;

import com.andikisha.common.domain.Money;
import com.andikisha.tenant.application.dto.response.PlanResponse;
import com.andikisha.tenant.application.mapper.TenantMapper;
import com.andikisha.tenant.application.service.PlanService;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.PlanTier;
import com.andikisha.tenant.domain.repository.PlanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlanServiceTest {

    @Mock private PlanRepository planRepository;
    @Mock private TenantMapper mapper;

    @InjectMocks private PlanService planService;

    @Test
    void getAvailablePlans_returnsOnlyActivePlans() {
        Plan starter = Plan.create("Starter", PlanTier.STARTER, Money.kes(2500),
                25, 2, true, true, false, false, false, false, false);
        Plan enterprise = Plan.create("Enterprise", PlanTier.ENTERPRISE, Money.kes(15000),
                500, 20, true, true, true, true, true, true, true);

        when(planRepository.findByTenantIdAndActiveTrue("SYSTEM"))
                .thenReturn(List.of(starter, enterprise));

        PlanResponse starterResp = new PlanResponse(UUID.randomUUID(), "Starter", "STARTER",
                BigDecimal.valueOf(2500), "KES", 25, 2, true, true, false, false, false);
        PlanResponse enterpriseResp = new PlanResponse(UUID.randomUUID(), "Enterprise", "ENTERPRISE",
                BigDecimal.valueOf(15000), "KES", 500, 20, true, true, true, true, true);

        when(mapper.toResponse(starter)).thenReturn(starterResp);
        when(mapper.toResponse(enterprise)).thenReturn(enterpriseResp);

        List<PlanResponse> result = planService.getAvailablePlans();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(PlanResponse::name)
                .containsExactly("Starter", "Enterprise");
    }

    @Test
    void getAvailablePlans_whenNoPLansAvailable_returnsEmptyList() {
        when(planRepository.findByTenantIdAndActiveTrue("SYSTEM")).thenReturn(List.of());

        List<PlanResponse> result = planService.getAvailablePlans();

        assertThat(result).isEmpty();
    }
}
