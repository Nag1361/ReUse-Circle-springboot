package com.reusecircle.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import com.reusecircle.entity.*;

@Data
@AllArgsConstructor
public class ItemRequestResponse {
    private Long id;
    private Long listingId;
    private String listingTitle;
    private ListingStatus listingStatus;
    private Long requesterId;
    private String requesterName;
    private String message;
    private RequestStatus status;
}
