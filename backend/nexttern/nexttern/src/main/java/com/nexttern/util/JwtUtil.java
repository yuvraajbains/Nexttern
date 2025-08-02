package com.nexttern.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.exceptions.JWTVerificationException;

public class JwtUtil {
    /**
     * Extracts the user ID (sub claim) from a Bearer token after verifying the signature.
     * @param authorizationHeader The value of the Authorization header ("Bearer <token>")
     * @param jwtSecret The Supabase JWT secret for signature verification
     * @return The user ID (sub claim) if present and verified, otherwise null.
     */
    public static String extractUserId(String authorizationHeader, String jwtSecret) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            return null;
        }
        String token = authorizationHeader.substring(7);
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
            DecodedJWT decodedJwt = JWT.decode(token);
            String issuer = decodedJwt.getIssuer();
            JWTVerifier verifier = JWT.require(algorithm)
                    .withIssuer(issuer)
                    .build();
            DecodedJWT jwt = verifier.verify(token);
            return jwt.getSubject(); // 'sub' claim is the user id in Supabase
        } catch (JWTVerificationException | IllegalArgumentException e) {
            return null;
        }
    }
}
