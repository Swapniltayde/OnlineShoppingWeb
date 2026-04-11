package com.example.onlineshoppingweb;

import com.example.onlineshoppingweb.model.Category;
import com.example.onlineshoppingweb.model.Product;
import com.example.onlineshoppingweb.repository.ProductRepository;
import com.example.onlineshoppingweb.repository.UserRepository;
import com.example.onlineshoppingweb.model.User;
import com.example.onlineshoppingweb.model.Role;
import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    public DataInitializer(ProductRepository productRepository, UserRepository userRepository, 
                           PasswordEncoder passwordEncoder, EntityManager entityManager) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Create Admin User if not exists
        if (!userRepository.existsByEmail("admin@shop.com")) {
            User admin = new User();
            admin.setFullName("Admin User");
            admin.setEmail("admin@shop.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        // 2. Initial Categories and Products (only if empty)
        if (productRepository.count() == 0) {
            Map<String, Category> categories = new HashMap<>();
            String[] catNames = {"Electronics", "Laptops", "Accessories", "Furniture", "Footwear", "Cameras", "Kitchen", "Mobiles", "Smart Home", "Watches", "Fashion", "Sports"};
            
            for (String name : catNames) {
                Category cat = new Category();
                cat.setName(name);
                cat.setDescription(name + " category products");
                entityManager.persist(cat);
                categories.put(name, cat);
            }

            // Products list
            addProduct("Sony WH-1000XM5 Headphones", "SKU001", 28990, "Electronics", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Apple MacBook Air M2", "SKU002", 114900, "Laptops", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Mechanical RGB Keyboard", "SKU003", 5499, "Accessories", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Ergonomic Mesh Chair", "SKU004", 18999, "Furniture", "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Samsung 65\" 4K QLED TV", "SKU005", 89999, "Electronics", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Nike Air Max 270", "SKU006", 12995, "Footwear", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Nikon Z50 Camera", "SKU007", 67990, "Cameras", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Philips Air Fryer XXL", "SKU008", 11995, "Kitchen", "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("realme Narzo 70 Pro 5G", "SKU009", 23999, "Mobiles", "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Wipro Smart LED Bulb Pack", "SKU010", 1299, "Smart Home", "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Titan Kairos Analog Watch", "SKU011", 4995, "Watches", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Lavie Women's Tote Bag", "SKU012", 2499, "Fashion", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("boAt Rockerz 450 Pro", "SKU013", 1799, "Electronics", "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("HP DeskJet 2331 Printer", "SKU014", 4499, "Electronics", "https://images.unsplash.com/photo-1612198790700-0e3cc86bce90?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Instant Pot Duo 7-in-1", "SKU015", 8999, "Kitchen", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Adidas Sports T-Shirt", "SKU016", 1499, "Fashion", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Logitech MX Master 3S", "SKU017", 7995, "Accessories", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Amazon Echo Dot 5th Gen", "SKU018", 4999, "Smart Home", "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Decathlon Yoga Mat", "SKU019", 999, "Sports", "https://images.unsplash.com/photo-1601925228126-be6f58c6c3bc?auto=format&fit=crop&w=500&q=80", categories);
            addProduct("Milton Thermosteel Flask", "SKU020", 799, "Kitchen", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80", categories);
        }
    }

    private void addProduct(String title, String sku, double price, String catName, String img, Map<String, Category> categories) {
        Product p = new Product();
        p.setTitle(title);
        p.setSku(sku);
        p.setPrice(BigDecimal.valueOf(price));
        p.setCategory(categories.get(catName));
        p.setImageUrl(img);
        p.setStockQuantity(50);
        p.setDescription("Premium " + title + " available at best price.");
        productRepository.save(p);
    }
}
