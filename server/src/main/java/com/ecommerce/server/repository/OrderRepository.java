package com.ecommerce.server.repository;

import com.ecommerce.server.models.Order;
import com.ecommerce.server.models.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // EntityGraph: single SQL με LEFT JOIN, αποφεύγει το N+1 για items
    // (χωρίς pagination, single collection — δεν έχει multi-bag/in-memory issue).
    @EntityGraph(attributePaths = "items")
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = "items")
    List<Order> findByStatus(OrderStatus status);

    // Paged variant για admin endpoints — αποφεύγει load-all σε βάσεις
    // με χιλιάδες orders. Χωρίς EntityGraph (collection fetch + pagination
    // → in-memory paging warning). Τα items φορτώνονται lazy/batched.
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}