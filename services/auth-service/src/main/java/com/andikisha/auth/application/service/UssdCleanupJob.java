package com.andikisha.auth.application.service;

import com.andikisha.auth.domain.repository.UssdSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Nightly cleanup job that prunes expired USSD sessions.
 * Prevents the {@code ussd_session} table from growing indefinitely.
 */
@Component
public class UssdCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(UssdCleanupJob.class);

    private final UssdSessionRepository ussdSessionRepository;

    public UssdCleanupJob(UssdSessionRepository ussdSessionRepository) {
        this.ussdSessionRepository = ussdSessionRepository;
    }

    @Scheduled(cron = "0 30 2 * * *")
    public void purgeExpiredSessions() {
        LocalDateTime cutoff = LocalDateTime.now();
        int deleted = countAndDelete(cutoff);
        log.info("USSD cleanup job completed: deleted {} expired sessions", deleted);
    }

    private int countAndDelete(LocalDateTime cutoff) {
        long count = ussdSessionRepository.count();
        ussdSessionRepository.deleteByExpiresAtBefore(cutoff);
        long remaining = ussdSessionRepository.count();
        return (int) Math.max(0L, count - remaining);
    }
}
