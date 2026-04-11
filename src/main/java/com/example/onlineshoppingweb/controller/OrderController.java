package com.example.onlineshoppingweb.controller;

import com.example.onlineshoppingweb.dto.*;
import com.example.onlineshoppingweb.model.Order;
import com.example.onlineshoppingweb.model.OrderItem;
import com.example.onlineshoppingweb.model.Product;
import com.example.onlineshoppingweb.model.User;
import com.example.onlineshoppingweb.repository.OrderRepository;
import com.example.onlineshoppingweb.repository.ProductRepository;
import com.example.onlineshoppingweb.repository.UserRepository;
import com.example.onlineshoppingweb.security.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderReq, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(orderReq.getTotalAmount());
        
        order.setItems(orderReq.getItems().stream().map(itemReq -> {
            OrderItem item = new OrderItem();
            Product product = productRepository.findById(itemReq.getProductId()).orElseThrow();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setOrder(order);
            return item;
        }).collect(Collectors.toList()));

        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(new ApiResponse<>(true, "Order placed successfully!", mapToResponse(saved)));
    }

    @GetMapping
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<OrderResponse> orders = orderRepository.findByUser_EmailOrderByCreatedAtDesc(userDetails.getUsername())
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders fetched", orders));
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> 
            new OrderItemResponse(
                item.getProduct().getId(),
                item.getProduct().getTitle(),
                item.getProduct().getImageUrl(),
                item.getQuantity(),
                item.getUnitPrice()
            )
        ).collect(Collectors.toList());

        return new OrderResponse(
            order.getId(),
            order.getTotalAmount(),
            order.getStatus().name(),
            order.getCreatedAt(),
            itemResponses
        );
    }
}

