package com.andikisha.tenant.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.tenant.application.service.TenantSignatoryService;
import com.andikisha.tenant.domain.model.TenantSignatory;
import com.andikisha.tenant.domain.repository.TenantSignatoryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TenantSignatoryServiceTest {

    private static final String TENANT_ID = "tenant-1";

    @Mock TenantSignatoryRepository repository;

    private TenantSignatoryService service;

    @BeforeEach
    void setUp() {
        service = new TenantSignatoryService(repository);
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void upload_valid_savesNewSignatory() {
        when(repository.findByTenantId(TENANT_ID)).thenReturn(Optional.empty());

        service.upload("Jane Manager", "HR Manager", "SIG".getBytes(), "image/png");

        verify(repository).save(any(TenantSignatory.class));
    }

    @Test
    void upload_replacesExistingInPlace() {
        TenantSignatory existing = TenantSignatory.of(TENANT_ID, "Old", "Old Title", "image/png", "x".getBytes());
        when(repository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(existing));

        service.upload("New Name", "New Title", "new".getBytes(), "image/jpeg");

        verify(repository).save(existing);
        assertThat(existing.getName()).isEqualTo("New Name");
        assertThat(existing.getTitle()).isEqualTo("New Title");
        assertThat(existing.getSignatureContentType()).isEqualTo("image/jpeg");
    }

    @Test
    void upload_blankName_throws() {
        assertThatThrownBy(() -> service.upload("  ", "Title", "x".getBytes(), "image/png"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("SIGNATORY_NAME_REQUIRED"));
        verifyNoInteractions(repository);
    }

    @Test
    void upload_blankTitle_throws() {
        assertThatThrownBy(() -> service.upload("Name", "", "x".getBytes(), "image/png"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("SIGNATORY_TITLE_REQUIRED"));
        verifyNoInteractions(repository);
    }

    @Test
    void upload_unsupportedType_throws() {
        assertThatThrownBy(() -> service.upload("Name", "Title", "gif".getBytes(), "image/gif"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("UNSUPPORTED_SIGNATURE_TYPE"));
        verifyNoInteractions(repository);
    }

    @Test
    void upload_tooLarge_throws() {
        byte[] tooBig = new byte[600 * 1024];
        assertThatThrownBy(() -> service.upload("Name", "Title", tooBig, "image/png"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("SIGNATURE_TOO_LARGE"));
        verifyNoInteractions(repository);
    }

    @Test
    void upload_emptySignature_throws() {
        assertThatThrownBy(() -> service.upload("Name", "Title", new byte[0], "image/png"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode()).isEqualTo("EMPTY_SIGNATURE"));
        verifyNoInteractions(repository);
    }
}
