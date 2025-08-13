package com.nexttern.outsourcedjobs;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.*;
import java.util.*;

public class DynamoDBInternshipSaver {
    private final AmazonDynamoDB client;
    private final String tableName = "Internships";
    private final String urlIndexName = "url-index"; // GSI name

    public DynamoDBInternshipSaver() {
        this.client = AmazonDynamoDBClientBuilder.standard()
                .withRegion(Regions.CA_CENTRAL_1)
                .build();
    }

    public void saveAll(List<Internship> internships) {
        if (internships == null || internships.isEmpty()) return;
        List<Internship> dedupedInternships = deduplicateInMemory(internships);
        List<Internship> newInternships = filterExistingUrls(dedupedInternships);
        if (!newInternships.isEmpty()) {
            batchWriteNewItems(newInternships);
        }
    }

    private List<Internship> deduplicateInMemory(List<Internship> internships) {
        Map<String, Internship> uniqueInternships = new LinkedHashMap<>();
        for (Internship internship : internships) {
            String url = internship.getUrl();
            if (url != null && !url.isEmpty() && url.startsWith("http")) {
                uniqueInternships.putIfAbsent(url, internship);
            }
        }
        return new ArrayList<>(uniqueInternships.values());
    }

    private List<Internship> filterExistingUrls(List<Internship> internships) {
        List<Internship> newInternships = new ArrayList<>();
        for (Internship internship : internships) {
            if (!urlExistsInDynamoDB(internship.getUrl())) {
                newInternships.add(internship);
            }
        }
        return newInternships;
    }

    private boolean urlExistsInDynamoDB(String url) {
        if (url == null || url.isEmpty()) return false;
        Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
        expressionAttributeValues.put(":url", new AttributeValue().withS(url));
        QueryRequest queryRequest = new QueryRequest()
                .withTableName(tableName)
                .withIndexName(urlIndexName)
                .withKeyConditionExpression("url = :url")
                .withExpressionAttributeValues(expressionAttributeValues);
        QueryResult result = client.query(queryRequest);
        return result.getCount() > 0;
    }

    private void batchWriteNewItems(List<Internship> internships) {
        List<WriteRequest> writeRequests = new ArrayList<>();
        for (Internship internship : internships) {
            Map<String, AttributeValue> item = new HashMap<>();
            item.put("id", new AttributeValue().withS(internship.getId()));
            item.put("title", new AttributeValue().withS(internship.getTitle()));
            item.put("company", new AttributeValue().withS(internship.getCompany()));
            item.put("location", new AttributeValue().withS(internship.getLocation()));
            item.put("description", new AttributeValue().withS(internship.getDescription()));
            item.put("url", new AttributeValue().withS(internship.getUrl()));
            item.put("postedDate", new AttributeValue().withS(internship.getPostedDate()));
            item.put("source", new AttributeValue().withS(internship.getSource()));
            writeRequests.add(new WriteRequest(new PutRequest(item)));
        }
        Map<String, List<WriteRequest>> requestItems = new HashMap<>();
        requestItems.put(tableName, writeRequests);
        BatchWriteItemRequest batchWriteItemRequest = new BatchWriteItemRequest().withRequestItems(requestItems);
        client.batchWriteItem(batchWriteItemRequest);
    }
}
