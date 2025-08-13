package com.nexttern.outsourcedjobs;


import java.util.*;
import java.net.*;
import java.io.*;
import org.json.*;

public class AdzunaService {
    private final String appId;
    private final String apiKey;

    public AdzunaService(String appId, String apiKey) {
        this.appId = appId;
        this.apiKey = apiKey;
    }

    public List<Internship> fetchInternships() {
        List<Internship> internships = new ArrayList<>();
        try {
            // Example: Search for tech jobs in Canada
            String urlStr = String.format(
                "https://api.adzuna.com/v1/api/jobs/ca/search/1?app_id=%s&app_key=%s&what=intern&results_per_page=50&content-type=application/json",
                appId, apiKey
            );
            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("Accept", "application/json");

            int responseCode = conn.getResponseCode();
            BufferedReader in;
            if (responseCode == 200) {
                in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            } else {
                in = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
            }
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();

            System.out.println("Adzuna API HTTP response code: " + responseCode);
            System.out.println("Adzuna API raw response:\n" + response.toString());

            if (responseCode == 200) {
                JSONObject json = new JSONObject(response.toString());
                JSONArray results = json.getJSONArray("results");
                for (int i = 0; i < results.length(); i++) {
                    JSONObject job = results.getJSONObject(i);
                    String id = job.optString("id", UUID.randomUUID().toString());
                    String title = job.optString("title", "");
                    String company = job.optJSONObject("company") != null ? job.getJSONObject("company").optString("display_name", "") : "";
                    String location = job.optJSONObject("location") != null ? job.getJSONObject("location").optString("display_name", "") : "";
                    String description = job.optString("description", "");
                    String urlJob = job.optString("redirect_url", "");
                    String postedDate = job.optString("created", "");
                    String source = "Adzuna";

                    Internship internship = new Internship(id, title, company, location, description, urlJob, postedDate, source);
                    internships.add(internship);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return internships;
    }
}
