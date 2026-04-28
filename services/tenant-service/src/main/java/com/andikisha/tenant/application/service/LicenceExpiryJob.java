package com.andikisha.tenant.application.service;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.tenant.domain.model.LicenceHistory;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.domain.repository.LicenceHistoryRepository;
import com.andikisha.tenant.domain.repository.TenantLicenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Nightly job that walks the licence-status state machine forward
 * for tenants whose payment has lapsed.
 *
 * Order matters: ACTIVE -> GRACE_PERIOD must run before
 * GRACE_PERIOD -> SUSPENDED, etc., otherwise a freshly-graced licence
 * could be wrongly suspended in the same run.
 */
@Component
public class LicenceExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(LicenceExpiryJob.class);
    private static final int GRACE_PERIOD_DAYS = 14;
    private static final int SUSPENSION_DAYS_BEFORE_EXPIRY = 30;
    private static final String SYSTEM_ACTOR = "SYSTEM";

    private final TenantLicenceRepository licenceRepository;
    private final LicenceHistoryRepository historyRepository;
    private final LicenceStateMachineService stateMachine;

    public LicenceExpiryJob(TenantLicenceRepository licenceRepository,
                            LicenceHistoryRepository historyRepository,
                            LicenceStateMachineService stateMachine) {
        this.licenceRepository = licenceRepository;
        this.historyRepository = historyRepository;
        this.stateMachine = stateMachine;
    }

    @Scheduled(cron = "0 5 0 * * *")
    public void processLicenceExpiryTransitions() {
        LocalDate today = LocalDate.now();
        log.info("Licence expiry job starting for {}", today);

        int activeToGrace = transitionExpiredActiveToGrace(today);
        int graceToSuspended = transitionLapsedGraceToSuspended();
        int suspendedToExpired = transitionLongSuspendedToExpired();

        log.info("Licence expiry job complete: ACTIVE->GRACE_PERIOD={} GRACE_PERIOD->SUSPENDED={} SUSPENDED->EXPIRED={}",
                activeToGrace, graceToSuspended, suspendedToExpired);
    }

    private int transitionExpiredActiveToGrace(LocalDate today) {
        List<TenantLicence> expiredActive = licenceRepository.findByStatusAndEndDateBefore(
                LicenceStatus.ACTIVE, today);
        int moved = 0;
        for (TenantLicence licence : expiredActive) {
            try {
                stateMachine.transition(licence.getId(), LicenceStatus.GRACE_PERIOD,
                        SYSTEM_ACTOR, "Licence end_date passed");
                moved++;
            } catch (Exception ex) {
                log.error("Failed ACTIVE->GRACE_PERIOD for licence {}: {}",
                        licence.getId(), ex.getMessage());
            }
        }
        return moved;
    }

    private int transitionLapsedGraceToSuspended() {
        List<TenantLicence> graceLicences = licenceRepository.findByStatusIn(
                List.of(LicenceStatus.GRACE_PERIOD));
        LocalDateTime cutoff = LocalDateTime.now().minusDays(GRACE_PERIOD_DAYS);
        int moved = 0;
        for (TenantLicence licence : graceLicences) {
            // Find the original transition INTO GRACE_PERIOD to measure how long
            // the licence has been in this state.
            LicenceHistory firstGrace = historyRepository
                    .findFirstByLicenceIdAndNewStatusOrderByChangedAtAsc(
                            licence.getId(), LicenceStatus.GRACE_PERIOD)
                    .orElse(null);
            if (firstGrace == null || firstGrace.getChangedAt().isAfter(cutoff)) {
                continue;
            }
            try {
                stateMachine.transition(licence.getId(), LicenceStatus.SUSPENDED,
                        SYSTEM_ACTOR,
                        "Grace period exceeded " + GRACE_PERIOD_DAYS + " days");
                moved++;
            } catch (Exception ex) {
                log.error("Failed GRACE_PERIOD->SUSPENDED for licence {}: {}",
                        licence.getId(), ex.getMessage());
            }
        }
        return moved;
    }

    private int transitionLongSuspendedToExpired() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(SUSPENSION_DAYS_BEFORE_EXPIRY);
        List<TenantLicence> longSuspended = licenceRepository
                .findByStatusAndSuspendedAtBefore(LicenceStatus.SUSPENDED, cutoff);
        int moved = 0;
        for (TenantLicence licence : longSuspended) {
            try {
                stateMachine.transition(licence.getId(), LicenceStatus.EXPIRED,
                        SYSTEM_ACTOR,
                        "Suspended for more than " + SUSPENSION_DAYS_BEFORE_EXPIRY + " days");
                moved++;
            } catch (Exception ex) {
                log.error("Failed SUSPENDED->EXPIRED for licence {}: {}",
                        licence.getId(), ex.getMessage());
            }
        }
        return moved;
    }
}
