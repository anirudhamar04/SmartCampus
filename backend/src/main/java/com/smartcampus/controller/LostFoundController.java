package com.smartcampus.controller;

import com.smartcampus.dto.LostFoundItemDTO;
import com.smartcampus.service.LostFoundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lost-found")
public class LostFoundController {

    private final LostFoundService lostFoundService;

    @Autowired
    public LostFoundController(LostFoundService lostFoundService) {
        this.lostFoundService = lostFoundService;
    }

    /**
     * Get all lost and found items
     */
    @GetMapping("/items")
    public ResponseEntity<List<LostFoundItemDTO>> getAllItems() {
        try {
            // Get all items (will need to implement this method in the service)
            List<LostFoundItemDTO> items = lostFoundService.getAllItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get items by user ID (items reported by the user or claimed by the user)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LostFoundItemDTO>> getItemsByUser(@PathVariable Long userId) {
        try {
            List<LostFoundItemDTO> items = lostFoundService.getItemsByUser(userId);
            return ResponseEntity.ok(items);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get items by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LostFoundItemDTO>> getItemsByStatus(@PathVariable String status) {
        try {
            List<LostFoundItemDTO> items = lostFoundService.getItemsByStatus(status);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get items by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<LostFoundItemDTO>> getItemsByCategory(@PathVariable String category) {
        try {
            List<LostFoundItemDTO> items = lostFoundService.getItemsByCategory(category);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get item by ID
     */
    @GetMapping("/items/{id}")
    public ResponseEntity<LostFoundItemDTO> getItemById(@PathVariable Long id) {
        try {
            LostFoundItemDTO item = lostFoundService.getItemById(id);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add a new lost or found item
     */
    @PostMapping("/items")
    public ResponseEntity<LostFoundItemDTO> addItem(@RequestBody LostFoundItemDTO itemDTO) {
        try {
            LostFoundItemDTO savedItem = lostFoundService.reportLostItem(itemDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing item
     */
    @PutMapping("/items/{id}")
    public ResponseEntity<LostFoundItemDTO> updateItem(
            @PathVariable Long id,
            @RequestBody LostFoundItemDTO itemDTO) {
        try {
            LostFoundItemDTO updatedItem = lostFoundService.updateItem(id, itemDTO);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Claim an item
     */
    @PostMapping("/items/{id}/claim")
    public ResponseEntity<LostFoundItemDTO> claimItem(
            @PathVariable Long id,
            @RequestBody Map<String, Object> claimData) {
        try {
            Long userId = Long.valueOf(claimData.get("userId").toString());
            String description = (String) claimData.get("description");
            
            // Update to include verification details
            LostFoundItemDTO item = lostFoundService.getItemById(id);
            item.setVerificationDetails(description);
            
            LostFoundItemDTO claimedItem = lostFoundService.claimItem(id, userId);
            return ResponseEntity.ok(claimedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Mark an item as returned to owner
     */
    @PutMapping("/items/{id}/return")
    public ResponseEntity<LostFoundItemDTO> markAsReturned(@PathVariable Long id) {
        try {
            // Get the item
            LostFoundItemDTO item = lostFoundService.getItemById(id);
            
            // Update status to RETURNED
            item.setStatus("RETURNED");
            
            // Update the item
            LostFoundItemDTO updatedItem = lostFoundService.updateItem(id, item);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 