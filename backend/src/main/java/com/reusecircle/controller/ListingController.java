package com.reusecircle.controller;


import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.reusecircle.dto.*;
import com.reusecircle.entity.ListingStatus;
import com.reusecircle.service.ListingService;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class ListingController {
    private final ListingService listingService;

    @GetMapping("/listings")
    public List<ListingResponse> getAll(@RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "") String category, @RequestParam(defaultValue = "") String condition,
            @RequestParam(required = false) ListingStatus status) {
        return listingService.getAll(search, category, condition, status);
    }

    @GetMapping("/listings/{id}")
    public ListingResponse getById(@PathVariable Long id) { return listingService.getById(id); }

    @GetMapping("/me/listings")
    public List<ListingResponse> getMine(@AuthenticationPrincipal Long userId) {
        return listingService.getMine(userId);
    }

    @PostMapping("/listings") @ResponseStatus(HttpStatus.CREATED)
    public ListingResponse create(@Valid @RequestBody ListingInput input, @AuthenticationPrincipal Long userId) {
        return listingService.create(input, userId);
    }

    @PutMapping("/listings/{id}")
    public ListingResponse update(@PathVariable Long id, @Valid @RequestBody ListingInput input,
                                  @AuthenticationPrincipal Long userId) {
        return listingService.update(id, input, userId);
    }

    @DeleteMapping("/listings/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal Long userId) {
        listingService.delete(id, userId);
    }

    @PatchMapping("/listings/{id}/collected")
    public ListingResponse markCollected(@PathVariable Long id, @AuthenticationPrincipal Long userId) {
        return listingService.markCollected(id, userId);
    }
}
