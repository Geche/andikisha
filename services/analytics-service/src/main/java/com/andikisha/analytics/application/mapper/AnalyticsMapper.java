package com.andikisha.analytics.application.mapper;

import com.andikisha.analytics.application.dto.response.HeadcountSnapshotResponse;
import com.andikisha.analytics.application.dto.response.LeaveAnalyticsResponse;
import com.andikisha.analytics.application.dto.response.PayrollSummaryResponse;
import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.model.PayrollSummary;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AnalyticsMapper {

    PayrollSummaryResponse toResponse(PayrollSummary entity);

    List<PayrollSummaryResponse> toPayrollSummaryList(List<PayrollSummary> entities);

    HeadcountSnapshotResponse toResponse(HeadcountSnapshot entity);

    List<HeadcountSnapshotResponse> toHeadcountList(List<HeadcountSnapshot> entities);

    LeaveAnalyticsResponse toResponse(LeaveAnalytics entity);

    List<LeaveAnalyticsResponse> toLeaveList(List<LeaveAnalytics> entities);
}
