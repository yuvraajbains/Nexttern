package com.nexttern.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "ai.gemini")
@Configuration
public class GeminiConfig {
    private String apiKey;
    private String baseUrl = "https://generativelanguage.googleapis.com"; //api base URL publically available already
    private String model = "gemini-1.5-flash"; // model name publically available already also
    private int timeout = 30000;
    private int maxTokens = 1000;
    private double temperature = 0.7;
    private String apiVersion = "v1";
    private int maxRetries = 3;
    private long retryDelay = 1000;

    // Getters and Setters
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public int getTimeout() { return timeout; }
    public void setTimeout(int timeout) { this.timeout = timeout; }
    public int getMaxTokens() { return maxTokens; }
    public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }
    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }
    public String getApiVersion() { return apiVersion; }
    public void setApiVersion(String apiVersion) { this.apiVersion = apiVersion; }
    public int getMaxRetries() { return maxRetries; }
    public void setMaxRetries(int maxRetries) { this.maxRetries = maxRetries; }
    public long getRetryDelay() { return retryDelay; }
    public void setRetryDelay(long retryDelay) { this.retryDelay = retryDelay; }

    public String getGenerateContentUrl() {
        return String.format("%s/%s/models/%s:generateContent", baseUrl, apiVersion, model);
    }

    public String getApiKeyParam() {
        return "key=" + apiKey;
    }

    public boolean isValidConfig() {
        return apiKey != null && !apiKey.isEmpty() && baseUrl != null && !baseUrl.isEmpty() && model != null && !model.isEmpty();
    }
}
