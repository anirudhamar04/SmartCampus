package com.smartcampus.controller;

import com.smartcampus.dto.CafeteriaOrderDTO;
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
} 