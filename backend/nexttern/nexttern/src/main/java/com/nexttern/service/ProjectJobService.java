package com.nexttern.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProjectJobService {
    public enum JobStatus { PENDING, COMPLETE, ERROR }

    public static class JobResult {
        public JobStatus status;
        public String result;
        public String error;
        public JobResult(JobStatus status) { this.status = status; }
    }

    private final Map<String, JobResult> jobs = new ConcurrentHashMap<>();

    public String createJob() {
        String jobId = UUID.randomUUID().toString();
        jobs.put(jobId, new JobResult(JobStatus.PENDING));
        return jobId;
    }

    public void completeJob(String jobId, String result) {
        JobResult job = jobs.get(jobId);
        if (job != null) {
            job.status = JobStatus.COMPLETE;
            job.result = result;
        }
    }

    public void failJob(String jobId, String error) {
        JobResult job = jobs.get(jobId);
        if (job != null) {
            job.status = JobStatus.ERROR;
            job.error = error;
        }
    }

    public JobResult getJob(String jobId) {
        return jobs.get(jobId);
    }
}
