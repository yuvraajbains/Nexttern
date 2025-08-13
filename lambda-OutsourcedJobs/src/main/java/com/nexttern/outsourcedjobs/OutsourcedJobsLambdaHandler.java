package com.nexttern.outsourcedjobs;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.ClientContext;
import com.amazonaws.services.lambda.runtime.CognitoIdentity;
import java.util.List;

public class OutsourcedJobsLambdaHandler implements RequestHandler<Object, String> {
    
    public static void main(String[] args) {
        System.out.println("Starting local test of OutsourcedJobsLambdaHandler...");
        OutsourcedJobsLambdaHandler handler = new OutsourcedJobsLambdaHandler();
        
        // Create a mock Context for local testing
        String result = handler.handleRequest(null, new Context() {
            @Override public String getAwsRequestId() { return "local"; }
            @Override public String getLogGroupName() { return "local"; }
            @Override public String getLogStreamName() { return "local"; }
            @Override public String getFunctionName() { return "local"; }
            @Override public String getFunctionVersion() { return "local"; }
            @Override public String getInvokedFunctionArn() { return "local"; }
            @Override public CognitoIdentity getIdentity() { return null; }
            @Override public ClientContext getClientContext() { return null; }
            @Override public int getRemainingTimeInMillis() { return 30000; }
            @Override public int getMemoryLimitInMB() { return 512; }
            @Override public LambdaLogger getLogger() { 
                return new LambdaLogger() {
                    @Override public void log(String message) { 
                        System.out.print(message); 
                    }
                    @Override public void log(byte[] message) { 
                        System.out.print(new String(message)); 
                    }
                }; 
            }
        });
        
        System.out.println(result);
    }
    
    @Override
    public String handleRequest(Object input, Context context) {
        LambdaLogger logger = context.getLogger();
        logger.log("Starting outsourced jobs Lambda...\n");
        
        // Initialize services
        JobBankCanadaService jobBankService = new JobBankCanadaService();

        // Read Adzuna keys from environment variables or application.properties
        String appId = System.getenv("ADZUNA_API_APP_ID");
        String apiKey = System.getenv("ADZUNA_API_KEY");
        
        if (appId == null || apiKey == null) {
            try {
                java.util.Properties props = new java.util.Properties();
                java.io.InputStream in = OutsourcedJobsLambdaHandler.class.getClassLoader()
                    .getResourceAsStream("application.properties");
                if (in != null) {
                    props.load(in);
                    appId = props.getProperty("adzuna.api.app_id");
                    apiKey = props.getProperty("adzuna.api.key");
                    in.close();
                }
            } catch (Exception e) {
                logger.log("Failed to load Adzuna API keys: " + e.getMessage() + "\n");
            }
        }
        
        AdzunaService adzunaService = new AdzunaService(appId, apiKey);
        DynamoDBInternshipSaver saver = new DynamoDBInternshipSaver();
        
        int total = 0;
        
        // Fetch jobs from Job Bank Canada
        List<Internship> jobBankJobs = jobBankService.fetchInternships();
        // saver.saveAll(jobBankJobs); // Storage disabled for testing
        total += jobBankJobs.size();
        logger.log("Fetched " + jobBankJobs.size() + " jobs from Job Bank Canada\n");
        
        // Fetch jobs from Adzuna
        List<Internship> adzunaJobs = adzunaService.fetchInternships();
        // saver.saveAll(adzunaJobs); // Storage disabled for testing
        total += adzunaJobs.size();
        logger.log("Fetched " + adzunaJobs.size() + " jobs from Adzuna\n");
        
        logger.log("Outsourced jobs scraping complete. Total internships processed: " + total + "\n");
        return "Outsourced jobs Lambda finished. Total internships processed: " + total;
    }
}