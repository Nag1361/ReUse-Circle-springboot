package com.reusecircle.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "item_requests", uniqueConstraints = @UniqueConstraint(
    name = "uk_request_listing_user", columnNames = {"listing_id", "requester_id"}))
@Getter @Setter @NoArgsConstructor
public class ItemRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;
    @Column(length = 500)
    private String message;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.PENDING;
}
