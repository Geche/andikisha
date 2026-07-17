package com.andikisha.recruitment.domain.model;

/**
 * Recruitment-local employment type. Deliberately mirrors employee-service's EmploymentType
 * values 1:1 (recruitment must not import the employee-service enum — no cross-service type
 * coupling) so that R2 hire-to-employee conversion maps directly.
 */
public enum EmploymentType {
    PERMANENT,
    CONTRACT,
    CASUAL,
    DIRECTOR,
    INTERN
}
