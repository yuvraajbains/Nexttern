package com.nexttern.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.nexttern.model.Subscription;
import com.nexttern.model.User;

/**
 * Service for interacting with Supabase to fetch user data and subscriptions
 */
@Service
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    private final RestTemplate restTemplate;
    
    public UserService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Deletes a user and all related data from the database.
     * Assumes ON DELETE CASCADE is set up for all related tables.
     * @param userId The user's UUID
     */
    public void deleteUserAndData(String userId) {
        // Delete user from Supabase Auth using the Admin API
        try {
            String adminUrl = supabaseUrl + "/auth/v1/admin/users/" + userId;
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseKey); // Service role key required
            headers.set("Authorization", "Bearer " + supabaseKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    adminUrl,
                    HttpMethod.DELETE,
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Successfully deleted user {} from Supabase Auth.", userId);
            } else {
                logger.error("Failed to delete user {} from Supabase Auth. Status: {} Body: {}", userId, response.getStatusCode(), response.getBody());
                throw new RuntimeException("Supabase Auth deletion failed: " + response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Exception deleting user {} from Supabase Auth", userId, e);
            throw new RuntimeException("Failed to delete user from Supabase Auth: " + e.getMessage());
        }
    }
    
    /**
     * Fetches all user subscriptions from Supabase
     * @return A map of user IDs to their subscriptions
     */
    public Map<String, List<Subscription>> getAllUserSubscriptions() {
        Map<String, List<Subscription>> userSubscriptions = new HashMap<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseKey);
            headers.set("Authorization", "Bearer " + supabaseKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    supabaseUrl + "/rest/v1/subscriptions?select=*",
                    HttpMethod.GET,
                    entity,
                    String.class);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                logger.error("Failed to fetch subscriptions: {}", response.getStatusCode());
                return userSubscriptions;
            }
            
            String responseBody = response.getBody();
            if (responseBody == null || responseBody.isEmpty()) {
                logger.warn("Empty response body when fetching subscriptions");
                return userSubscriptions;
            }
            
            JSONArray subscriptionsArray = new JSONArray(responseBody);
            
            for (int i = 0; i < subscriptionsArray.length(); i++) {
                JSONObject subscriptionJson = subscriptionsArray.getJSONObject(i);
                
                Subscription subscription = new Subscription(
                        subscriptionJson.getString("id"),
                        subscriptionJson.getString("user_id"),
                        subscriptionJson.getString("keyword"),
                        subscriptionJson.getString("created_at")
                );
                
                String userId = subscription.getUserId();
                if (!userSubscriptions.containsKey(userId)) {
                    userSubscriptions.put(userId, new ArrayList<>());
                }
                
                userSubscriptions.get(userId).add(subscription);
            }
        } catch (RestClientException e) {
            logger.error("REST client error fetching subscriptions", e);
        } catch (JSONException e) {
            logger.error("Error parsing subscription JSON", e);
        } catch (Exception e) {
            logger.error("Unexpected error fetching subscriptions", e);
        }
        
        return userSubscriptions;
    }
    
    /**
     * Fetches user details from Supabase for a list of user IDs
     * @param userIds The list of user IDs to fetch
     * @return A map of user IDs to User objects
     */
    public Map<String, User> getUsersByIds(List<String> userIds) {
        Map<String, User> users = new HashMap<>();
        
        if (userIds.isEmpty()) {
            return users;
        }
        
        try {
            JSONObject requestBody = new JSONObject();
            JSONArray userIdArray = new JSONArray();
            for (String userId : userIds) {
                userIdArray.put(userId);
            }
            requestBody.put("user_ids", userIdArray);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseKey);
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    supabaseUrl + "/rest/v1/rpc/get_users_by_ids",
                    HttpMethod.POST,
                    entity,
                    String.class);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                logger.error("Failed to fetch users: {}", response.getStatusCode());
                return users;
            }
            
            String responseBody = response.getBody();
            if (responseBody == null || responseBody.isEmpty()) {
                logger.warn("Empty response body when fetching users");
                return users;
            }
            
            JSONArray usersArray = new JSONArray(responseBody);
            
            for (int i = 0; i < usersArray.length(); i++) {
                JSONObject userJson = usersArray.getJSONObject(i);
                
                User user = new User(
                        userJson.getString("id"),
                        userJson.getString("email"),
                        userJson.optString("first_name", ""),
                        userJson.optString("last_name", "")
                );
                
                users.put(user.getId(), user);
            }
        } catch (RestClientException | JSONException e) {
            logger.error("Error fetching users", e);
        }
        
        return users;
    }
    
    /**
     * Creates a Supabase stored procedure to get users by IDs
     * Note: This should be executed once during setup in the Supabase SQL editor
     * @return true if successful, false otherwise
     */
    public boolean createGetUsersByIdsFunction() {
        String functionSql = """
        CREATE OR REPLACE FUNCTION get_users_by_ids(user_ids UUID[])
        RETURNS SETOF auth.users
        LANGUAGE sql
        SECURITY DEFINER
        SET search_path = public
        AS $$
          SELECT * FROM auth.users WHERE id = ANY(user_ids);
        $$;
        """;
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseKey);
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.setContentType(MediaType.TEXT_PLAIN);
            
            HttpEntity<String> entity = new HttpEntity<>(functionSql, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                    supabaseUrl + "/rest/v1/rpc/get_users_by_ids",
                    HttpMethod.POST,
                    entity,
                    String.class);
            
            return response.getStatusCode().is2xxSuccessful();
        } catch (RestClientException e) {
            logger.error("Error connecting to Supabase API", e);
            return false;
        } catch (JSONException e) {
            logger.error("Error processing JSON response", e);
            return false;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument for API request", e);
            return false;
        } catch (Exception e) {
            logger.error("Unexpected error creating stored procedure", e);
            return false;
        }
    }
}
