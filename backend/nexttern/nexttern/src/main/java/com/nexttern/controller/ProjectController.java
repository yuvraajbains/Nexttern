
package com.nexttern.controller;


import com.nexttern.model.dto.ProjectRequest;
import com.nexttern.service.ProjectGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectGeneratorService projectGeneratorService;

    @Autowired
    public ProjectController(ProjectGeneratorService projectGeneratorService) {
        this.projectGeneratorService = projectGeneratorService;
    }

    @Autowired
    private Environment env;

    /**
     * Generate a project for the authenticated user only
     */
    @PostMapping("/generate")
    public Mono<ResponseEntity<String>> generateProject(
            @RequestHeader("Authorization") String authorization,
            @RequestBody ProjectRequest request) {
        String jwtSecret = env.getProperty("SUPABASE_JWT_SECRET");
        // Removed sensitive SUPABASE_JWT_SECRET logging
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            // Log and return error if secret is missing
            // Removed sensitive SUPABASE_JWT_SECRET logging
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Server misconfiguration: SUPABASE_JWT_SECRET is missing."));
        }
        String userId = extractUserIdFromToken(authorization, jwtSecret);
        if (userId == null) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token"));
        }
        return projectGeneratorService.generateProjectRaw(request)
                .map(result -> ResponseEntity.ok(result));
    }

    // JWT validation logic (copied from ProfileController, simplified)
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
}
 