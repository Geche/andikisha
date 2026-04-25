package com.andikisha.analytics.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;

@Entity
@Table(name = "headcount_snapshots",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"tenant_id", "snapshot_date"}))
public class HeadcountSnapshot extends BaseEntity {

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "total_active", nullable = false)
    private int totalActive;

    @Column(name = "total_on_probation", nullable = false)
    private int totalOnProbation;

    @Column(name = "total_on_leave", nullable = false)
    private int totalOnLeave;

    @Column(name = "total_suspended", nullable = false)
    private int totalSuspended;

    @Column(name = "total_terminated", nullable = false)
    private int totalTerminated;

    @Column(name = "new_hires", nullable = false)
    private int newHires;

    @Column(name = "exits", nullable = false)
    private int exits;

    @Column(name = "permanent_count", nullable = false)
    private int permanentCount;

    @Column(name = "contract_count", nullable = false)
    private int contractCount;

    @Column(name = "casual_count", nullable = false)
    private int casualCount;

    @Column(name = "intern_count", nullable = false)
    private int internCount;

    protected HeadcountSnapshot() {}

    public static HeadcountSnapshot create(String tenantId, LocalDate date) {
        HeadcountSnapshot s = new HeadcountSnapshot();
        s.setTenantId(tenantId);
        s.snapshotDate = date;
        s.totalActive = 0;
        s.totalOnProbation = 0;
        s.totalOnLeave = 0;
        s.totalSuspended = 0;
        s.totalTerminated = 0;
        s.newHires = 0;
        s.exits = 0;
        s.permanentCount = 0;
        s.contractCount = 0;
        s.casualCount = 0;
        s.internCount = 0;
        return s;
    }

    public void incrementNewHires() { this.newHires++; }
    public void incrementExits() { this.exits++; }
    public void incrementTerminated() { this.totalTerminated++; }

    public void incrementByType(String employmentType) {
        switch (employmentType) {
            case "PERMANENT" -> this.permanentCount++;
            case "CONTRACT" -> this.contractCount++;
            case "CASUAL" -> this.casualCount++;
            case "INTERN" -> this.internCount++;
        }
    }

    public void setTotalActive(int v) { this.totalActive = v; }
    public void setTotalOnProbation(int v) { this.totalOnProbation = v; }
    public void setTotalOnLeave(int v) { this.totalOnLeave = v; }
    public void setTotalSuspended(int v) { this.totalSuspended = v; }

    public LocalDate getSnapshotDate() { return snapshotDate; }
    public int getTotalActive() { return totalActive; }
    public int getTotalOnProbation() { return totalOnProbation; }
    public int getTotalOnLeave() { return totalOnLeave; }
    public int getTotalSuspended() { return totalSuspended; }
    public int getTotalTerminated() { return totalTerminated; }
    public int getNewHires() { return newHires; }
    public int getExits() { return exits; }
    public int getPermanentCount() { return permanentCount; }
    public int getContractCount() { return contractCount; }
    public int getCasualCount() { return casualCount; }
    public int getInternCount() { return internCount; }
    public int getTotalHeadcount() {
        return totalActive + totalOnProbation + totalOnLeave + totalSuspended;
    }
}