package com.reusecircle.service;


import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.reusecircle.dto.*;
import com.reusecircle.entity.*;
import com.reusecircle.repository.*;

@Service @RequiredArgsConstructor
public class ItemRequestService {
    private final ListingRepository listingRepository;
    private final ItemRequestRepository requestRepository;
    private final UserRepository userRepository;

    @Transactional
    public ItemRequestResponse create(Long listingId, ItemRequestInput input, Long userId) {
        Listing listing = lockListing(listingId);
        if (listing.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot request your own item");
        }
        if (listing.getStatus() != ListingStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This item is no longer available");
        }
        if (requestRepository.existsByListingIdAndRequesterId(listingId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already requested this item");
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again"));
        ItemRequest request = new ItemRequest();
        request.setListing(listing);
        request.setRequester(user);
        request.setMessage(input.getMessage() == null ? "" : input.getMessage().trim());
        return convertToResponse(requestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<ItemRequestResponse> getSent(Long userId) {
        List<ItemRequestResponse> responses = new ArrayList<>();
        for (ItemRequest request : requestRepository.findByRequesterIdOrderByIdDesc(userId)) {
            responses.add(convertToResponse(request));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public List<ItemRequestResponse> getReceived(Long userId) {
        List<ItemRequestResponse> responses = new ArrayList<>();
        for (ItemRequest request : requestRepository.findByListingOwnerIdOrderByIdDesc(userId)) {
            responses.add(convertToResponse(request));
        }
        return responses;
    }

    @Transactional
    public ItemRequestResponse updateStatus(Long requestId, RequestStatusInput input, Long userId) {
        if (input.getStatus() == RequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose ACCEPTED or DECLINED");
        }
        // First get an ID, then use current locking reads rather than a stale request snapshot.
        Long listingId = requestRepository.findListingIdByRequestId(requestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        Listing listing = lockListing(listingId);
        if (!listing.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the listing owner can decide requests");
        }
        ItemRequest initial = requestRepository.findByIdForUpdate(requestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        if (initial.getStatus() != RequestStatus.PENDING || listing.getStatus() != ListingStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This request can no longer be changed");
        }
        initial.setStatus(input.getStatus());
        if (input.getStatus() == RequestStatus.ACCEPTED) {
            listing.setStatus(ListingStatus.RESERVED);
            for (ItemRequest other : requestRepository.findByListingIdOrderByIdAsc(listingId)) {
                if (!other.getId().equals(requestId) && other.getStatus() == RequestStatus.PENDING) {
                    other.setStatus(RequestStatus.DECLINED);
                }
            }
        }
        // JPA commits the request, listing and other declines together, then releases the lock.
        return convertToResponse(initial);
    }

    private Listing lockListing(Long id) {
        return listingRepository.findByIdForUpdate(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
    }

    private ItemRequestResponse convertToResponse(ItemRequest request) {
        return new ItemRequestResponse(request.getId(), request.getListing().getId(),
            request.getListing().getTitle(), request.getListing().getStatus(), request.getRequester().getId(),
            request.getRequester().getName(), request.getMessage(), request.getStatus());
    }
}
