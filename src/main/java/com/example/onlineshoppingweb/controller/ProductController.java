package com.example.onlineshoppingweb.controller;

import com.example.onlineshoppingweb.dto.ApiResponse;
import com.example.onlineshoppingweb.model.Product;
import com.example.onlineshoppingweb.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<Product> products = productRepository.findAll(PageRequest.of(page, size));
        return ResponseEntity.ok(new ApiResponse<>(true, "Products fetched successfully", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(new ApiResponse<>(true, "Product found", product)))
                .orElse(ResponseEntity.status(404).body(new ApiResponse<>(false, "Product not found", null)));
    }
}
