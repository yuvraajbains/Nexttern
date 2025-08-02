package com.nexttern.model;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;

@DynamoDBTable(tableName = "Internships")
public class Internship {
    
    private String id;
    private String title;
    private String company;
    private String location;
    private String description;
    private String url;
    private String postedDate;
    private String source;
    
    // Default constructor
    public Internship() {
    }
    
    // All-args constructor
    public Internship(String id, String title, String company, String location, 
                     String description, String url, String postedDate, String source) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.description = description;
        this.url = url;
        this.postedDate = postedDate;
        this.source = source;
    }
    
    // Getters and Setters
    @DynamoDBHashKey(attributeName = "id")
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    @DynamoDBAttribute(attributeName = "title")
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    @DynamoDBAttribute(attributeName = "company")
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
    @DynamoDBAttribute(attributeName = "location")
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    @DynamoDBAttribute(attributeName = "description")
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    @DynamoDBAttribute(attributeName = "url")
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    @DynamoDBAttribute(attributeName = "postedDate")
    public String getPostedDate() {
        return postedDate;
    }
    
    public void setPostedDate(String postedDate) {
        this.postedDate = postedDate;
    }
    
    @DynamoDBAttribute(attributeName = "source")
    public String getSource() {
        return source;
    }
    
    public void setSource(String source) {
        this.source = source;
    }
}
