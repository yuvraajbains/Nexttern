package com.nexttern.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

/**
 * Configuration class for Jackson JSON serialization
 * Registers the JavaTimeModule to handle Java 8 Date/Time types like LocalDateTime
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper objectMapper = builder.build();
        // Register the JavaTimeModule to handle LocalDateTime and other Java 8 date/time types
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
    }
}
