package com.nexttern.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nexttern.model.Profile;
import com.nexttern.repository.ProfileRepository;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;
    
    /**
     * Get a user's profile by their ID
     * @param userId The Supabase user ID as string
     * @return The user's profile or null if not found
     */
    public Profile getProfile(String userId) {
        try {
            UUID userUuid = UUID.fromString(userId);
            return profileRepository.findById(userUuid).orElse(null);
        } catch (IllegalArgumentException e) {
            // Log the error
            System.err.println("Invalid UUID format: " + userId);
            return null;
        }
    }
    
    /**
     * Create or update a user's profile
     * @param profile The profile to save
     * @return The saved profile
     */
    public Profile saveProfile(Profile profile) {
        // Set timestamps if not provided
        if (profile.getCreatedAt() == null) {
            profile.setCreatedAt(LocalDateTime.now());
        }
        profile.setUpdatedAt(LocalDateTime.now());
        
        return profileRepository.save(profile);
    }
    
    /**
     * Update a user's profile with partial data
     * @param userId The Supabase user ID as string
     * @param profileData The profile data to update
     * @return The updated profile
     */
    public Profile updateProfile(String userId, Profile profileData) {
        try {
            UUID userUuid = UUID.fromString(userId);
            Profile existingProfile = profileRepository.findById(userUuid).orElse(null);
            
            // If profile doesn't exist, create a new one
            if (existingProfile == null) {
                profileData.setId(userUuid);
                profileData.setCreatedAt(LocalDateTime.now());
                profileData.setUpdatedAt(LocalDateTime.now());
                return profileRepository.save(profileData);
            }
            
            // Update only non-null fields
            if (profileData.getFirstName() != null) {
                existingProfile.setFirstName(profileData.getFirstName());
            }
            if (profileData.getLastName() != null) {
                existingProfile.setLastName(profileData.getLastName());
            }
            if (profileData.getUsername() != null) {
                existingProfile.setUsername(profileData.getUsername());
            }
            if (profileData.getAvatarUrl() != null) {
                existingProfile.setAvatarUrl(profileData.getAvatarUrl());
            }
            
            existingProfile.setUpdatedAt(LocalDateTime.now());
            return profileRepository.save(existingProfile);
        } catch (IllegalArgumentException e) {
            // Log the error
            System.err.println("Invalid UUID format: " + userId);
            return null;
        }
    }
}
