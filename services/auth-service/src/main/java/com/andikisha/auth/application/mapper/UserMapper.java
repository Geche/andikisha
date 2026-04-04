package com.andikisha.auth.application.mapper;

import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.domain.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toResponse(User user);
}