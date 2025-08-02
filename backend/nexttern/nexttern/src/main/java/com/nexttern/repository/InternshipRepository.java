package com.nexttern.repository;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ComparisonOperator;
import com.amazonaws.services.dynamodbv2.model.Condition;
import com.nexttern.model.Internship;

@Repository
public class InternshipRepository {
    private final DynamoDBMapper dynamoDBMapper;

    public InternshipRepository(DynamoDBMapper dynamoDBMapper) {
        this.dynamoDBMapper = dynamoDBMapper;
    }

    public Internship save(Internship internship) {
        dynamoDBMapper.save(internship);
        return internship;
    }

    public Optional<Internship> findById(String id) {
        return Optional.ofNullable(dynamoDBMapper.load(Internship.class, id));
    }

    public List<Internship> findAll() {
        return dynamoDBMapper.scan(Internship.class, new DynamoDBScanExpression());
    }
    
    /**
     * Find internships created after a specific date
     * @param createdAfter The date to filter by
     * @return List of internships created after the specified date
     */
    public List<Internship> findInternshipsCreatedAfter(Date createdAfter) {
        Map<String, Condition> filterExpressions = new HashMap<>();
        
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        String formattedDate = dateFormat.format(createdAfter);
        
        // Create a condition to filter by createdAt
        Condition createdAtCondition = new Condition()
                .withComparisonOperator(ComparisonOperator.GT)
                .withAttributeValueList(new AttributeValue().withS(formattedDate));
        
        filterExpressions.put("createdAt", createdAtCondition);
        
        DynamoDBScanExpression scanExpression = new DynamoDBScanExpression()
                .withScanFilter(filterExpressions);
        
        return dynamoDBMapper.scan(Internship.class, scanExpression);
    }

    public void deleteById(String id) {
        Internship internship = dynamoDBMapper.load(Internship.class, id);
        if (internship != null) {
            dynamoDBMapper.delete(internship);
        }
    }
}