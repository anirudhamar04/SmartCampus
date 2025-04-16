package com.smartcampus.service;

import com.smartcampus.dto.FeedbackDTO;
import com.smartcampus.model.Feedback;
import com.smartcampus.model.User;
import com.smartcampus.repository.FeedbackRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public FeedbackDTO createFeedback(FeedbackDTO feedbackDTO) {
        User user = userRepository.findById(feedbackDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setSubject(feedbackDTO.getSubject());
        feedback.setMessage(feedbackDTO.getMessage());
        feedback.setCategory(feedbackDTO.getCategory());
        feedback.setSubmissionTime(LocalDateTime.now());
        feedback.setStatus("PENDING");
        feedback.setPriority(feedbackDTO.getPriority());

        Feedback savedFeedback = feedbackRepository.save(feedback);
        return convertToDTO(savedFeedback);
    }

    @Transactional
    public FeedbackDTO updateFeedback(Long id, FeedbackDTO feedbackDTO) {
        Feedback feedback = feedbackRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setSubject(feedbackDTO.getSubject());
        feedback.setMessage(feedbackDTO.getMessage());
        feedback.setCategory(feedbackDTO.getCategory());
        feedback.setStatus(feedbackDTO.getStatus());
        feedback.setPriority(feedbackDTO.getPriority());
        feedback.setResponse(feedbackDTO.getResponse());
        feedback.setResponseTime(LocalDateTime.now());

        if (feedbackDTO.getRespondedById() != null) {
            User responder = userRepository.findById(feedbackDTO.getRespondedById())
                .orElseThrow(() -> new RuntimeException("Responder not found"));
            feedback.setRespondedBy(responder);
        }

        Feedback updatedFeedback = feedbackRepository.save(feedback);
        return convertToDTO(updatedFeedback);
    }

    @Transactional
    public FeedbackDTO respondToFeedback(Long id, String response, Long responderId) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        User responder = userRepository.findById(responderId)
                .orElseThrow(() -> new RuntimeException("Responder not found"));

        feedback.setResponse(response);
        feedback.setResponseTime(LocalDateTime.now());
        feedback.setRespondedBy(responder);
        feedback.setStatus("RESOLVED");

        Feedback updatedFeedback = feedbackRepository.save(feedback);
        return convertToDTO(updatedFeedback);
    }

    @Transactional
    public FeedbackDTO updateFeedbackStatus(Long id, String status, String response, Long respondedById) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setStatus(status);
        
        if (response != null && !response.isEmpty()) {
            feedback.setResponse(response);
            feedback.setResponseTime(LocalDateTime.now());
        }
        
        if (respondedById != null) {
            User responder = userRepository.findById(respondedById)
                    .orElseThrow(() -> new RuntimeException("Responder not found"));
            feedback.setRespondedBy(responder);
        }

        Feedback updatedFeedback = feedbackRepository.save(feedback);
        return convertToDTO(updatedFeedback);
    }

    public FeedbackDTO getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Feedback not found"));
        return convertToDTO(feedback);
    }

    public List<FeedbackDTO> getFeedbackByUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return feedbackRepository.findByUser(user).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<FeedbackDTO> getFeedbackByStatus(String status) {
        return feedbackRepository.findByStatus(status).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<FeedbackDTO> getFeedbackByCategory(String category) {
        return feedbackRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private FeedbackDTO convertToDTO(Feedback feedback) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(feedback.getId());
        dto.setUserId(feedback.getUser().getId());
        dto.setUserName(feedback.getUser().getFullName());
        dto.setSubject(feedback.getSubject());
        dto.setMessage(feedback.getMessage());
        dto.setCategory(feedback.getCategory());
        dto.setSubmissionTime(feedback.getSubmissionTime());
        dto.setStatus(feedback.getStatus());
        dto.setPriority(feedback.getPriority());
        dto.setResponse(feedback.getResponse());
        dto.setResponseTime(feedback.getResponseTime());
        
        if (feedback.getRespondedBy() != null) {
            dto.setRespondedById(feedback.getRespondedBy().getId());
            dto.setRespondedByName(feedback.getRespondedBy().getFullName());
        }
        
        return dto;
    }
} 