package com.andikisha.recruitment.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * A tenant-customisable hiring pipeline. Mirrors employee-service's LifecycleWorkflowTemplate:
 * the ordered {@link PipelineStage} children are owned via cascade + orphanRemoval and loaded in
 * {@code orderIndex} order.
 *
 * <p>Unlike the lifecycle template, stages carry external references: an Applicant's
 * {@code currentStageId} points at a stage id, so stage entities must NOT be destroyed and
 * recreated on edit — the service diffs in place to preserve stage ids.
 */
@Getter
@Entity
@Table(name = "pipeline_template")
public class PipelineTemplate extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<PipelineStage> stages = new ArrayList<>();

    protected PipelineTemplate() {}

    public static PipelineTemplate create(String tenantId, String name) {
        PipelineTemplate t = new PipelineTemplate();
        t.setTenantId(tenantId);
        t.name = name;
        t.active = true;
        return t;
    }

    /** Adds a stage and sets both sides of the association. */
    public void addStage(PipelineStage stage) {
        stage.setTemplate(this);
        this.stages.add(stage);
    }

    /** Removes a stage; orphanRemoval deletes the row on flush. */
    public void removeStage(PipelineStage stage) {
        this.stages.remove(stage);
    }

    /** Removes all stages (orphanRemoval deletes the rows on flush). */
    public void clearStages() {
        this.stages.clear();
    }

    public void rename(String name) {
        if (name != null && !name.isBlank()) this.name = name;
    }

    public void deactivate() {
        this.active = false;
    }
}
