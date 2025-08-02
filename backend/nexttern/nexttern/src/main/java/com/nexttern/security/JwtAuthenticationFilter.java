package com.nexttern.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.core.env.Environment;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final Environment env;

    public JwtAuthenticationFilter(Environment env) {
        this.env = env;
    }
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        // Removed sensitive Authorization header logging
        String jwtSecret = env.getProperty("SUPABASE_JWT_SECRET");
        // Removed sensitive SUPABASE_JWT_SECRET logging
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            // Removed sensitive SUPABASE_JWT_SECRET logging
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Server misconfiguration: SUPABASE_JWT_SECRET is missing.");
            return;
        }
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
                DecodedJWT decodedJwt = JWT.decode(token);
                String issuer = decodedJwt.getIssuer();
                JWTVerifier verifier = JWT.require(algorithm)
                        .withIssuer(issuer)
                        .build();
                DecodedJWT jwt = verifier.verify(token);
                String userId = jwt.getSubject();
                // Optionally log only userId if needed, but avoid logging tokens or secrets
                if (userId != null) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JWTVerificationException | IllegalArgumentException e) {
                System.out.println("[JwtAuthFilter] JWT verification failed: " + e.getMessage());
            }
        } else {
            System.out.println("[JwtAuthFilter] No Bearer token found in Authorization header.");
        }
        filterChain.doFilter(request, response);
    }
}
