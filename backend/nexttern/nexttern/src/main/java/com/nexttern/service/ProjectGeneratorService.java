package com.nexttern.service;

import com.nexttern.config.GeminiConfig;
import com.nexttern.model.dto.ProjectRequest;
import jakarta.annotation.PostConstruct; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource; 
import org.springframework.core.io.ResourceLoader; 
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils; 
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;
import reactor.core.publisher.Mono;

import java.io.IOException; 
import java.io.InputStreamReader; 
import java.io.Reader; 
import java.io.UncheckedIOException; 
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;


@Service
public class ProjectGeneratorService {

    private final WebClient webClient;
    private final GeminiConfig geminiConfig;
    private final ResourceLoader resourceLoader; 

    private String systemPrompt;

    @Autowired
    public ProjectGeneratorService(
        GeminiConfig geminiConfig,
        ResourceLoader resourceLoader 
    ) {
        this.geminiConfig = geminiConfig;
        this.webClient = WebClient.builder()
            .baseUrl(geminiConfig.getBaseUrl())
            .clientConnector(new ReactorClientHttpConnector(
                HttpClient.create().responseTimeout(Duration.ofSeconds(60))
            ))
            .build();
        // this.profileRepository = profileRepository;
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void init() {
        Resource resource = resourceLoader.getResource("classpath:gemini_project_prompt.txt");
        try (Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)) {
            this.systemPrompt = FileCopyUtils.copyToString(reader);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to load Gemini system prompt from resources", e);
        }
    }

    public Mono<String> generateProjectRaw(ProjectRequest request) {
        String fullPrompt = this.systemPrompt + "\n\n--- USER JOB DESCRIPTION ---\n" + request.getJobDescription();

        String url = geminiConfig.getGenerateContentUrl() + "?" + geminiConfig.getApiKeyParam();

        var body = new HashMap<String, Object>();
        var contents = new ArrayList<Map<String, Object>>();

        var userPart = new HashMap<String, Object>();
        userPart.put("role", "user");

        var userParts = new ArrayList<Map<String, String>>();
        var userPromptMap = new HashMap<String, String>();
        userPromptMap.put("text", fullPrompt);
        userParts.add(userPromptMap);

        userPart.put("parts", userParts);
        contents.add(userPart);
        body.put("contents", contents);

        return webClient.post()
                .uri(url)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class);
    }

    // hashPrompt and all prompt cache logic removed.
}