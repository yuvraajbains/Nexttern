package com.nexttern.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import java.util.Collections;

@RestController
@RequestMapping("/api")
public class DeleteAccount {
    private static final Logger logger = LoggerFactory.getLogger(DeleteAccount.class);

    @Autowired
    private com.nexttern.service.UserService userService; // Assuming there is a UserService to handle user operations

    @Value("${supabase.key:}")
    private String supabaseServiceRoleKey;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Autowired
    private Environment env;

    // Securely extract and verify userId from JWT using SUPABASE_JWT_SECRET
    private String extractUserIdFromToken(String authorization) {
        try {
            String token = authorization;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7);
            }
            String jwtSecret = env.getProperty("SUPABASE_JWT_SECRET");
            if (jwtSecret == null || jwtSecret.isEmpty()) {
                logger.error("JWT Secret not configured. Rejecting token for security.");
                return null;
            }
            try {
                Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
                DecodedJWT decodedJwt = JWT.decode(token);
                String issuer = decodedJwt.getIssuer();
                JWTVerifier verifier = JWT.require(algorithm)
                        .withIssuer(issuer)
                        .build();
                DecodedJWT jwt = verifier.verify(token);
                logger.debug("JWT verified for subject: {}", jwt.getSubject());
                return jwt.getSubject();
            } catch (JWTVerificationException | IllegalArgumentException e) {
                logger.error("JWT verification failed: {}", e.getMessage());
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

    // Secure endpoint to delete the authenticated user's account
    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestHeader("Authorization") String authorization) {
        String userId = extractUserIdFromToken(authorization);
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid or missing user token"));
        }
        try {
            // 1. Delete user and all related data (CASCADE in DB recommended)
            userService.deleteUserAndData(userId);

            // 2. Delete from Supabase Auth via Admin API (call from backend only)
            if (supabaseServiceRoleKey == null || supabaseServiceRoleKey.isEmpty() || supabaseUrl == null || supabaseUrl.isEmpty()) {
                return ResponseEntity.status(500).body(Collections.singletonMap("error", "Supabase service role key or URL not configured"));
            }
            try {
                String deleteUrl = supabaseUrl + "/auth/v1/admin/users/" + userId;
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.set("apikey", supabaseServiceRoleKey);
                headers.set("Authorization", "Bearer " + supabaseServiceRoleKey);
                headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
                HttpEntity<String> entity = new HttpEntity<>(null, headers);
                restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, String.class);
            } catch (Exception e) {
                // Not fatal, but log
                logger.warn("Failed to delete user from Supabase Auth: {}", e.getMessage());
            }

            return ResponseEntity.ok(Collections.singletonMap("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
