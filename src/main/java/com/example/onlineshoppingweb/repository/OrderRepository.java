package com.example.onlineshoppingweb.repository;

import com.example.onlineshoppingweb.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser_EmailOrderByCreatedAtDesc(String email);
}
