package com.reusecircle.service;


import java.net.URI;
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
public class ListingService {
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ItemRequestRepository requestRepository;

    @Transactional(readOnly = true)
    public List<ListingResponse> getAll(String search, String category, String condition, ListingStatus status) {
        List<ListingResponse> responses = new ArrayList<>();
        for (Listing listing : listingRepository.search(search.trim(), category.trim(), condition.trim(), status)) {
            responses.add(convertToResponse(listing));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public ListingResponse getById(Long id) {
        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
        return convertToResponse(listing);
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> getMine(Long userId) {
        List<ListingResponse> responses = new ArrayList<>();
        for (Listing listing : listingRepository.findByOwnerIdOrderByIdDesc(userId)) {
            responses.add(convertToResponse(listing));
        }
        return responses;
    }

    @Transactional
    public ListingResponse create(ListingInput input, Long userId) {
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please log in again"));
        Listing listing = new Listing();
        listing.setOwner(owner);
        applyInput(listing, input);
        return convertToResponse(listingRepository.save(listing));
    }

    @Transactional
    public ListingResponse update(Long id, ListingInput input, Long userId) {
        Listing listing = getLocked(id);
        checkOwner(listing, userId);
        if (listing.getStatus() != ListingStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only available listings can be edited");
        }
        applyInput(listing, input);
        return convertToResponse(listing);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Listing listing = getLocked(id);
        checkOwner(listing, userId);
        // Explicit child deletion keeps the three entities unidirectional.
        requestRepository.deleteAll(requestRepository.findByListingIdOrderByIdAsc(id));
        requestRepository.flush();
        listingRepository.delete(listing);
    }

    @Transactional
    public ListingResponse markCollected(Long id, Long userId) {
        Listing listing = getLocked(id);
        checkOwner(listing, userId);
        if (listing.getStatus() != ListingStatus.RESERVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only reserved listings can be marked collected");
        }
        listing.setStatus(ListingStatus.COLLECTED);
        return convertToResponse(listing);
    }

    private Listing getLocked(Long id) {
        return listingRepository.findByIdForUpdate(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Listing not found"));
    }

    private void checkOwner(Listing listing, Long userId) {
        if (!listing.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can modify this listing");
        }
    }

    private void applyInput(Listing listing, ListingInput input) {
        String imageUrl = input.getImageUrl() == null ? "" : input.getImageUrl().trim();
        if (!imageUrl.isEmpty()) {
            try {
                URI uri = URI.create(imageUrl);
                if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme()))
                    || uri.getHost() == null || uri.getUserInfo() != null) {
                    throw new IllegalArgumentException();
                }
            } catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image URL must be a valid http or https URL");
            }
        }
        listing.setTitle(input.getTitle().trim());
        listing.setCategory(input.getCategory().trim());
        listing.setCondition(input.getCondition().trim());
        listing.setDescription(input.getDescription().trim());
        listing.setPickupArea(input.getPickupArea().trim());
        listing.setImageUrl(imageUrl);
    }

    public ListingResponse convertToResponse(Listing listing) {
        return new ListingResponse(listing.getId(), listing.getOwner().getId(), listing.getOwner().getName(),
            listing.getTitle(), listing.getCategory(), listing.getCondition(), listing.getDescription(),
            listing.getPickupArea(), listing.getImageUrl(), listing.getStatus());
    }
}
