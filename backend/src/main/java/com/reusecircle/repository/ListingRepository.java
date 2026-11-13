package com.reusecircle.repository;


import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import com.reusecircle.entity.*;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByOwnerIdOrderByIdDesc(Long ownerId);

    @Query("SELECT l FROM Listing l WHERE " +
        "(:search = '' OR LOWER(l.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
        "(:category = '' OR LOWER(l.category) = LOWER(:category)) AND " +
        "(:condition = '' OR LOWER(l.condition) = LOWER(:condition)) AND " +
        "(:status IS NULL OR l.status = :status) ORDER BY l.id DESC")
    List<Listing> search(@Param("search") String search, @Param("category") String category,
        @Param("condition") String condition, @Param("status") ListingStatus status);

    // All changes and item requests lock this same row until the transaction finishes.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM Listing l WHERE l.id = :id")
    Optional<Listing> findByIdForUpdate(@Param("id") Long id);
}
