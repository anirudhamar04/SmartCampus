package com.smartcampus.service;

import com.smartcampus.dto.CafeteriaOrderDTO;
import com.smartcampus.dto.CafeteriaItemDTO;
import com.smartcampus.model.CafeteriaItem;
import com.smartcampus.model.CafeteriaOrder;
import com.smartcampus.model.CafeteriaOrderItem;
import com.smartcampus.model.User;
import com.smartcampus.repository.CafeteriaItemRepository;
import com.smartcampus.repository.CafeteriaOrderRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CafeteriaService {

    private final CafeteriaOrderRepository orderRepository;
    private final CafeteriaItemRepository itemRepository;
    private final UserRepository userRepository;

    @Autowired
    public CafeteriaService(CafeteriaOrderRepository orderRepository, 
                          CafeteriaItemRepository itemRepository,
                          UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CafeteriaOrderDTO createOrder(CafeteriaOrderDTO orderDTO) {
        User user = userRepository.findById(orderDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        CafeteriaOrder order = new CafeteriaOrder();
        order.setUser(user);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        order.setPaymentStatus("PENDING");
        order.setDeliveryLocation(orderDTO.getDeliveryLocation());
        order.setRemarks(orderDTO.getRemarks());

        // Calculate total amount and create order items
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CafeteriaOrderDTO.OrderItemDTO itemDTO : orderDTO.getItems()) {
            CafeteriaItem item = itemRepository.findById(itemDTO.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemDTO.getItemId()));

            if (!item.isAvailable()) {
                throw new RuntimeException("Item not available: " + item.getName());
            }

            if (item.getQuantity() < itemDTO.getQuantity()) {
                throw new RuntimeException("Insufficient quantity for item: " + item.getName());
            }

            // Create order item entity
            CafeteriaOrderItem orderItem = new CafeteriaOrderItem();
            orderItem.setOrder(order);
            orderItem.setItem(item);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItem.setSpecialInstructions(itemDTO.getSpecialInstructions());
            
            // Add to order's items collection
            order.getItems().add(orderItem);
            
            // Add to total amount
            totalAmount = totalAmount.add(item.getPrice().multiply(new BigDecimal(itemDTO.getQuantity())));
            
            // Optionally update item quantity
            // item.setQuantity(item.getQuantity() - itemDTO.getQuantity());
            // itemRepository.save(item);
        }

        order.setTotalAmount(totalAmount);
        CafeteriaOrder savedOrder = orderRepository.save(order);
        return convertToDTO(savedOrder);
    }

    public CafeteriaOrderDTO getOrderById(Long id) {
        CafeteriaOrder order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(order);
    }

    public List<CafeteriaOrderDTO> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUser(user).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<CafeteriaOrderDTO> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public CafeteriaOrderDTO updateOrderStatus(Long id, String status) {
        CafeteriaOrder order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        CafeteriaOrder updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    private CafeteriaOrderDTO convertToDTO(CafeteriaOrder order) {
        CafeteriaOrderDTO dto = new CafeteriaOrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setUserName(order.getUser().getFullName());
        dto.setOrderTime(order.getOrderTime());
        dto.setStatus(order.getStatus());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setDeliveryLocation(order.getDeliveryLocation());
        dto.setRemarks(order.getRemarks());
        dto.setTotalAmount(order.getTotalAmount());

        dto.setItems(order.getItems().stream().map(item -> {
            CafeteriaOrderDTO.OrderItemDTO itemDTO = new CafeteriaOrderDTO.OrderItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setItemId(item.getItem().getId());
            itemDTO.setItemName(item.getItem().getName());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());
            itemDTO.setSpecialInstructions(item.getSpecialInstructions());
            return itemDTO;
        }).collect(Collectors.toList()));

        return dto;
    }

    // Add method to get all items
    public List<CafeteriaItemDTO> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());
    }

    // Add method to get item by ID
    public CafeteriaItemDTO getItemById(Long id) {
        CafeteriaItem item = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found: " + id));
        return convertItemToDTO(item);
    }

    // Add method to get items by category (only available items)
    public List<CafeteriaItemDTO> getItemsByCategory(String category) {
        return itemRepository.findByCategoryAndAvailable(category, true).stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());
    }

    // Helper to convert CafeteriaItem to DTO
    private CafeteriaItemDTO convertItemToDTO(CafeteriaItem item) {
        CafeteriaItemDTO dto = new CafeteriaItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setCategory(item.getCategory());
        dto.setImageUrl(item.getImageUrl());
        dto.setAvailable(item.isAvailable());
        dto.setPreparationTime(item.getPreparationTime());
        dto.setIngredients(item.getIngredients());
        dto.setDietaryInfo(item.getDietaryInfo());
        return dto;
    }
} 