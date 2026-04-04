package com.andikisha.tenant.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "feature_flags")
public class FeatureFlag extends BaseEntity {

    @Column(name = "feature_key", nullable = false, length = 100)
    private String featureKey;

    @Column(nullable = false)
    private boolean enabled;

    @Column(length = 500)
    private String description;

    protected FeatureFlag() {}

    public static FeatureFlag create(String tenantId, String featureKey,
                                     boolean enabled, String description) {
        FeatureFlag flag = new FeatureFlag();
        flag.setTenantId(tenantId);
        flag.featureKey = featureKey;
        flag.enabled = enabled;
        flag.description = description;
        return flag;
    }

    public void enable() { this.enabled = true; }
    public void disable() { this.enabled = false; }

    public String getFeatureKey() { return featureKey; }
    public boolean isEnabled() { return enabled; }
    public String getDescription() { return description; }
}