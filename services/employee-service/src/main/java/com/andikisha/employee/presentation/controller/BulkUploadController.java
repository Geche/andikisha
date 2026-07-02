package com.andikisha.employee.presentation.controller;

import com.andikisha.employee.application.bulk.ActivationResult;
import com.andikisha.employee.application.bulk.BulkCommitResult;
import com.andikisha.employee.application.bulk.BulkValidationReport;
import com.andikisha.employee.application.service.BulkUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees/bulk-upload")
@Tag(name = "Bulk Upload", description = "Bulk employee upload, validation, commit, and activation")
public class BulkUploadController {

    private final BulkUploadService bulkService;

    public BulkUploadController(BulkUploadService bulkService) {
        this.bulkService = bulkService;
    }

    @GetMapping("/template/xlsx")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Download Excel upload template")
    public ResponseEntity<byte[]> templateXlsx() throws IOException {
        byte[] xlsx = bulkService.generateXlsxTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"employee-upload-template.xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(xlsx);
    }

    @GetMapping("/template/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Download CSV upload template")
    public ResponseEntity<byte[]> templateCsv() {
        byte[] csv = bulkService.generateCsvTemplate().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"employee-upload-template.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Upload and validate employee file — returns validation report with uploadId")
    public BulkValidationReport validate(
            @RequestHeader("X-User-ID") String userId,
            @RequestParam("file") MultipartFile file) throws IOException {
        return bulkService.validate(file, userId);
    }

    @PostMapping("/{uploadId}/commit")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Commit validated rows — creates employee records, does NOT create user accounts")
    public BulkCommitResult commit(
            @PathVariable UUID uploadId,
            @RequestParam(value = "validRowsOnly", defaultValue = "false") boolean validRowsOnly)
            throws IOException {
        return bulkService.commit(uploadId, validRowsOnly);
    }

    @GetMapping("/pending-activation")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "List employees who have records but no user account yet")
    public List<Map<String,Object>> pendingActivation() {
        return bulkService.listPendingActivation();
    }

    @PostMapping("/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Activate selected employee accounts — creates users, generates temp passwords")
    public List<ActivationResult> activate(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody List<UUID> employeeIds) {
        // Strip "Bearer " prefix before passing the raw token to auth-service
        String token = authorizationHeader.startsWith("Bearer ")
                ? authorizationHeader.substring(7) : authorizationHeader;
        return bulkService.activate(employeeIds, token);
    }
}
