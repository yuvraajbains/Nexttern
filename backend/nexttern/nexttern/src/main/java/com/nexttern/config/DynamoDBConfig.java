package com.nexttern.config;

import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.CreateTableRequest;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.KeyType;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.amazonaws.services.dynamodbv2.model.ResourceNotFoundException;
import com.amazonaws.services.dynamodbv2.model.ScalarAttributeType;
import com.amazonaws.services.dynamodbv2.util.TableUtils;

import jakarta.annotation.PostConstruct;

@Configuration
public class DynamoDBConfig {
    private static final Logger logger = LoggerFactory.getLogger(DynamoDBConfig.class);
    private static final String TABLE_NAME = "Internships";
    
    @Value("${aws.dynamodb.endpoint:}")
    private String dynamoDbEndpoint;

    @Value("${aws.region}")
    private String awsRegion;

    @Value("${aws.dynamodb.accessKey:}")
    private String accessKey;

    @Value("${aws.dynamodb.secretKey:}")
    private String secretKey;


    @Bean
    public AmazonDynamoDB amazonDynamoDB() {
        AmazonDynamoDBClientBuilder builder = AmazonDynamoDBClientBuilder.standard();
        boolean hasEndpoint = dynamoDbEndpoint != null && !dynamoDbEndpoint.isEmpty();
        boolean hasKeys = accessKey != null && !accessKey.isEmpty() && secretKey != null && !secretKey.isEmpty();

        if (hasEndpoint) {
            builder.withEndpointConfiguration(
                new AwsClientBuilder.EndpointConfiguration(dynamoDbEndpoint, awsRegion)
            );
        } else {
            builder.withRegion(awsRegion);
        }

        // Always use credentials from properties if present
        if (hasKeys) {
            builder.withCredentials(
                new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, secretKey))
            );
        }
        return builder.build();
    }

    @Bean
    public DynamoDBMapper dynamoDBMapper(AmazonDynamoDB amazonDynamoDB) {
        return new DynamoDBMapper(amazonDynamoDB);
    }

    @Bean
    public DynamoDB dynamoDB(AmazonDynamoDB amazonDynamoDB) {
        return new DynamoDB(amazonDynamoDB);
    }
    
    @PostConstruct
    public void init() {
        // Create the client directly using the bean method
        AmazonDynamoDB amazonDynamoDBClient = amazonDynamoDB();
        
        try {
            // Check if table already exists
            try {
                var tableDesc = amazonDynamoDBClient.describeTable(TABLE_NAME).getTable();
                logger.info("Table '{}' already exists", TABLE_NAME);
                if (tableDesc.getProvisionedThroughput() != null) {
                    logger.info("Current RCU: {} | WCU: {}", 
                        tableDesc.getProvisionedThroughput().getReadCapacityUnits(),
                        tableDesc.getProvisionedThroughput().getWriteCapacityUnits()
                    );
                }
                return;
            } catch (ResourceNotFoundException e) {
                // Table doesn't exist, create it
                logger.info("Creating '{}' table...", TABLE_NAME);
            }

            CreateTableRequest request = new CreateTableRequest()
                .withTableName(TABLE_NAME)
                .withKeySchema(Arrays.asList(
                    new KeySchemaElement("id", KeyType.HASH)
                ))
                .withAttributeDefinitions(Arrays.asList(
                    new AttributeDefinition("id", ScalarAttributeType.S)
                ))
                .withProvisionedThroughput(new ProvisionedThroughput(5L, 5L));

            amazonDynamoDBClient.createTable(request);

            // Wait for table to be created
            logger.info("Waiting for table to be created...");
            try {
                TableUtils.waitUntilActive(amazonDynamoDBClient, TABLE_NAME);
                logger.info("Table '{}' created successfully", TABLE_NAME);
                // Log RCU/WCU after creation
                var tableDesc = amazonDynamoDBClient.describeTable(TABLE_NAME).getTable();
                if (tableDesc.getProvisionedThroughput() != null) {
                    logger.info("Current RCU: {} | WCU: {}", 
                        tableDesc.getProvisionedThroughput().getReadCapacityUnits(),
                        tableDesc.getProvisionedThroughput().getWriteCapacityUnits()
                    );
                }
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                logger.error("Table creation was interrupted: {}", ie.getMessage());
            }
        } catch (ResourceNotFoundException rnfe) {
            logger.error("Resource not found during DynamoDB setup: {}", rnfe.getMessage());
        } catch (com.amazonaws.AmazonServiceException ase) {
            logger.error("AmazonServiceException during setup: {}", ase.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Failed to setup DynamoDB: {}", e.getMessage());
            // Don't throw exception as it might prevent application startup
            // Just log the error and continue
        }
    }
}