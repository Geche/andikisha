package com.andikisha.tenant.unit;

import com.andikisha.proto.tenant.GetTenantRequest;
import com.andikisha.proto.tenant.TenantResponse;
import com.andikisha.proto.tenant.VerifyTenantRequest;
import com.andikisha.proto.tenant.VerifyTenantResponse;
import com.andikisha.tenant.application.service.TenantService;
import com.andikisha.tenant.domain.exception.TenantNotFoundException;
import com.andikisha.tenant.infrastructure.grpc.TenantGrpcService;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TenantGrpcServiceTest {

    @Mock private TenantService tenantService;

    @InjectMocks private TenantGrpcService grpcService;

    @Test
    @SuppressWarnings("unchecked")
    void getTenant_whenFound_returnsProtoResponse() {
        UUID id = UUID.randomUUID();
        var appResponse = new com.andikisha.tenant.application.dto.response.TenantResponse(
                id, "Acme Ltd", "KE", "KES", null, null, null,
                "admin@acme.co.ke", "+254722000001",
                "ACTIVE", "Starter", "STARTER", null,
                "MONTHLY", 28, LocalDateTime.now()
        );
        when(tenantService.getById(id)).thenReturn(appResponse);

        StreamObserver<TenantResponse> observer = org.mockito.Mockito.mock(StreamObserver.class);
        grpcService.getTenant(
                GetTenantRequest.newBuilder().setTenantId(id.toString()).build(),
                observer);

        ArgumentCaptor<TenantResponse> captor = ArgumentCaptor.forClass(TenantResponse.class);
        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();

        TenantResponse proto = captor.getValue();
        assertThat(proto.getId()).isEqualTo(id.toString());
        assertThat(proto.getName()).isEqualTo("Acme Ltd");
        assertThat(proto.getPlan()).isEqualTo("Starter");
        assertThat(proto.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    @SuppressWarnings("unchecked")
    void getTenant_whenNotFound_sendsNotFoundError() {
        UUID id = UUID.randomUUID();
        when(tenantService.getById(id)).thenThrow(new TenantNotFoundException(id));

        StreamObserver<TenantResponse> observer = org.mockito.Mockito.mock(StreamObserver.class);
        grpcService.getTenant(
                GetTenantRequest.newBuilder().setTenantId(id.toString()).build(),
                observer);

        ArgumentCaptor<Throwable> errorCaptor = ArgumentCaptor.forClass(Throwable.class);
        verify(observer).onError(errorCaptor.capture());

        Throwable error = errorCaptor.getValue();
        // gRPC server-side uses asException() which returns StatusException
        assertThat(error).isInstanceOfAny(
                io.grpc.StatusException.class, StatusRuntimeException.class);
        io.grpc.Status status = error instanceof StatusRuntimeException
                ? ((StatusRuntimeException) error).getStatus()
                : ((io.grpc.StatusException) error).getStatus();
        assertThat(status.getCode()).isEqualTo(io.grpc.Status.Code.NOT_FOUND);
    }

    @Test
    @SuppressWarnings("unchecked")
    void verifyTenantActive_whenActiveStatus_returnsActiveTrue() {
        UUID id = UUID.randomUUID();
        var appResponse = new com.andikisha.tenant.application.dto.response.TenantResponse(
                id, "Active Co", "KE", "KES", null, null, null,
                "admin@active.co.ke", "+254722000002",
                "ACTIVE", "Professional", "PROFESSIONAL", null,
                "MONTHLY", 28, LocalDateTime.now()
        );
        when(tenantService.getById(id)).thenReturn(appResponse);

        StreamObserver<VerifyTenantResponse> observer = org.mockito.Mockito.mock(StreamObserver.class);
        grpcService.verifyTenantActive(
                VerifyTenantRequest.newBuilder().setTenantId(id.toString()).build(),
                observer);

        ArgumentCaptor<VerifyTenantResponse> captor = ArgumentCaptor.forClass(VerifyTenantResponse.class);
        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();

        assertThat(captor.getValue().getActive()).isTrue();
        assertThat(captor.getValue().getPlan()).isEqualTo("Professional");
    }

    @Test
    @SuppressWarnings("unchecked")
    void verifyTenantActive_whenSuspended_returnsActiveFalse() {
        UUID id = UUID.randomUUID();
        var appResponse = new com.andikisha.tenant.application.dto.response.TenantResponse(
                id, "Suspended Co", "KE", "KES", null, null, null,
                "admin@sus.co.ke", "+254722000003",
                "SUSPENDED", "Starter", "STARTER", null,
                "MONTHLY", 28, LocalDateTime.now()
        );
        when(tenantService.getById(id)).thenReturn(appResponse);

        StreamObserver<VerifyTenantResponse> observer = org.mockito.Mockito.mock(StreamObserver.class);
        grpcService.verifyTenantActive(
                VerifyTenantRequest.newBuilder().setTenantId(id.toString()).build(),
                observer);

        ArgumentCaptor<VerifyTenantResponse> captor = ArgumentCaptor.forClass(VerifyTenantResponse.class);
        verify(observer).onNext(captor.capture());
        assertThat(captor.getValue().getActive()).isFalse();
        assertThat(captor.getValue().getPlan()).isEmpty();
    }

    @Test
    @SuppressWarnings("unchecked")
    void verifyTenantActive_whenTrialNotExpired_returnsActiveTrue() {
        UUID id = UUID.randomUUID();
        var appResponse = new com.andikisha.tenant.application.dto.response.TenantResponse(
                id, "Trial Co", "KE", "KES", null, null, null,
                "admin@trial.co.ke", "+254722000004",
                "TRIAL", "Starter", "STARTER",
                LocalDate.now().plusDays(7),  // trial not expired
                "MONTHLY", 28, LocalDateTime.now()
        );
        when(tenantService.getById(id)).thenReturn(appResponse);

        StreamObserver<VerifyTenantResponse> observer = org.mockito.Mockito.mock(StreamObserver.class);
        grpcService.verifyTenantActive(
                VerifyTenantRequest.newBuilder().setTenantId(id.toString()).build(),
                observer);

        ArgumentCaptor<VerifyTenantResponse> captor = ArgumentCaptor.forClass(VerifyTenantResponse.class);
        verify(observer).onNext(captor.capture());
        assertThat(captor.getValue().getActive()).isTrue();
    }

    @Test
    @SuppressWarnings("unchecked")
    void verifyTenantActive_whenTrialExpired_returnsActiveFalse() {
        UUID id = UUID.randomUUID();
        var appResponse = new com.andikisha.tenant.application.dto.response.TenantResponse(
                id, "Expired Trial Co", "KE", "KES", null, null, null,
                "admin@expired.co.ke", "+254722000005",
                "TRIAL", "Starter", "STARTER",
                LocalDate.now().minusDays(1),  // expired yesterday
                "MONTHLY", 28, LocalDateTime.now()
        );
        when(tenantService.getById(id)).thenReturn(appResponse);

        StreamObserver<VerifyTenantResponse> observer = org.mockito.Mockito.mock(StreamObserver.class);
        grpcService.verifyTenantActive(
                VerifyTenantRequest.newBuilder().setTenantId(id.toString()).build(),
                observer);

        ArgumentCaptor<VerifyTenantResponse> captor = ArgumentCaptor.forClass(VerifyTenantResponse.class);
        verify(observer).onNext(captor.capture());
        assertThat(captor.getValue().getActive()).isFalse();
    }

    @Test
    @SuppressWarnings("unchecked")
    void verifyTenantActive_whenTenantNotFound_returnsActiveFalse() {
        UUID id = UUID.randomUUID();
        when(tenantService.getById(id)).thenThrow(new TenantNotFoundException(id));

        StreamObserver<VerifyTenantResponse> observer = org.mockito.Mockito.mock(StreamObserver.class);
        grpcService.verifyTenantActive(
                VerifyTenantRequest.newBuilder().setTenantId(id.toString()).build(),
                observer);

        ArgumentCaptor<VerifyTenantResponse> captor = ArgumentCaptor.forClass(VerifyTenantResponse.class);
        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();
        assertThat(captor.getValue().getActive()).isFalse();
    }
}
