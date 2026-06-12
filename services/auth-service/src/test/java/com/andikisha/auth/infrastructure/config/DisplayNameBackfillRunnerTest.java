package com.andikisha.auth.infrastructure.config;

import com.andikisha.auth.domain.model.Role;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.auth.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.proto.employee.EmployeeResponse;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DisplayNameBackfillRunnerTest {

    private final UserRepository userRepository = mock(UserRepository.class);
    private final EmployeeGrpcClient employeeGrpcClient = mock(EmployeeGrpcClient.class);
    private final DisplayNameBackfillRunner runner =
            new DisplayNameBackfillRunner(userRepository, employeeGrpcClient);

    private User userWithEmployee() {
        User u = User.create("tenant-1", "a@b.co", "+254700000001", "hash", Role.EMPLOYEE);
        u.linkEmployee(UUID.randomUUID());
        return u;
    }

    @Test
    void noBackfill_whenNoneNeeding() {
        when(userRepository.findByDisplayNameIsNullAndEmployeeIdIsNotNull()).thenReturn(List.of());
        runner.run(null);
        verify(userRepository, never()).save(any());
    }

    @Test
    void backfills_resolvedNames() {
        User u = userWithEmployee();
        when(userRepository.findByDisplayNameIsNullAndEmployeeIdIsNotNull()).thenReturn(List.of(u));
        when(employeeGrpcClient.getEmployee(anyString(), anyString()))
                .thenReturn(Optional.of(EmployeeResponse.newBuilder()
                        .setFirstName("Jane").setLastName("Wanjiru").build()));

        runner.run(null);

        assertEquals("Jane Wanjiru", u.getDisplayName());
        verify(userRepository).save(u);
    }

    @Test
    void skips_whenEmployeeUnresolvable() {
        User u = userWithEmployee();
        when(userRepository.findByDisplayNameIsNullAndEmployeeIdIsNotNull()).thenReturn(List.of(u));
        when(employeeGrpcClient.getEmployee(anyString(), anyString())).thenReturn(Optional.empty());

        runner.run(null);

        assertNull(u.getDisplayName());
        verify(userRepository, never()).save(any());
    }
}
