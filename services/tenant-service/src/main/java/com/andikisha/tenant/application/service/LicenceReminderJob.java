package com.andikisha.tenant.application.service;

import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.events.tenant.LicenceExpiringEvent;
import com.andikisha.tenant.application.port.LicenceEventPublisher;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.domain.repository.PlanRepository;
import com.andikisha.tenant.domain.repository.TenantLicenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Sends a {@link LicenceExpiringEvent} when a licence is exactly 30, 14
 * or 7 days from expiry. Notification Service consumes the event and
 * fans out to email/SMS/in-app channels.
 *
 * Runs at 08:00 every day to align with business-hours notifications.
 */
@Component
public class LicenceReminderJob {

    private static final Logger log = LoggerFactory.getLogger(LicenceReminderJob.class);
    private static final int[] REMINDER_THRESHOLDS = {30, 14, 7};
    private static final List<LicenceStatus> REMINDABLE_STATUSES = List.of(
            LicenceStatus.ACTIVE, LicenceStatus.TRIAL);

    private final TenantLicenceRepository licenceRepository;
    private final PlanRepository planRepository;
    private final LicenceEventPublisher eventPublisher;

    public LicenceReminderJob(TenantLicenceRepository licenceRepository,
                              PlanRepository planRepository,
                              LicenceEventPublisher eventPublisher) {
        this.licenceRepository = licenceRepository;
        this.planRepository = planRepository;
        this.eventPublisher = eventPublisher;
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendExpiryReminders() {
        LocalDate today = LocalDate.now();
        int total = 0;
        for (int days : REMINDER_THRESHOLDS) {
            LocalDate target = today.plusDays(days);
            List<TenantLicence> expiringOnTarget = licenceRepository
                    .findByStatusInAndEndDateBetween(REMINDABLE_STATUSES, target, target);
            for (TenantLicence licence : expiringOnTarget) {
                Plan plan = planRepository.findById(licence.getPlanId()).orElse(null);
                String planName = plan != null ? plan.getName() : "unknown";
                eventPublisher.publishLicenceExpiring(new LicenceExpiringEvent(
                        licence.getTenantId(),
                        licence.getId().toString(),
                        licence.getEndDate(),
                        days,
                        planName));
                total++;
            }
        }
        log.info("Licence reminder job: dispatched {} expiry reminders", total);
    }
}
