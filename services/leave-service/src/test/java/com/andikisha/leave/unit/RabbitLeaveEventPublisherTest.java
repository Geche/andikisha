package com.andikisha.leave.unit;

import com.andikisha.leave.domain.model.LeaveRequest;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.infrastructure.messaging.RabbitLeaveEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * Verifies that RabbitLeaveEventPublisher sends immediately when called outside
 * an active transaction, rather than throwing IllegalStateException.
 *
 * Before the fix (M-1), unconditional registerSynchronization() threw
 * IllegalStateException: Transaction synchronization is not active
 * when no transaction was present (e.g. tests, batch jobs).
 * After the fix, the sendAfterCommit() method checks isActualTransactionActive()
 * and falls through to doSend() immediately when no transaction is active.
 */
class RabbitLeaveEventPublisherTest {

    private RabbitTemplate rabbitTemplate;
    private RabbitLeaveEventPublisher publisher;

    @BeforeEach
    void setUp() {
        // Ensure no residual transaction synchronization state from other tests
        // (e.g. @DataJpaTest tests that leave synchronization active on the thread).
        TransactionSynchronizationManager.clear();
        rabbitTemplate = mock(RabbitTemplate.class);
        publisher = new RabbitLeaveEventPublisher(rabbitTemplate);
    }

    @Test
    void publishLeaveRequested_outsideTransaction_sendsImmediatelyWithoutException() {
        // No transaction active — TransactionSynchronizationManager.isActualTransactionActive() == false.
        // Before fix: threw IllegalStateException from unconditional registerSynchronization().
        // After fix: falls through to doSend() and calls rabbitTemplate immediately.
        LeaveRequest request = stubRequest();

        assertThatNoException().isThrownBy(() -> publisher.publishLeaveRequested(request));

        verify(rabbitTemplate).convertAndSend(
                eq("leave.events"),
                eq("leave.requested"),
                (Object) any());
    }

    @Test
    void publishLeaveApproved_outsideTransaction_sendsImmediately() {
        LeaveRequest request = stubApprovedRequest();

        assertThatNoException().isThrownBy(() -> publisher.publishLeaveApproved(request));

        verify(rabbitTemplate).convertAndSend(
                eq("leave.events"),
                eq("leave.approved"),
                (Object) any());
    }

    private LeaveRequest stubRequest() {
        LeaveRequest r = LeaveRequest.create(
                "tenant-1",
                UUID.randomUUID(),
                "Test Employee",
                LeaveType.ANNUAL,
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5),
                "Test reason");
        // BaseEntity.id is set by JPA in production; set it via reflection for unit tests.
        ReflectionTestUtils.setField(r, "id", UUID.randomUUID());
        return r;
    }

    private LeaveRequest stubApprovedRequest() {
        LeaveRequest r = stubRequest();
        r.approve(UUID.randomUUID(), "Manager");
        return r;
    }
}
