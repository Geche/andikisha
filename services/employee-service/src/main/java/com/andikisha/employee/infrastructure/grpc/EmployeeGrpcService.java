package com.andikisha.employee.infrastructure.grpc;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.service.EmployeeQueryService;
import com.andikisha.proto.employee.EmployeeServiceGrpc;
import com.andikisha.proto.employee.GetEmployeeRequest;
import com.andikisha.proto.employee.GetSalaryRequest;
import com.andikisha.proto.employee.ListActiveByTenantRequest;
import com.andikisha.proto.employee.ListEmployeesResponse;
import com.andikisha.proto.employee.SalaryStructureResponse;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

@GrpcService
public class EmployeeGrpcService extends EmployeeServiceGrpc.EmployeeServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(EmployeeGrpcService.class);

    private final EmployeeQueryService queryService;

    public EmployeeGrpcService(EmployeeQueryService queryService) {
        this.queryService = queryService;
    }

    @Override
    public void getEmployee(GetEmployeeRequest request,
                            StreamObserver<com.andikisha.proto.employee.EmployeeResponse> observer) {
        TenantContext.setTenantId(request.getTenantId());
        try {
            EmployeeDetailResponse dto = queryService.findById(
                    UUID.fromString(request.getEmployeeId()));
            observer.onNext(toProto(dto));
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid employee ID format: " + request.getEmployeeId())
                    .asException());
        } catch (Exception e) {
            log.error("GetEmployee failed for {}", request.getEmployeeId(), e);
            observer.onError(Status.NOT_FOUND
                    .withDescription("Employee not found: " + request.getEmployeeId())
                    .asException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void listActiveByTenant(ListActiveByTenantRequest request,
                                   StreamObserver<ListEmployeesResponse> observer) {
        TenantContext.setTenantId(request.getTenantId());
        try {
            var protoList = queryService.findAllActive().stream()
                    .map(this::toProto)
                    .toList();

            observer.onNext(ListEmployeesResponse.newBuilder()
                    .addAllEmployees(protoList)
                    .build());
            observer.onCompleted();
        } catch (Exception e) {
            log.error("ListActiveByTenant failed", e);
            observer.onError(Status.INTERNAL
                    .withDescription("Internal error").asException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getSalaryStructure(GetSalaryRequest request,
                                   StreamObserver<SalaryStructureResponse> observer) {
        TenantContext.setTenantId(request.getTenantId());
        try {
            EmployeeDetailResponse dto = queryService.findById(
                    UUID.fromString(request.getEmployeeId()));

            observer.onNext(SalaryStructureResponse.newBuilder()
                    .setEmployeeId(dto.id().toString())
                    .setBasicSalary(dto.basicSalary().toPlainString())
                    .setHousingAllowance(dto.housingAllowance() != null ? dto.housingAllowance().toPlainString() : "0")
                    .setTransportAllowance(dto.transportAllowance() != null ? dto.transportAllowance().toPlainString() : "0")
                    .setMedicalAllowance(dto.medicalAllowance() != null ? dto.medicalAllowance().toPlainString() : "0")
                    .setOtherAllowances(dto.otherAllowances() != null ? dto.otherAllowances().toPlainString() : "0")
                    .setCurrency(dto.currency())
                    .build());
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid employee ID format: " + request.getEmployeeId())
                    .asException());
        } catch (Exception e) {
            log.error("GetSalaryStructure failed for {}", request.getEmployeeId(), e);
            observer.onError(Status.NOT_FOUND
                    .withDescription("Employee not found").asException());
        } finally {
            TenantContext.clear();
        }
    }

    private com.andikisha.proto.employee.EmployeeResponse toProto(EmployeeDetailResponse dto) {
        var builder = com.andikisha.proto.employee.EmployeeResponse.newBuilder()
                .setId(dto.id().toString())
                .setTenantId(dto.tenantId())
                .setEmployeeNumber(dto.employeeNumber())
                .setFirstName(dto.firstName())
                .setLastName(dto.lastName())
                .setPhoneNumber(dto.phoneNumber())
                .setNationalId(dto.nationalId())
                .setKraPin(dto.kraPin())
                .setNhifNumber(dto.nhifNumber())
                .setNssfNumber(dto.nssfNumber())
                .setStatus(com.andikisha.proto.employee.EmploymentStatus.valueOf(dto.status()))
                .setBasicSalary(dto.basicSalary().toPlainString())
                .setCurrency(dto.currency());

        if (dto.email() != null)         builder.setEmail(dto.email());
        if (dto.departmentId() != null)  builder.setDepartmentId(dto.departmentId().toString());
        if (dto.departmentName() != null) builder.setDepartmentName(dto.departmentName());
        if (dto.positionId() != null)    builder.setPositionId(dto.positionId().toString());
        if (dto.positionTitle() != null) builder.setPositionTitle(dto.positionTitle());

        return builder.build();
    }
}
