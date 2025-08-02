package com.nexttern.controller;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.nexttern.model.Profile;
import com.nexttern.service.ProfileService;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

    @Autowired
    private ProfileService profileService;

    // Removed invalid @Value annotations for supabaseServiceRoleKey and supabaseUrl
    // private String supabaseServiceRoleKey;
    // private String supabaseUrl;

    @Autowired
    private Environment env;
    
    /**
     * Get the current user's profile
     * @param authorization JWT token from Supabase Auth
     * @return The user's profile
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authorization) {
        String userId = null;
        try {
            // This is a placeholder - you'll need to implement JWT validation
            String jwtSecret = env.getProperty("SUPABASE_JWT_SECRET");
            userId = extractUserIdFromToken(authorization, jwtSecret);
            if (userId == null) {
                return new ResponseEntity<>("Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }
            Profile profile = profileService.getProfile(userId);
            if (profile == null) {
                // Return empty profile with just the ID
                profile = new Profile();
                try {
                    profile.setId(UUID.fromString(userId));
                } catch (IllegalArgumentException e) {
                    return new ResponseEntity<>("Invalid user ID format: " + userId, HttpStatus.BAD_REQUEST);
                }
            }
            return new ResponseEntity<>(profile, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving profile for userId {}: {}", userId, e.getMessage(), e);
            return new ResponseEntity<>("Error retrieving profile: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Update the current user's profile
     * @param authorization JWT token from Supabase Auth
     * @param profileData Profile data to update
     * @return The updated profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody Profile profileData) {
        try {
            String jwtSecret = env.getProperty("SUPABASE_JWT_SECRET");
            String userId = extractUserIdFromToken(authorization, jwtSecret);
            
            if (userId == null) {
                return new ResponseEntity<>("Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }
            
            // Update profile
            try {
                Profile updatedProfile = profileService.updateProfile(userId, profileData);
                return new ResponseEntity<>(updatedProfile, HttpStatus.OK);
            } catch (IllegalArgumentException e) {
                return new ResponseEntity<>("Invalid user ID format: " + userId, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating profile: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    
    /**
     * Extract user ID from Supabase JWT token
     * This uses the Auth0 java-jwt library to decode and validate the token
     */
    private String extractUserIdFromToken(String authorization, String jwtSecret) {
        try {
            // Remove "Bearer " prefix if present
            String token = authorization;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7);
            }

            if (jwtSecret == null || jwtSecret.isEmpty()) {
                // In production, do not allow decoding without verification
                logger.error("JWT Secret not configured. Rejecting token for security."); // No secret value logged
                return null;
            }

            try {
                // Verify the JWT with the Supabase JWT secret
                Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
                // First decode without verification to check the issuer
                DecodedJWT decodedJwt = JWT.decode(token);
                String issuer = decodedJwt.getIssuer();
                // Build verifier with the correct issuer from the token
                JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build();
                DecodedJWT jwt = verifier.verify(token);
                // Only log minimal info in debug mode
                logger.debug("JWT verified for subject: {}", jwt.getSubject()); // No sensitive info
                // Get the subject claim which contains the Supabase user ID
                return jwt.getSubject();
            } catch (JWTVerificationException | IllegalArgumentException e) {
                logger.error("JWT verification failed: {}", e.getMessage()); // No sensitive info
                return null;
            }
        } catch (JWTDecodeException e) {
            logger.error("Invalid JWT token", e);
            return null;
        } catch (IllegalArgumentException | NullPointerException e) {
            logger.error("Error processing JWT token", e);
            return null;
        }
    }
}