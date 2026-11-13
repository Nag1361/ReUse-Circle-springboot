package com.reusecircle.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import com.reusecircle.entity.*;

@Data
@AllArgsConstructor
public class ListingResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String title;
    private String category;
    private String condition;
    private String description;
    private String pickupArea;
    private String imageUrl;
    private ListingStatus status;
}
