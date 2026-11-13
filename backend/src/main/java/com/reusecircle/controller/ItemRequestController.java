package com.reusecircle.controller;


import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.reusecircle.dto.*;
import com.reusecircle.service.ItemRequestService;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class ItemRequestController {
    private final ItemRequestService requestService;

    @PostMapping("/listings/{id}/requests") @ResponseStatus(HttpStatus.CREATED)
    public ItemRequestResponse create(@PathVariable Long id, @Valid @RequestBody ItemRequestInput input,
                                     @AuthenticationPrincipal Long userId) {
        return requestService.create(id, input, userId);
    }

    @GetMapping("/me/requests")
    public List<ItemRequestResponse> getSent(@AuthenticationPrincipal Long userId) {
        return requestService.getSent(userId);
    }

    @GetMapping("/me/received-requests")
    public List<ItemRequestResponse> getReceived(@AuthenticationPrincipal Long userId) {
        return requestService.getReceived(userId);
    }

    @PatchMapping("/requests/{id}/status")
    public ItemRequestResponse updateStatus(@PathVariable Long id, @Valid @RequestBody RequestStatusInput input,
                                           @AuthenticationPrincipal Long userId) {
        return requestService.updateStatus(id, input, userId);
    }
}
