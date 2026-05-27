package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.JobApplication;
import com.example.demo.repository.JobRepository;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000") // Connect with Next.js frontend
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    // 1. Get all job applications
    @GetMapping
    public List<JobApplication> getAllJobs() {
        return jobRepository.findAll();
    }

    // 2. Get a single job application by ID
    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getJobById(@PathVariable Long id) {
        Optional<JobApplication> jobOpt = jobRepository.findById(id);
        if (jobOpt.isPresent()) {
            return ResponseEntity.ok(jobOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 3. Add a new job application
    @PostMapping
    public JobApplication createJob(@RequestBody JobApplication job) {
        return jobRepository.save(job);
    }

    // 4. Update an existing job application (including drag-and-drop status changes)
    @PutMapping("/{id}")
    public ResponseEntity<JobApplication> updateJob(@PathVariable Long id, @RequestBody JobApplication jobDetails) {
        Optional<JobApplication> jobOpt = jobRepository.findById(id);
        if (jobOpt.isPresent()) {
            JobApplication job = jobOpt.get();
            job.setCompanyName(jobDetails.getCompanyName());
            job.setJobTitle(jobDetails.getJobTitle());
            job.setStatus(jobDetails.getStatus());
            job.setAppliedDate(jobDetails.getAppliedDate());
            job.setSalary(jobDetails.getSalary());
            job.setLocation(jobDetails.getLocation());
            job.setJobUrl(jobDetails.getJobUrl());
            job.setNotes(jobDetails.getNotes());
            job.setInterviewDate(jobDetails.getInterviewDate());
            job.setContactEmail(jobDetails.getContactEmail());
            job.setContactName(jobDetails.getContactName());
            
            JobApplication updatedJob = jobRepository.save(job);
            return ResponseEntity.ok(updatedJob);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 5. Delete a job application
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        Optional<JobApplication> jobOpt = jobRepository.findById(id);
        if (jobOpt.isPresent()) {
            jobRepository.delete(jobOpt.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}