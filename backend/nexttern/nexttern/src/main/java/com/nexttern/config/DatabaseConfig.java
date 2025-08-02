package com.nexttern.config;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:NOT_SET}")
    private String url;

    @Value("${spring.datasource.username:NOT_SET}")
    private String username;

    @Value("${spring.datasource.password:NOT_SET}")
    private String password;

    @Value("${spring.datasource.driver-class-name:NOT_SET}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        logger.info("[DatabaseConfig] Initializing DataSource with:");
        logger.info("  driverClassName: {}", driverClassName);
        logger.info("  url: {}", url);
        logger.info("  username: {}", username);
        // Do not log password for security reasons
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(driverClassName);
        dataSource.setUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        return dataSource;
    }
    
    //if context is not set, use the default DataSource in this implementation (for prod notes only)
    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
