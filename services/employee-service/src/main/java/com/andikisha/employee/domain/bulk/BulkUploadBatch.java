package com.andikisha.employee.domain.bulk;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;

@Getter
@Entity
@Table(name = "bulk_upload_batches")
public class BulkUploadBatch extends BaseEntity {

    @Column(name = "total_rows",     nullable = false) private int totalRows;
    @Column(name = "valid_rows",     nullable = false) private int validRows;
    @Column(name = "error_count",    nullable = false) private int errorCount;
    @Column(name = "status",         nullable = false, length = 20) private String status;
    @Column(name = "uploaded_by",    nullable = false, length = 100) private String uploadedBy;
    @Column(name = "validated_rows", columnDefinition = "TEXT") private String validatedRows;

    protected BulkUploadBatch() {}

    public static BulkUploadBatch create(String tenantId, int totalRows, int validRows,
                                          int errorCount, String uploadedBy, String validatedRows) {
        BulkUploadBatch b = new BulkUploadBatch();
        b.setTenantId(tenantId);
        b.totalRows     = totalRows;
        b.validRows     = validRows;
        b.errorCount    = errorCount;
        b.status        = "PENDING_COMMIT";
        b.uploadedBy    = uploadedBy;
        b.validatedRows = validatedRows;
        return b;
    }

    public void markCommitted() { this.status = "COMMITTED"; }
}
