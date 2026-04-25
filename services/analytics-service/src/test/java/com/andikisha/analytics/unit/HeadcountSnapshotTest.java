package com.andikisha.analytics.unit;

import com.andikisha.analytics.domain.model.HeadcountSnapshot;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class HeadcountSnapshotTest {

    private static final String TENANT = "tenant-a";
    private static final LocalDate DATE = LocalDate.of(2026, 4, 15);

    @Test
    void create_initializesAllFieldsToZero() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);

        assertThat(s.getTenantId()).isEqualTo(TENANT);
        assertThat(s.getSnapshotDate()).isEqualTo(DATE);
        assertThat(s.getTotalActive()).isZero();
        assertThat(s.getTotalOnProbation()).isZero();
        assertThat(s.getTotalOnLeave()).isZero();
        assertThat(s.getTotalSuspended()).isZero();
        assertThat(s.getTotalTerminated()).isZero();
        assertThat(s.getNewHires()).isZero();
        assertThat(s.getExits()).isZero();
        assertThat(s.getPermanentCount()).isZero();
        assertThat(s.getContractCount()).isZero();
        assertThat(s.getCasualCount()).isZero();
        assertThat(s.getInternCount()).isZero();
    }

    @Test
    void incrementNewHires_incrementsCounter() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.incrementNewHires();
        s.incrementNewHires();

        assertThat(s.getNewHires()).isEqualTo(2);
    }

    @Test
    void incrementExits_incrementsCounter() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.incrementExits();

        assertThat(s.getExits()).isEqualTo(1);
    }

    @Test
    void incrementTerminated_incrementsCounter() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.incrementTerminated();

        assertThat(s.getTotalTerminated()).isEqualTo(1);
    }

    @Test
    void incrementByType_permanent() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.incrementByType("PERMANENT");

        assertThat(s.getPermanentCount()).isEqualTo(1);
    }

    @Test
    void incrementByType_contract() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.incrementByType("CONTRACT");

        assertThat(s.getContractCount()).isEqualTo(1);
    }

    @Test
    void incrementByType_casual() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.incrementByType("CASUAL");

        assertThat(s.getCasualCount()).isEqualTo(1);
    }

    @Test
    void incrementByType_intern() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.incrementByType("INTERN");

        assertThat(s.getInternCount()).isEqualTo(1);
    }

    @Test
    void incrementByType_unknownType_ignores() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.incrementByType("UNKNOWN");

        assertThat(s.getPermanentCount()).isZero();
        assertThat(s.getContractCount()).isZero();
        assertThat(s.getCasualCount()).isZero();
        assertThat(s.getInternCount()).isZero();
    }

    @Test
    void getTotalHeadcount_sumsActiveProbationLeaveSuspended() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.setTotalActive(10);
        s.setTotalOnProbation(3);
        s.setTotalOnLeave(2);
        s.setTotalSuspended(1);

        assertThat(s.getTotalHeadcount()).isEqualTo(16);
    }

    @Test
    void setters_updateValues() {
        HeadcountSnapshot s = HeadcountSnapshot.create(TENANT, DATE);
        s.setTotalActive(5);
        s.setTotalOnProbation(2);
        s.setTotalOnLeave(1);
        s.setTotalSuspended(0);

        assertThat(s.getTotalActive()).isEqualTo(5);
        assertThat(s.getTotalOnProbation()).isEqualTo(2);
        assertThat(s.getTotalOnLeave()).isEqualTo(1);
        assertThat(s.getTotalSuspended()).isEqualTo(0);
    }
}
