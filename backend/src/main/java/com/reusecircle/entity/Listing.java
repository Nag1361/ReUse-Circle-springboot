package com.reusecircle.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity @Table(name = "listings")
@Getter @Setter @NoArgsConstructor
public class Listing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    @Column(nullable = false, length = 120)
    private String title;
    @Column(nullable = false, length = 60)
    private String category;
    @Column(name = "item_condition", nullable = false, length = 60)
    private String condition;
    @Column(nullable = false, length = 2000)
    private String description;
    @Column(nullable = false, length = 160)
    private String pickupArea;
    @Column(length = 1000)
    private String imageUrl;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private ListingStatus status = ListingStatus.AVAILABLE;
}
