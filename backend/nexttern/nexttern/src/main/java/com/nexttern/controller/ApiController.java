package com.nexttern.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nexttern.model.Internship;
import com.nexttern.repository.InternshipRepository;


@RestController

public class ApiController {
    private static final Logger logger = LoggerFactory.getLogger(ApiController.class);
    
    @Autowired
    private InternshipRepository internshipRepository;
    
    private int internshipsCallCount = 0;



    @GetMapping("/")
    public String home() {
        return "Welcome to Nexttern API! Server is running.";
    }

    /**
     * Get all internships with optional pagination (limit, offset)
     * Defaults: limit=50, offset=0
     */
    @GetMapping("/internships")
    public List<Internship> getAllInternships(
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        internshipsCallCount++;
        logger.info("/internships endpoint called {} times since server start", internshipsCallCount);
        
        List<Internship> all = internshipRepository.findAll();
        
        if (offset < 0) offset = 0;
        if (limit < 1 || limit > 100) limit = 50;
        
        int toIndex = Math.min(offset + limit, all.size());
        if (offset > all.size()) return List.of();
        
        return all.subList(offset, toIndex);
    }
    
    /**
     * Search internships by keyword and/or location, with input validation and case-insensitive search
     * Returns up to 100 results for efficiency
     */
    @GetMapping("/internships/search")
    public List<Internship> searchInternships(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "") String location) {
        
        String kw = keyword == null ? "" : keyword.trim().toLowerCase();
        String loc = location == null ? "" : location.trim().toLowerCase();
        
        List<Internship> allInternships = internshipRepository.findAll();
        
        // If both keyword and location are empty, return all internships
        if (kw.isEmpty() && loc.isEmpty()) {
            return allInternships;
        }
        
        return allInternships.stream()
                .filter(internship -> {
                    boolean matchesKeyword = kw.isEmpty() || 
                        (internship.getTitle() != null && internship.getTitle().toLowerCase().contains(kw)) ||
                        (internship.getCompany() != null && internship.getCompany().toLowerCase().contains(kw)) ||
                        (internship.getDescription() != null && internship.getDescription().toLowerCase().contains(kw));
                    
                    boolean matchesLocation = loc.isEmpty() ||
                        (internship.getLocation() != null && internship.getLocation().toLowerCase().contains(loc));
                    
                    return matchesKeyword && matchesLocation;
                })
                .limit(100) // Limit results for efficiency
                .collect(Collectors.toList());
    }
    
}