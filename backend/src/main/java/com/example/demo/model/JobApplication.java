package com.example.demo.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "job_applications")
public class JobApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;
    private String jobTitle;
    private String status; // "Applied", "Interviewing", "Offered", "Rejected"
    private LocalDate appliedDate;

    private Double salary;
    private String location; // "Onsite", "Hybrid", "Remote"
    private String jobUrl;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private LocalDate interviewDate;
    private String contactEmail;
    private String contactName;

    // Default constructor
    public JobApplication() {
        this.appliedDate = LocalDate.now(); // Auto adds today's date
        this.status = "Applied"; // Default status
    }

    // Getters and Setters
    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getCompanyName() { 
        return companyName; 
    }
    public void setCompanyName(String companyName) { 
        this.companyName = companyName; 
    }

    public String getJobTitle() { 
        return jobTitle; 
    }
    public void setJobTitle(String jobTitle) { 
        this.jobTitle = jobTitle; 
    }

    public String getStatus() { 
        return status; 
    }
    public void setStatus(String status) { 
        this.status = status; 
    }

    public LocalDate getAppliedDate() { 
        return appliedDate; 
    }
    public void setAppliedDate(LocalDate appliedDate) { 
        this.appliedDate = appliedDate; 
    }

    public Double getSalary() {
        return salary;
    }
    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public String getJobUrl() {
        return jobUrl;
    }
    public void setJobUrl(String jobUrl) {
        this.jobUrl = jobUrl;
    }

    public String getNotes() {
        return notes;
    }
    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDate getInterviewDate() {
        return interviewDate;
    }
    public void setInterviewDate(LocalDate interviewDate) {
        this.interviewDate = interviewDate;
    }

    public String getContactEmail() {
        return contactEmail;
    }
    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactName() {
        return contactName;
    }
    public void setContactName(String contactName) {
        this.contactName = contactName;
    }
}