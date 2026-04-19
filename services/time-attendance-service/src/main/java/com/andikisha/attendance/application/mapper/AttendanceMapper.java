package com.andikisha.attendance.application.mapper;

import com.andikisha.attendance.application.dto.response.AttendanceResponse;
import com.andikisha.attendance.domain.model.AttendanceRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(target = "clockInSource",
            expression = "java(r.getClockInSource() != null ? r.getClockInSource().name() : null)")
    @Mapping(target = "clockOutSource",
            expression = "java(r.getClockOutSource() != null ? r.getClockOutSource().name() : null)")
    AttendanceResponse toResponse(AttendanceRecord r);
}
