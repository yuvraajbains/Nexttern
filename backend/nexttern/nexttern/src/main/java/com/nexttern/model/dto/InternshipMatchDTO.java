package com.nexttern.model.dto;

import java.util.ArrayList;
import java.util.List;

import com.nexttern.model.Internship;
import com.nexttern.model.Subscription;
import com.nexttern.model.User;

/**
 * Data Transfer Object for matched internships with user subscriptions
 */
public class InternshipMatchDTO {
    
    private User user;
    private List<String> matchedKeywords;
    private List<Internship> matchedInternships;
    private List<Subscription> matchedSubscriptions;
    
    public InternshipMatchDTO(User user, List<String> matchedKeywords, List<Internship> matchedInternships) {
        this.user = user;
        this.matchedKeywords = matchedKeywords;
        this.matchedInternships = matchedInternships;
        this.matchedSubscriptions = new ArrayList<>();
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public List<String> getMatchedKeywords() {
        return matchedKeywords;
    }
    
    public void setMatchedKeywords(List<String> matchedKeywords) {
        this.matchedKeywords = matchedKeywords;
    }
    
    public List<Internship> getMatchedInternships() {
        return matchedInternships;
    }
    
    public void setMatchedInternships(List<Internship> matchedInternships) {
        this.matchedInternships = matchedInternships;
    }
    
    public List<Subscription> getMatchedSubscriptions() {
        return matchedSubscriptions;
    }
    
    public void setMatchedSubscriptions(List<Subscription> matchedSubscriptions) {
        this.matchedSubscriptions = matchedSubscriptions;
    }
}
