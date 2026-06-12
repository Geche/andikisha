package com.andikisha.auth.infrastructure.config;

import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.domain.repository.UserRepository;
import com.andikisha.auth.infrastructure.grpc.EmployeeGrpcClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * One-time, idempotent backfill of {@code users.display_name} from the linked employee
 * record (AUTH-006). Runs at startup so a new deploy populates names without anyone
 * remembering to run a script.
 *
 * <p>Guarded: it only touches users that have an {@code employee_id} but no
 * {@code display_name}, so it is a no-op once populated (logs "no backfill needed").
 * The gRPC call to employee-service is a cold path here (startup, not the /me hot path).
 * If employee-service is unavailable or an employee can't be resolved, that user keeps
 * {@code display_name=null} (the read path falls back to email) and is retried next start.
 *
 * <p>Test plan (documented in docs/decisions/2026-06-12-auth-user-display-name.md):
 * no-op when none need backfilling; resolvable users get name set + saved; unresolvable
 * users are skipped without error; a second run is a no-op.
 */
@Component
public class DisplayNameBackfillRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DisplayNameBackfillRunner.class);

    private final UserRepository userRepository;
    private final EmployeeGrpcClient employeeGrpcClient;

    public DisplayNameBackfillRunner(UserRepository userRepository, EmployeeGrpcClient employeeGrpcClient) {
        this.userRepository = userRepository;
        this.employeeGrpcClient = employeeGrpcClient;
    }

    @Override
    public void run(ApplicationArguments args) {
        List<User> candidates = userRepository.findByDisplayNameIsNullAndEmployeeIdIsNotNull();
        if (candidates.isEmpty()) {
            log.info("Display-name backfill: no backfill needed.");
            return;
        }
        int filled = 0;
        for (User user : candidates) {
            try {
                Optional<String> name = employeeGrpcClient
                        .getEmployee(user.getTenantId(), user.getEmployeeId().toString())
                        .map(e -> (e.getFirstName() + " " + e.getLastName()).trim())
                        .filter(n -> !n.isBlank());
                if (name.isPresent()) {
                    user.setDisplayName(name.get());
                    userRepository.save(user);
                    filled++;
                }
            } catch (Exception ex) {
                log.warn("Display-name backfill: could not resolve user {} (employee {}): {}",
                        user.getId(), user.getEmployeeId(), ex.getMessage());
            }
        }
        log.info("Display-name backfill: backfilled {} of {} candidate user(s); unresolved will retry next start.",
                filled, candidates.size());
    }
}
