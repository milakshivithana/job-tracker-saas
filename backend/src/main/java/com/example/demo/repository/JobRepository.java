package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.model.JobApplication;

@Repository
public interface JobRepository extends JpaRepository<JobApplication, Long> {
    // Spring Boot auto generates all the basic SQL queries for us!
}