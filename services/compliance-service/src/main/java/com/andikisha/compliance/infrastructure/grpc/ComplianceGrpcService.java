package com.andikisha.compliance.infrastructure.grpc;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.compliance.application.dto.response.StatutoryRateResponse;
import com.andikisha.compliance.application.dto.response.TaxBracketResponse;
import com.andikisha.compliance.application.dto.response.TaxReliefResponse;
import com.andikisha.compliance.application.service.ComplianceService;
import com.andikisha.proto.compliance.ComplianceServiceGrpc;
import com.andikisha.proto.compliance.GetStatutoryRatesRequest;
import com.andikisha.proto.compliance.GetTaxRatesRequest;
import com.andikisha.proto.compliance.StatutoryRatesResponse;
import com.andikisha.proto.compliance.TaxRatesResponse;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;

@GrpcService
public class ComplianceGrpcService
        extends ComplianceServiceGrpc.ComplianceServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(ComplianceGrpcService.class);

    // Sent in the proto when upperBound is null (the top PAYE band has no ceiling)
    private static final String UNBOUNDED = "";

    private final ComplianceService complianceService;

    public ComplianceGrpcService(ComplianceService complianceService) {
        this.complianceService = complianceService;
    }

    @Override
    public void getTaxRates(GetTaxRatesRequest request,
                            StreamObserver<TaxRatesResponse> observer) {
        String tenantId = request.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            observer.onError(io.grpc.Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asException());
            return;
        }
        try {
            TenantContext.setTenantId(tenantId);
            LocalDate asOf = request.getEffectiveDate().isEmpty()
                    ? LocalDate.now()
                    : LocalDate.parse(request.getEffectiveDate());

            List<TaxBracketResponse> brackets =
                    complianceService.getTaxBracketsAsOf(request.getCountry(), asOf);
            List<TaxReliefResponse> reliefs =
                    complianceService.getTaxReliefsAsOf(request.getCountry(), asOf);

            TaxRatesResponse.Builder response = TaxRatesResponse.newBuilder()
                    .setCountry(request.getCountry().toUpperCase());

            for (TaxBracketResponse bracket : brackets) {
                response.addBrackets(
                        com.andikisha.proto.compliance.TaxBracket.newBuilder()
                                .setLowerBound(bracket.lowerBound().toPlainString())
                                .setUpperBound(bracket.upperBound() != null
                                        ? bracket.upperBound().toPlainString()
                                        : UNBOUNDED)
                                .setRate(bracket.rate().toPlainString())
                                .build()
                );
            }

            for (TaxReliefResponse relief : reliefs) {
                if ("PERSONAL_RELIEF".equals(relief.reliefType())
                        && relief.monthlyAmount() != null) {
                    response.setPersonalRelief(relief.monthlyAmount().toPlainString());
                }
                if ("INSURANCE_RELIEF".equals(relief.reliefType())) {
                    if (relief.rate() != null) {
                        response.setInsuranceReliefRate(relief.rate().toPlainString());
                    }
                    if (relief.maxAmount() != null) {
                        response.setMaxInsuranceRelief(relief.maxAmount().toPlainString());
                    }
                }
            }

            observer.onNext(response.build());
            observer.onCompleted();
        } catch (Exception e) {
            log.error("GetTaxRates failed for tenant={}", tenantId, e);
            observer.onError(io.grpc.Status.INTERNAL
                    .withDescription("Failed to get tax rates").asException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getStatutoryRates(GetStatutoryRatesRequest request,
                                  StreamObserver<StatutoryRatesResponse> observer) {
        String tenantId = request.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            observer.onError(io.grpc.Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asException());
            return;
        }
        try {
            TenantContext.setTenantId(tenantId);
            LocalDate asOf = request.getEffectiveDate().isEmpty()
                    ? LocalDate.now()
                    : LocalDate.parse(request.getEffectiveDate());

            List<StatutoryRateResponse> rates =
                    complianceService.getStatutoryRatesAsOf(request.getCountry(), asOf);

            StatutoryRatesResponse.Builder response = StatutoryRatesResponse.newBuilder()
                    .setCountry(request.getCountry().toUpperCase());

            for (StatutoryRateResponse rate : rates) {
                switch (rate.rateType()) {
                    case "NSSF" -> {
                        response.setNssfRate(toStr(rate.rateValue()));
                        if (rate.limitAmount() != null)
                            response.setNssfTier1Limit(rate.limitAmount().toPlainString());
                        if (rate.secondaryLimit() != null)
                            response.setNssfTier2Limit(rate.secondaryLimit().toPlainString());
                    }
                    case "SHIF" -> response.setShifRate(toStr(rate.rateValue()));
                    case "HOUSING_LEVY_EMPLOYEE" ->
                            response.setHousingLevyEmployeeRate(toStr(rate.rateValue()));
                    case "HOUSING_LEVY_EMPLOYER" ->
                            response.setHousingLevyEmployerRate(toStr(rate.rateValue()));
                    case "NITA" -> {
                        if (rate.fixedAmount() != null)
                            response.setNitaAmount(rate.fixedAmount().toPlainString());
                    }
                }
            }

            observer.onNext(response.build());
            observer.onCompleted();
        } catch (Exception e) {
            log.error("GetStatutoryRates failed for tenant={}", tenantId, e);
            observer.onError(io.grpc.Status.INTERNAL
                    .withDescription("Failed to get statutory rates").asException());
        } finally {
            TenantContext.clear();
        }
    }

    private static String toStr(java.math.BigDecimal value) {
        return value != null ? value.toPlainString() : "";
    }
}
