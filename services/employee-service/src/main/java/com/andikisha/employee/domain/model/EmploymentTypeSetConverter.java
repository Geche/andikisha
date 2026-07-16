package com.andikisha.employee.domain.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Persists a set of {@link EmploymentType} as a comma-joined string column.
 * Kept simple deliberately — a lookup table would be overkill for a small,
 * bounded enum set that is only ever read/written whole with a template.
 */
@Converter
public class EmploymentTypeSetConverter implements AttributeConverter<Set<EmploymentType>, String> {

    @Override
    public String convertToDatabaseColumn(Set<EmploymentType> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        return attribute.stream().map(Enum::name).collect(Collectors.joining(","));
    }

    @Override
    public Set<EmploymentType> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return new LinkedHashSet<>();
        }
        return Arrays.stream(dbData.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(EmploymentType::valueOf)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
