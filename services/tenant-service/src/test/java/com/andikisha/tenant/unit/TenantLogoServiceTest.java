package com.andikisha.tenant.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.tenant.application.service.TenantLogoService;
import com.andikisha.tenant.domain.model.TenantLogo;
import com.andikisha.tenant.domain.repository.TenantLogoRepository;
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
class TenantLogoServiceTest {

    private static final String TENANT_ID = "tenant-1";

    @Mock TenantLogoRepository repository;

    private TenantLogoService service;

    @BeforeEach
    void setUp() {
        service = new TenantLogoService(repository);
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void upload_validPng_savesNewLogo() {
        when(repository.findByTenantId(TENANT_ID)).thenReturn(Optional.empty());

        service.upload("PNG-BYTES".getBytes(), "image/png");

        verify(repository).save(any(TenantLogo.class));
    }

    @Test
    void upload_caseInsensitiveContentType_accepted() {
        when(repository.findByTenantId(TENANT_ID)).thenReturn(Optional.empty());

        service.upload("x".getBytes(), "IMAGE/PNG");

        verify(repository).save(any(TenantLogo.class));
    }

    @Test
    void upload_replacesExistingLogoInPlace() {
        TenantLogo existing = TenantLogo.of(TENANT_ID, "image/png", "old".getBytes());
        when(repository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(existing));

        service.upload("new-jpeg".getBytes(), "image/jpeg");

        verify(repository).save(existing);
        assertThat(existing.getContentType()).isEqualTo("image/jpeg");
        assertThat(existing.getFileSize()).isEqualTo("new-jpeg".getBytes().length);
    }

    @Test
    void upload_unsupportedType_throwsAndDoesNotSave() {
        assertThatThrownBy(() -> service.upload("gif".getBytes(), "image/gif"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode())
                        .isEqualTo("UNSUPPORTED_LOGO_TYPE"));
        verifyNoInteractions(repository);
    }

    @Test
    void upload_tooLarge_throwsAndDoesNotSave() {
        byte[] tooBig = new byte[600 * 1024]; // over the 512 KB cap
        assertThatThrownBy(() -> service.upload(tooBig, "image/png"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode())
                        .isEqualTo("LOGO_TOO_LARGE"));
        verifyNoInteractions(repository);
    }

    @Test
    void upload_empty_throwsAndDoesNotSave() {
        assertThatThrownBy(() -> service.upload(new byte[0], "image/png"))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(e -> assertThat(((BusinessRuleException) e).getCode())
                        .isEqualTo("EMPTY_LOGO"));
        verifyNoInteractions(repository);
    }

    @Test
    void getForTenant_delegatesToRepository() {
        TenantLogo logo = TenantLogo.of(TENANT_ID, "image/png", "x".getBytes());
        when(repository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(logo));

        assertThat(service.getForTenant(TENANT_ID)).containsSame(logo);
    }
}
