package com.andikisha.gateway.infrastructure.messaging;

import com.andikisha.common.infrastructure.cache.RedisKeys;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Releases the payroll disbursement Redis lock when a payroll run finishes.
 *
 * The PayrollDisbursementLockFilter acquires the lock (30-min TTL) on POST /disburse
 * to prevent concurrent disbursements for the same tenant. This listener provides an
 * early release so the next run can start immediately after processing completes,
 * without waiting for the full TTL to expire.
 */
@Component
public class PayrollDisbursementLockCleaner {

    private static final Logger log = LoggerFactory.getLogger(PayrollDisbursementLockCleaner.class);

    private final ReactiveStringRedisTemplate redisTemplate;

    public PayrollDisbursementLockCleaner(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @RabbitListener(queues = GatewayRabbitMqConfig.GATEWAY_PAYROLL_QUEUE)
    public void onPayrollProcessed(PayrollProcessedEvent event) {
        String lockKey = RedisKeys.payrollDisbursementLock(event.getTenantId());
        try {
            Long deleted = redisTemplate.delete(lockKey).block();
            log.info("Released payroll disbursement lock for tenant {} (run: {}, deleted={})",
                    event.getTenantId(), event.getPayrollRunId(), deleted);
        } catch (Exception ex) {
            log.warn("Failed to release payroll lock for tenant {} (run: {}): {}",
                    event.getTenantId(), event.getPayrollRunId(), ex.getMessage());
        }
    }
}
