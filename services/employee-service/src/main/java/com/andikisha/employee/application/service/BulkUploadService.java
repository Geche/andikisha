package com.andikisha.employee.application.service;

import com.andikisha.common.domain.Money;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.bulk.ActivationResult;
import com.andikisha.employee.application.bulk.BulkCommitResult;
import com.andikisha.employee.application.bulk.BulkRowError;
import com.andikisha.employee.application.bulk.BulkValidationReport;
import com.andikisha.employee.domain.bulk.BulkUploadBatch;
import com.andikisha.employee.domain.bulk.BulkUploadBatchRepository;
import com.andikisha.employee.domain.model.Department;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.model.EmploymentType;
import com.andikisha.employee.domain.model.Position;
import com.andikisha.employee.domain.model.SalaryStructure;
import com.andikisha.employee.domain.repository.DepartmentRepository;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import com.andikisha.employee.domain.repository.PositionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class BulkUploadService {

    private static final Pattern KRA_PIN   = Pattern.compile("^[A-Z]\\d{9}[A-Z]$");
    private static final Pattern PHONE_KE  = Pattern.compile("^(\\+254|0)7\\d{8}$");
    private static final Pattern NSSF_NUM  = Pattern.compile("^\\d{5,10}$");
    private static final List<String> ALLOWED_ROLES =
            List.of("EMPLOYEE", "HR_OFFICER", "PAYROLL_OFFICER", "HR_MANAGER", "LINE_MANAGER");
    private static final List<String> REQUIRED_COLS =
            List.of("firstName","lastName","workEmail","role","departmentName","positionName","dateOfJoining","basicSalary");

    private final BulkUploadBatchRepository batchRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmployeeNumberGenerator numberGenerator;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${app.auth-service-url:http://localhost:8081}")
    private String authServiceUrl;

    public BulkUploadService(BulkUploadBatchRepository batchRepository,
                              EmployeeRepository employeeRepository,
                              DepartmentRepository departmentRepository,
                              PositionRepository positionRepository,
                              EmployeeNumberGenerator numberGenerator,
                              ObjectMapper objectMapper,
                              RestTemplate restTemplate) {
        this.batchRepository    = batchRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.numberGenerator    = numberGenerator;
        this.objectMapper       = objectMapper;
        this.restTemplate       = restTemplate;
    }

    // ─── Template generation ──────────────────────────────────────────────────

    public byte[] generateXlsxTemplate() throws IOException {
        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet data  = wb.createSheet("Employee Upload");
            Sheet hints = wb.createSheet("Format Hints");
            wb.setSheetHidden(wb.getSheetIndex(hints), true);

            // Header row
            String[] headers = {
                "firstName*","lastName*","workEmail*","role*","departmentName*","positionName*",
                "dateOfJoining*","basicSalary*",
                "phone","nationalId","kraPin","nssfNumber","shifNumber",
                "bankName","bankBranch","bankAccountNumber"
            };
            Row hdr = data.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                hdr.createCell(i).setCellValue(headers[i]);
            }

            // Sample row
            Row sample = data.createRow(1);
            String[] sampleData = {
                "Jane","Doe","jane.doe@company.co.ke","EMPLOYEE","Engineering","Software Engineer",
                "2026-06-01","85000",
                "+254712345678","12345678","A000000000X","1234567","1234567",
                "Equity Bank","Nairobi CBD","0123456789"
            };
            for (int i = 0; i < sampleData.length; i++) {
                sample.createCell(i).setCellValue(sampleData[i]);
            }

            // Hints sheet
            String[][] hintData = {
                {"Column","Required","Format / Notes"},
                {"firstName","Yes","Given name"},
                {"lastName","Yes","Family name"},
                {"workEmail","Yes","Unique work email"},
                {"role","Yes","EMPLOYEE | HR_OFFICER | PAYROLL_OFFICER | HR_MANAGER | LINE_MANAGER"},
                {"departmentName","Yes","Must match an existing department name exactly"},
                {"positionName","Yes","Must match an existing position name exactly"},
                {"dateOfJoining","Yes","YYYY-MM-DD  e.g. 2026-06-01"},
                {"basicSalary","Yes","Positive number  e.g. 85000"},
                {"phone","No","+254712345678 or 0712345678"},
                {"nationalId","No","National ID number"},
                {"kraPin","No","Format: A000000000X (letter + 9 digits + letter)"},
                {"nssfNumber","No","5-10 digit number"},
                {"shifNumber","No","5-10 digit number"},
                {"bankName","No","Bank name"},
                {"bankBranch","No","Branch name"},
                {"bankAccountNumber","No","Account number"},
            };
            for (int r = 0; r < hintData.length; r++) {
                Row row = hints.createRow(r);
                for (int c = 0; c < hintData[r].length; c++) {
                    row.createCell(c).setCellValue(hintData[r][c]);
                }
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            return out.toByteArray();
        }
    }

    public String generateCsvTemplate() {
        return "firstName*,lastName*,workEmail*,role*,departmentName*,positionName*,dateOfJoining*,basicSalary*," +
               "phone,nationalId,kraPin,nssfNumber,shifNumber,bankName,bankBranch,bankAccountNumber\n" +
               "Jane,Doe,jane.doe@company.co.ke,EMPLOYEE,Engineering,Software Engineer,2026-06-01,85000," +
               "+254712345678,12345678,A000000000X,1234567,1234567,Equity Bank,Nairobi CBD,0123456789\n";
    }

    // ─── Validate ─────────────────────────────────────────────────────────────

    @Transactional
    public BulkValidationReport validate(MultipartFile file, String uploadedBy) throws IOException {
        String tenantId = TenantContext.requireTenantId();
        List<Map<String,String>> rows = parseFile(file);

        // Pre-load lookup tables
        List<Department> depts = departmentRepository.findByTenantIdAndActiveTrue(tenantId);
        List<Position>   poses = positionRepository.findByTenantIdAndActiveTrue(tenantId);
        Map<String,UUID> deptMap = new HashMap<>();
        Map<String,UUID> posMap  = new HashMap<>();
        depts.forEach(d -> deptMap.put(d.getName().toLowerCase(), d.getId()));
        poses.forEach(p -> posMap.put(p.getTitle().toLowerCase(),  p.getId()));

        // Pre-pass: build in-file nationalId → [rowNumbers] map to detect duplicates within the upload.
        // Only non-blank values are considered; blank nationalId rows are not duplicates of each other.
        Map<String, List<Integer>> inFileDuplicateNationalIds = new HashMap<>();
        int scanRow = 2;
        for (Map<String,String> row : rows) {
            String natId = row.getOrDefault("nationalId", "").trim();
            if (!natId.isBlank()) {
                inFileDuplicateNationalIds.computeIfAbsent(natId, k -> new ArrayList<>()).add(scanRow);
            }
            scanRow++;
        }
        // Keep only entries that appear more than once — these are the in-file duplicates.
        inFileDuplicateNationalIds.entrySet().removeIf(e -> e.getValue().size() <= 1);

        List<BulkRowError> errors = new ArrayList<>();
        List<Map<String,String>> validRows = new ArrayList<>();
        int rowNum = 2; // 1-based, skip header

        for (Map<String,String> row : rows) {
            List<BulkRowError> rowErrors = validateRow(row, rowNum, tenantId, deptMap, posMap,
                    depts.stream().map(Department::getName).toList(),
                    poses.stream().map(Position::getTitle).toList(),
                    inFileDuplicateNationalIds);
            if (rowErrors.isEmpty()) {
                validRows.add(row);
            }
            errors.addAll(rowErrors);
            rowNum++;
        }

        // Store batch regardless of errors — allows "commit valid rows only" flow
        String validJson = objectMapper.writeValueAsString(validRows);
        BulkUploadBatch batch = BulkUploadBatch.create(tenantId, rows.size(), validRows.size(),
                errors.size(), uploadedBy, validJson);
        batch = batchRepository.save(batch);

        return new BulkValidationReport(rows.size(), validRows.size(), errors,
                errors.isEmpty() ? batch.getId() : batch.getId());
    }

    private List<BulkRowError> validateRow(Map<String,String> row, int rowNum, String tenantId,
                                            Map<String,UUID> deptMap, Map<String,UUID> posMap,
                                            List<String> deptNames, List<String> posNames,
                                            Map<String, List<Integer>> inFileDuplicateNationalIds) {
        List<BulkRowError> errs = new ArrayList<>();

        // Required fields
        for (String col : REQUIRED_COLS) {
            String v = row.get(col);
            if (v == null || v.isBlank()) {
                errs.add(new BulkRowError(rowNum, col, v, col + " is required"));
            }
        }
        if (!errs.isEmpty()) return errs; // stop early on missing required

        String email = row.get("workEmail").trim().toLowerCase();
        String role  = row.get("role").trim().toUpperCase();
        String dept  = row.get("departmentName").trim();
        String pos   = row.get("positionName").trim();

        // Email format + uniqueness
        if (!email.matches("^[\\w.+%-]+@[\\w.-]+\\.[A-Za-z]{2,}$")) {
            errs.add(new BulkRowError(rowNum, "workEmail", email, "Invalid email format"));
        } else if (employeeRepository.existsByTenantIdAndEmail(tenantId, email)) {
            errs.add(new BulkRowError(rowNum, "workEmail", email, "Email already exists in tenant"));
        }

        // nationalId uniqueness — only checked when a value is provided (field is optional)
        String nationalId = row.getOrDefault("nationalId", "").trim();
        if (!nationalId.isBlank()) {
            // Cross-file: check against existing employees in the database
            if (employeeRepository.existsByTenantIdAndNationalId(tenantId, nationalId)) {
                errs.add(new BulkRowError(rowNum, "nationalId", nationalId,
                        "National ID '" + nationalId + "' is already registered for another employee in this tenant."));
            }
            // In-file: check for duplicates within this upload
            if (inFileDuplicateNationalIds.containsKey(nationalId)) {
                String rowList = inFileDuplicateNationalIds.get(nationalId).stream()
                        .map(Object::toString)
                        .collect(Collectors.joining(", "));
                errs.add(new BulkRowError(rowNum, "nationalId", nationalId,
                        "National ID '" + nationalId + "' appears in multiple rows of this upload (rows: " + rowList + ")."));
            }
        }

        // Role
        if (!ALLOWED_ROLES.contains(role)) {
            errs.add(new BulkRowError(rowNum, "role", role,
                    "Role must be one of: " + String.join(", ", ALLOWED_ROLES)));
        }
        if ("ADMIN".equals(role) || "SUPER_ADMIN".equals(role)) {
            errs.add(new BulkRowError(rowNum, "role", role, "Bulk upload cannot create ADMIN or SUPER_ADMIN users"));
        }

        // Department resolution + fuzzy suggestion
        if (!deptMap.containsKey(dept.toLowerCase())) {
            String suggestion = bestMatch(dept, deptNames, 2);
            String msg = suggestion != null
                    ? "Department '" + dept + "' not found, did you mean '" + suggestion + "'?"
                    : "Department '" + dept + "' not found";
            errs.add(new BulkRowError(rowNum, "departmentName", dept, msg));
        }

        // Position resolution + fuzzy suggestion
        if (!posMap.containsKey(pos.toLowerCase())) {
            String suggestion = bestMatch(pos, posNames, 2);
            String msg = suggestion != null
                    ? "Position '" + pos + "' not found, did you mean '" + suggestion + "'?"
                    : "Position '" + pos + "' not found";
            errs.add(new BulkRowError(rowNum, "positionName", pos, msg));
        }

        // Date of joining
        try {
            LocalDate.parse(row.get("dateOfJoining").trim());
        } catch (DateTimeParseException e) {
            errs.add(new BulkRowError(rowNum, "dateOfJoining", row.get("dateOfJoining"),
                    "Invalid date — use YYYY-MM-DD format (e.g. 2026-06-01)"));
        }

        // Basic salary
        try {
            BigDecimal salary = new BigDecimal(row.get("basicSalary").trim().replace(",", ""));
            if (salary.compareTo(BigDecimal.ZERO) <= 0) {
                errs.add(new BulkRowError(rowNum, "basicSalary", row.get("basicSalary"),
                        "Basic salary must be a positive number"));
            }
        } catch (NumberFormatException e) {
            errs.add(new BulkRowError(rowNum, "basicSalary", row.get("basicSalary"),
                    "Basic salary must be a number (e.g. 85000)"));
        }

        // Optional field validation
        String phone = row.getOrDefault("phone", "").trim();
        if (!phone.isEmpty() && !PHONE_KE.matcher(phone).matches()) {
            errs.add(new BulkRowError(rowNum, "phone", phone,
                    "Must be a valid Kenyan phone number (+254XXXXXXXXX or 07XXXXXXXX)"));
        }
        String kraPin = row.getOrDefault("kraPin", "").trim().toUpperCase();
        if (!kraPin.isEmpty() && !KRA_PIN.matcher(kraPin).matches()) {
            errs.add(new BulkRowError(rowNum, "kraPin", kraPin,
                    "Invalid KRA PIN format — expected letter + 9 digits + letter (e.g. A123456789B)"));
        }
        String nssf = row.getOrDefault("nssfNumber", "").trim();
        if (!nssf.isEmpty() && !NSSF_NUM.matcher(nssf).matches()) {
            errs.add(new BulkRowError(rowNum, "nssfNumber", nssf,
                    "NSSF number must be 5–10 digits"));
        }
        String shif = row.getOrDefault("shifNumber", "").trim();
        if (!shif.isEmpty() && !NSSF_NUM.matcher(shif).matches()) {
            errs.add(new BulkRowError(rowNum, "shifNumber", shif,
                    "SHIF number must be 5–10 digits"));
        }

        return errs;
    }

    // ─── Commit ───────────────────────────────────────────────────────────────

    @Transactional
    public BulkCommitResult commit(UUID batchId, boolean validRowsOnly) throws IOException {
        String tenantId = TenantContext.requireTenantId();
        BulkUploadBatch batch = batchRepository.findByIdAndTenantId(batchId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("BulkUploadBatch", batchId));

        if ("COMMITTED".equals(batch.getStatus())) {
            throw new BusinessRuleException("ALREADY_COMMITTED", "This upload batch has already been committed.");
        }
        if (!validRowsOnly && batch.getErrorCount() > 0) {
            throw new BusinessRuleException("HAS_ERRORS",
                    "File has " + batch.getErrorCount() + " errors. Use 'validRowsOnly=true' or fix and re-upload.");
        }

        List<Map<String,String>> rows = objectMapper.readValue(
                batch.getValidatedRows(), new TypeReference<>() {});

        List<Department> depts = departmentRepository.findByTenantIdAndActiveTrue(tenantId);
        List<Position>   poses = positionRepository.findByTenantIdAndActiveTrue(tenantId);
        Map<String,Department> deptMap = new HashMap<>();
        Map<String,Position>   posMap  = new HashMap<>();
        depts.forEach(d -> deptMap.put(d.getName().toLowerCase(), d));
        poses.forEach(p -> posMap.put(p.getTitle().toLowerCase(), p));

        List<UUID> created = new ArrayList<>();
        for (Map<String,String> row : rows) {
            Employee emp = createFromRow(row, tenantId, deptMap, posMap, batchId.toString());
            emp = employeeRepository.save(emp);
            created.add(emp.getId());
        }

        batch.markCommitted();
        batchRepository.save(batch);
        return new BulkCommitResult(created.size(), created);
    }

    private Employee createFromRow(Map<String,String> row, String tenantId,
                                   Map<String,Department> deptMap, Map<String,Position> posMap,
                                   String committedBy) {
        String deptKey  = row.get("departmentName").trim().toLowerCase();
        String posKey   = row.get("positionName").trim().toLowerCase();
        Department dept = deptMap.get(deptKey);
        Position   pos  = posMap.get(posKey);

        BigDecimal salary = new BigDecimal(row.get("basicSalary").trim().replace(",", ""));
        SalaryStructure ss = new SalaryStructure(Money.of(salary, "KES"),
                null, null, null, null, null);

        LocalDate hireDate = LocalDate.parse(row.get("dateOfJoining").trim());
        String empNum = numberGenerator.generate(tenantId);

        // Optional ID/statutory fields are NULL when absent (collected later at
        // activation). Storing NULL — not colliding placeholders — keeps the
        // (tenant_id, phone_number)/(tenant_id, national_id) unique indexes happy
        // across multiple incomplete rows. See V10 migration / EMP-BACKLOG-002.
        String phone      = nullIfBlank(row.getOrDefault("phone", "").trim());
        String nationalId = nullIfBlank(row.getOrDefault("nationalId", "").trim());
        String nhifNum    = nullIfBlank(row.getOrDefault("shifNumber", "").trim());
        String nssfNum    = nullIfBlank(row.getOrDefault("nssfNumber", "").trim());

        Employee emp = Employee.create(tenantId, empNum,
                row.get("firstName").trim(), row.get("lastName").trim(),
                nationalId,
                phone, row.get("workEmail").trim().toLowerCase(),
                nullIfBlank(row.getOrDefault("kraPin","").trim().toUpperCase()),
                nhifNum,
                nssfNum,
                EmploymentType.PERMANENT, ss, dept, pos, hireDate);

        // Mark as pending account activation
        emp.setPendingActivation(true);
        return emp;
    }

    // ─── Pending activation list ──────────────────────────────────────────────

    public List<Map<String,Object>> listPendingActivation() {
        String tenantId = TenantContext.requireTenantId();
        return employeeRepository.findByTenantIdAndPendingActivationTrue(tenantId).stream()
                .map(e -> {
                    Map<String,Object> m = new LinkedHashMap<>();
                    m.put("id",            e.getId());
                    m.put("employeeNumber", e.getEmployeeNumber());
                    m.put("firstName",      e.getFirstName());
                    m.put("lastName",       e.getLastName());
                    m.put("email",          e.getEmail());
                    m.put("phoneNumber",    e.getPhoneNumber());
                    m.put("departmentName", e.getDepartment() != null ? e.getDepartment().getName() : null);
                    m.put("positionTitle",  e.getPosition() != null ? e.getPosition().getTitle() : null);
                    return m;
                }).toList();
    }

    // ─── Activate selected employees ──────────────────────────────────────────

    @Transactional
    public List<ActivationResult> activate(List<UUID> employeeIds, String callerToken) {
        String tenantId = TenantContext.requireTenantId();
        List<ActivationResult> results = new ArrayList<>();

        for (UUID empId : employeeIds) {
            employeeRepository.findByIdAndTenantId(empId, tenantId).ifPresent(emp -> {
                ActivationResult result = provisionUser(emp, tenantId, callerToken);
                results.add(result);
                if (result.success()) {
                    emp.setPendingActivation(false);
                    employeeRepository.save(emp);
                }
            });
        }
        return results;
    }

    @SuppressWarnings("unchecked")
    private ActivationResult provisionUser(Employee emp, String tenantId, String callerToken) {
        try {
            Map<String,String> req = Map.of(
                    "employeeId", emp.getId().toString(),
                    "email",      emp.getEmail() != null ? emp.getEmail() : "",
                    "phone",      emp.getPhoneNumber(),
                    "tenantId",   tenantId);

            var headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + callerToken);
            headers.set("X-Tenant-ID", tenantId);
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            var entity = new org.springframework.http.HttpEntity<>(req, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    authServiceUrl + "/api/v1/auth/employees/provision", entity, Map.class);

            Map<?,?> body = response.getBody();
            String tempPwd = body != null ? (String) body.get("temporaryPassword") : null;
            return new ActivationResult(emp.getId(),
                    emp.getFirstName() + " " + emp.getLastName(),
                    emp.getEmail(), tempPwd, true, null, null);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Try to extract the machine-readable error code from the auth-service response.
            String errorCode = null;
            String errorMessage = e.getMessage();
            try {
                Map<?,?> body = objectMapper.readValue(e.getResponseBodyAsString(), Map.class);
                errorCode    = (String) body.get("error");
                errorMessage = (String) body.get("message");
            } catch (Exception ignored) { /* fall through with raw message */ }
            return new ActivationResult(emp.getId(),
                    emp.getFirstName() + " " + emp.getLastName(),
                    emp.getEmail(), null, false, errorCode, errorMessage);
        } catch (Exception e) {
            return new ActivationResult(emp.getId(),
                    emp.getFirstName() + " " + emp.getLastName(),
                    emp.getEmail(), null, false, null, e.getMessage());
        }
    }

    // ─── Parsing ──────────────────────────────────────────────────────────────

    private List<Map<String,String>> parseFile(MultipartFile file) throws IOException {
        String ct = file.getContentType();
        boolean isExcel = ct != null && (ct.contains("spreadsheetml") || ct.contains("excel")
                || file.getOriginalFilename() != null && file.getOriginalFilename().endsWith(".xlsx"));
        return isExcel ? parseExcel(file) : parseCsv(file);
    }

    private List<Map<String,String>> parseExcel(MultipartFile file) throws IOException {
        List<Map<String,String>> rows = new ArrayList<>();
        try (XSSFWorkbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            Row hdr = sheet.getRow(0);
            if (hdr == null) return rows;
            List<String> cols = new ArrayList<>();
            for (Cell c : hdr) cols.add(c.getStringCellValue().replace("*","").trim());

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                Map<String,String> m = new LinkedHashMap<>();
                for (int c = 0; c < cols.size(); c++) {
                    Cell cell = row.getCell(c);
                    m.put(cols.get(c), cell == null ? "" : cellToString(cell));
                }
                if (m.values().stream().anyMatch(v -> !v.isBlank())) rows.add(m);
            }
        }
        return rows;
    }

    private List<Map<String,String>> parseCsv(MultipartFile file) throws IOException {
        String content = new String(file.getBytes());
        String[] lines = content.split("\\r?\\n");
        if (lines.length < 2) return List.of();
        String[] headers = lines[0].split(",");
        for (int i = 0; i < headers.length; i++) headers[i] = headers[i].replace("*","").trim();
        List<Map<String,String>> rows = new ArrayList<>();
        for (int i = 1; i < lines.length; i++) {
            if (lines[i].isBlank()) continue;
            String[] vals = lines[i].split(",", -1);
            Map<String,String> m = new LinkedHashMap<>();
            for (int j = 0; j < headers.length; j++) {
                m.put(headers[j], j < vals.length ? vals[j].trim() : "");
            }
            rows.add(m);
        }
        return rows;
    }

    private static String cellToString(Cell c) {
        if (c.getCellType() == CellType.NUMERIC) {
            double v = c.getNumericCellValue();
            return v == Math.floor(v) ? String.valueOf((long) v) : String.valueOf(v);
        }
        return c.toString().trim();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static String nullIfBlank(String s) {
        return s == null || s.isBlank() ? null : s;
    }

    /** Levenshtein distance — returns closest name within maxDist, or null. */
    private static String bestMatch(String input, List<String> candidates, int maxDist) {
        String best = null; int bestDist = maxDist + 1;
        for (String c : candidates) {
            int d = levenshtein(input.toLowerCase(), c.toLowerCase());
            if (d < bestDist) { bestDist = d; best = c; }
        }
        return best;
    }

    private static int levenshtein(String a, String b) {
        int[] dp = new int[b.length() + 1];
        for (int j = 0; j <= b.length(); j++) dp[j] = j;
        for (int i = 1; i <= a.length(); i++) {
            int prev = i;
            for (int j = 1; j <= b.length(); j++) {
                int curr = Math.min(dp[j] + 1, Math.min(prev + 1,
                        dp[j-1] + (a.charAt(i-1) == b.charAt(j-1) ? 0 : 1)));
                dp[j-1] = prev; prev = curr;
            }
            dp[b.length()] = prev;
        }
        return dp[b.length()];
    }
}
