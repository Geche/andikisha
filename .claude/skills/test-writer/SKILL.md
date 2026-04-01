---
name: test-writer
description: Testing patterns for AndikishaHR Spring Boot microservices. Auto-applies when writing unit tests, integration tests, or end-to-end tests. Covers JUnit 5, Mockito, Testcontainers, MockMvc, and gRPC test patterns.
---

# Testing Patterns

## Test Directory Structure

```
src/test/java/com/andikisha/{service}/
  unit/              # Service logic with mocked dependencies
  integration/       # Repository + DB, gRPC server, RabbitMQ
  e2e/               # Full HTTP flow with real dependencies
```

## Unit Test Pattern (Service Layer)

```java
@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock private EmployeeRepository repository;
    @Mock private EmployeeMapper mapper;
    @Mock private EmployeeEventPublisher eventPublisher;

    @InjectMocks private EmployeeService service;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId("test-tenant");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void create_withValidRequest_returnsResponse() {
        // Given
        var request = new CreateEmployeeRequest(
            "Jane", "Doe", "12345678", "+254722123456",
            "jane@test.com", "A123456789B", "1234567",
            "9876543", BigDecimal.valueOf(150000), null
        );
        var entity = mock(Employee.class);
        var response = mock(EmployeeResponse.class);

        when(repository.save(any(Employee.class))).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(response);

        // When
        var result = service.create(request);

        // Then
        assertThat(result).isEqualTo(response);
        verify(repository).save(any(Employee.class));
        verify(eventPublisher).publishEmployeeCreated(any());
    }

    @Test
    void findById_whenNotFound_throwsException() {
        when(repository.findByIdAndTenantId(any(), eq("test-tenant")))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(UUID.randomUUID()))
            .isInstanceOf(EmployeeNotFoundException.class);
    }
}
```

## Integration Test Pattern (Repository + Testcontainers)

```java
@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Import(JpaConfig.class)
class EmployeeRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("andikisha_employee_test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private EmployeeRepository repository;

    @Test
    void findByTenantIdAndStatus_returnsOnlyMatchingTenant() {
        // Given
        var emp1 = createEmployee("tenant-1", EmploymentStatus.ACTIVE);
        var emp2 = createEmployee("tenant-2", EmploymentStatus.ACTIVE);
        repository.saveAll(List.of(emp1, emp2));

        // When
        var results = repository.findByTenantIdAndStatus(
            "tenant-1", EmploymentStatus.ACTIVE);

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTenantId()).isEqualTo("tenant-1");
    }
}
```

## E2E Test Pattern (Full HTTP)

```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class EmployeeControllerE2ETest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Container
    static RabbitMQContainer rabbitmq = new RabbitMQContainer("rabbitmq:3.13-management-alpine");

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.rabbitmq.host", rabbitmq::getHost);
        registry.add("spring.rabbitmq.port", rabbitmq::getAmqpPort);
    }

    @Autowired private TestRestTemplate restTemplate;

    @Test
    void createEmployee_returns201() {
        var request = new CreateEmployeeRequest(
            "Jane", "Doe", "12345678", "+254722123456",
            "jane@test.com", "A123456789B", "1234567",
            "9876543", BigDecimal.valueOf(150000), null
        );

        var headers = new HttpHeaders();
        headers.set("X-Tenant-ID", "test-tenant");
        headers.set("X-User-ID", "admin-user");

        var response = restTemplate.exchange(
            "/api/v1/employees",
            HttpMethod.POST,
            new HttpEntity<>(request, headers),
            EmployeeResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().firstName()).isEqualTo("Jane");
    }
}
```

## application-test.yml

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop
    open-in-view: false
  flyway:
    enabled: false
  rabbitmq:
    listener:
      simple:
        auto-startup: false

grpc:
  server:
    port: 0
  client:
    GLOBAL:
      negotiation-type: plaintext
```

## Test Rules

- Every service class gets a unit test. Mock all dependencies.
- Every repository gets an integration test with Testcontainers PostgreSQL.
- Every controller gets at least one e2e test verifying the full request cycle.
- Use AssertJ for assertions (assertThat), not JUnit assertEquals.
- Test tenant isolation: verify that tenant-1 data is not visible to tenant-2.
- Test validation: verify that invalid requests return 400 with field errors.
- Test not-found: verify that missing resources return 404.
- Name tests: methodName_givenCondition_expectedResult or methodName_whenScenario_thenOutcome.
