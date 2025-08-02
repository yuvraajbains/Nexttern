package com.nexttern.controller;

import com.nexttern.model.dto.ProjectRequest;
import com.nexttern.service.ProjectGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Map;

@RestController
@RequestMapping("/api/projects/job")
public class ProjectJobController {
    @Autowired
    private ProjectGeneratorService projectGeneratorService;

    // 1. Generate project directly (POST)
    @Autowired
    private Environment env;

    @PostMapping("/submit")
    public ResponseEntity<?> submitJob(
            @RequestHeader("Authorization") String authorization,
            @RequestBody ProjectRequest request) {
        String jwtSecret = env.getProperty("SUPABASE_JWT_SECRET");
        String userId = extractUserIdFromToken(authorization, jwtSecret);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }
        String result = projectGeneratorService.generateProjectRaw(request).block();
        return ResponseEntity.ok(Map.of("result", result));
    }

    // JWT validation logic (copied from ProjectController)
    private String extractUserIdFromToken(String authorization, String jwtSecret) {
        try {
            String token = authorization;
            if (authorization != null && authorization.startsWith("Bearer ")) {
                token = authorization.substring(7);
            }
            if (jwtSecret == null || jwtSecret.isEmpty()) {
                return null;
            }
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
            DecodedJWT decodedJwt = JWT.decode(token);
            String issuer = decodedJwt.getIssuer();
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build();
            DecodedJWT jwt = verifier.verify(token);
            return jwt.getSubject();
        } catch (JWTVerificationException | IllegalArgumentException | NullPointerException e) {
            return null;
        }
    }

    // All job status/result endpoints removed for direct synchronous flow.
}
