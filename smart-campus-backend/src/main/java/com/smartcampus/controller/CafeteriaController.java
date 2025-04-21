package com.smartcampus.controller;

import com.smartcampus.dto.CafeteriaOrderDTO;
import com.smartcampus.dto.CafeteriaItemDTO;
import com.smartcampus.service.CafeteriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cafeteria")
public class CafeteriaController {

    private final CafeteriaService cafeteriaService;

    @Autowired
    public CafeteriaController(CafeteriaService cafeteriaService) {
        this.cafeteriaService = cafeteriaService;
    }

    @PostMapping("/orders")
    public ResponseEntity<CafeteriaOrderDTO> createOrder(@RequestBody CafeteriaOrderDTO orderDTO) {
        CafeteriaOrderDTO createdOrder = cafeteriaService.createOrder(orderDTO);
        return ResponseEntity.ok(createdOrder);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<CafeteriaOrderDTO> getOrderById(@PathVariable Long id) {
        CafeteriaOrderDTO order = cafeteriaService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<List<CafeteriaOrderDTO>> getOrdersByUser(@PathVariable Long userId) {
        List<CafeteriaOrderDTO> orders = cafeteriaService.getOrdersByUser(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/orders/status/{status}")
    public ResponseEntity<List<CafeteriaOrderDTO>> getOrdersByStatus(@PathVariable String status) {
        List<CafeteriaOrderDTO> orders = cafeteriaService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<CafeteriaOrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        CafeteriaOrderDTO updatedOrder = cafeteriaService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    // Get all cafeteria items
    @GetMapping("/items")
    public ResponseEntity<List<CafeteriaItemDTO>> getAllItems() {
        List<CafeteriaItemDTO> items = cafeteriaService.getAllItems();
        return ResponseEntity.ok(items);
    }

    // Get a cafeteria item by its ID
    @GetMapping("/items/{id}")
    public ResponseEntity<CafeteriaItemDTO> getItemById(@PathVariable Long id) {
        CafeteriaItemDTO item = cafeteriaService.getItemById(id);
        return ResponseEntity.ok(item);
    }

    // Get cafeteria items by category
    @GetMapping("/items/category/{category}")
    public ResponseEntity<List<CafeteriaItemDTO>> getItemsByCategory(@PathVariable String category) {
        List<CafeteriaItemDTO> items = cafeteriaService.getItemsByCategory(category);
        return ResponseEntity.ok(items);
    }
} 