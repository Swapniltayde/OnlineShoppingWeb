package com.example.onlineshoppingweb.dto;

import java.math.BigDecimal;

public class OrderItemResponse {
    private Long productId;
    private String title;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal unitPrice;

    public OrderItemResponse() {}

    public OrderItemResponse(Long productId, String title, String imageUrl, Integer quantity, BigDecimal unitPrice) {
        this.productId = productId;
        this.title = title;
        this.imageUrl = imageUrl;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }

    // Getters and Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
