package com.andikisha.auth.application.mapper;

import com.andikisha.auth.application.dto.response.UserResponse;
import com.andikisha.auth.domain.model.User;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-28T09:45:31+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UUID id = null;
        String tenantId = null;
        String email = null;
        String displayName = null;
        String phoneNumber = null;
        UUID employeeId = null;
        boolean active = false;
        boolean mustChangePassword = false;
        LocalDateTime lastLogin = null;
        LocalDateTime createdAt = null;

        id = user.getId();
        tenantId = user.getTenantId();
        email = user.getEmail();
        displayName = user.getDisplayName();
        phoneNumber = user.getPhoneNumber();
        employeeId = user.getEmployeeId();
        active = user.isActive();
        mustChangePassword = user.isMustChangePassword();
        lastLogin = user.getLastLogin();
        createdAt = user.getCreatedAt();

        String role = user.getRole().name();

        UserResponse userResponse = new UserResponse( id, tenantId, email, displayName, phoneNumber, role, employeeId, active, mustChangePassword, lastLogin, createdAt );

        return userResponse;
    }
}
