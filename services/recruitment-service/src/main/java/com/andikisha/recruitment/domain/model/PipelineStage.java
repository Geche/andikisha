package com.andikisha.recruitment.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;

/**
 * An ordered stage within a {@link PipelineTemplate}. {@code name} is the tenant-editable display
 * label; {@code category} is the fixed semantic. Anchor stages (APPLIED/HIRED/REJECTED) may be
 * relabelled but never re-categorised or removed.
 */
@Getter
@Entity
@Table(name = "pipeline_stage")
public class PipelineStage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private PipelineTemplate template;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StageCategory category;

    protected PipelineStage() {}

    public static PipelineStage create(String tenantId, int orderIndex, String name,
                                       StageCategory category) {
        PipelineStage s = new PipelineStage();
        s.setTenantId(tenantId);
        s.orderIndex = orderIndex;
        s.name = name;
        s.category = category;
        return s;
    }

    /** Anchors are protected: cannot be removed, category cannot change. */
    public boolean isProtected() {
        return category != null && category.isAnchor();
    }

    /** Changes only the display label. Always allowed, including for anchors. */
    public void relabel(String newName) {
        if (newName != null && !newName.isBlank()) this.name = newName;
    }

    /** Changes the semantic category. The service only invokes this for non-anchor stages. */
    public void changeCategory(StageCategory newCategory) {
        this.category = newCategory;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    void setTemplate(PipelineTemplate template) {
        this.template = template;
    }
}
