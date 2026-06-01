package com.andikisha.common.scope;

import java.util.UUID;

public record ResolvedScope(ScopeType type, UUID departmentId) {

    public static ResolvedScope all() {
        return new ResolvedScope(ScopeType.ALL, null);
    }

    public static ResolvedScope department(UUID departmentId) {
        return new ResolvedScope(ScopeType.DEPARTMENT, departmentId);
    }

    public static ResolvedScope own() {
        return new ResolvedScope(ScopeType.OWN, null);
    }
}
