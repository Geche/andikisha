package com.andikisha.notification.application.mapper;

import com.andikisha.notification.application.dto.response.NotificationResponse;
import com.andikisha.notification.domain.model.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "channel", expression = "java(n.getChannel().name())")
    @Mapping(target = "status", expression = "java(n.getStatus().name())")
    @Mapping(target = "priority", expression = "java(n.getPriority().name())")
    NotificationResponse toResponse(Notification n);
}