package com.andikisha.leave.application.mapper;

import com.andikisha.leave.application.dto.response.LeaveBalanceResponse;
import com.andikisha.leave.application.dto.response.LeavePolicyResponse;
import com.andikisha.leave.application.dto.response.LeaveRequestResponse;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LeaveMapper {

    // List/other endpoints don't resolve the employee number (avoids an N+1 of
    // gRPC lookups); it is left null and only populated on the single-request
    // detail path via the two-arg overload below.
    @Mapping(target = "employeeNumber", ignore = true)
    @Mapping(target = "leaveType", expression = "java(r.getLeaveType().name())")
    @Mapping(target = "status", expression = "java(r.getStatus().name())")
    LeaveRequestResponse toResponse(LeaveRequest r);

    @Mapping(target = "employeeNumber", source = "employeeNumber")
    @Mapping(target = "leaveType", expression = "java(r.getLeaveType().name())")
    @Mapping(target = "status", expression = "java(r.getStatus().name())")
    LeaveRequestResponse toResponse(LeaveRequest r, String employeeNumber);

    @Mapping(target = "leaveType", expression = "java(b.getLeaveType().name())")
    @Mapping(target = "available", expression = "java(b.getAvailable())")
    LeaveBalanceResponse toResponse(LeaveBalance b);

    @Mapping(target = "leaveType", expression = "java(p.getLeaveType().name())")
    LeavePolicyResponse toResponse(LeavePolicy p);
}