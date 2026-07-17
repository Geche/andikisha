package com.andikisha.recruitment.presentation.controller;

import com.andikisha.recruitment.application.dto.request.CreatePostingRequest;
import com.andikisha.recruitment.application.dto.response.PostingResponse;
import com.andikisha.recruitment.application.service.PostingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment/postings")
@Tag(name = "Job Postings", description = "Published job adverts")
public class PostingController {

    private final PostingService postingService;

    public PostingController(PostingService postingService) {
        this.postingService = postingService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "List job postings")
    public List<PostingResponse> list(@RequestHeader("X-Tenant-ID") String tenantId) {
        return postingService.listPostings();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get a job posting by ID")
    public PostingResponse get(@RequestHeader("X-Tenant-ID") String tenantId,
                               @PathVariable UUID id) {
        return postingService.getPosting(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a job posting against an active pipeline template")
    public PostingResponse create(@RequestHeader("X-Tenant-ID") String tenantId,
                                  @Valid @RequestBody CreatePostingRequest request) {
        return postingService.createPosting(request);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Publish a job posting")
    public PostingResponse publish(@RequestHeader("X-Tenant-ID") String tenantId,
                                   @PathVariable UUID id) {
        return postingService.publishPosting(id);
    }
}
