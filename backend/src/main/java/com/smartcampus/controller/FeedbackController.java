package com.smartcampus.controller;

import com.smartcampus.dto.FeedbackDTO;
import com.smartcampus.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<FeedbackDTO> createFeedback(@RequestBody FeedbackDTO feedbackDTO) {
        return ResponseEntity.ok(feedbackService.createFeedback(feedbackDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDTO> updateFeedback(
            @PathVariable Long id,
            @RequestBody FeedbackDTO feedbackDTO) {
        return ResponseEntity.ok(feedbackService.updateFeedback(id, feedbackDTO));
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<FeedbackDTO> respondToFeedback(
            @PathVariable Long id,
            @RequestParam String response,
            @RequestParam Long responderId) {
        return ResponseEntity.ok(feedbackService.respondToFeedback(id, response, responderId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDTO> getFeedbackById(@PathVariable Long id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByUser(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByStatus(@PathVariable String status) {
        return ResponseEntity.ok(feedbackService.getFeedbackByStatus(status));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByCategory(@PathVariable String category) {
        return ResponseEntity.ok(feedbackService.getFeedbackByCategory(category));
    }

    @GetMapping
    public ResponseEntity<List<FeedbackDTO>> getAllFeedback() {
        List<FeedbackDTO> feedbacks = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedbacks);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FeedbackDTO> updateFeedbackStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String response,
            @RequestParam(required = false) Long respondedById) {
        return ResponseEntity.ok(feedbackService.updateFeedbackStatus(id, status, response, respondedById));
    }
} 