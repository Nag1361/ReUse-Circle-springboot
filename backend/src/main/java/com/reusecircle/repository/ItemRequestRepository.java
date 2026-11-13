package com.reusecircle.repository;


import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import com.reusecircle.entity.ItemRequest;

public interface ItemRequestRepository extends JpaRepository<ItemRequest, Long> {
    @Query("SELECT r.listing.id FROM ItemRequest r WHERE r.id = :id")
    Optional<Long> findListingIdByRequestId(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM ItemRequest r WHERE r.id = :id")
    Optional<ItemRequest> findByIdForUpdate(@Param("id") Long id);

    boolean existsByListingIdAndRequesterId(Long listingId, Long requesterId);
    // A locking read sees requests committed before the listing lock was acquired,
    // including a request created while an acceptance call was waiting.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<ItemRequest> findByListingIdOrderByIdAsc(Long listingId);
    List<ItemRequest> findByRequesterIdOrderByIdDesc(Long requesterId);
    List<ItemRequest> findByListingOwnerIdOrderByIdDesc(Long ownerId);
}
