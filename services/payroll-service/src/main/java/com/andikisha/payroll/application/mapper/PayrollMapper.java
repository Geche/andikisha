package com.andikisha.payroll.application.mapper;

import com.andikisha.payroll.application.dto.response.PaySlipResponse;
import com.andikisha.payroll.application.dto.response.PayrollRunResponse;
import com.andikisha.payroll.domain.model.PaySlip;
import com.andikisha.payroll.domain.model.PayrollRun;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PayrollMapper {

    @Mapping(target = "status", expression = "java(run.getStatus().name())")
    @Mapping(target = "payFrequency", expression = "java(run.getPayFrequency().name())")
    PayrollRunResponse toResponse(PayrollRun run);

    @Mapping(target = "payrollRunId", source = "payrollRun.id")
    @Mapping(target = "period", source = "payrollRun.period")
    @Mapping(target = "paymentStatus", expression = "java(slip.getPaymentStatus().name())")
    PaySlipResponse toResponse(PaySlip slip);
}