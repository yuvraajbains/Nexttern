package com.nexttern.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nexttern.model.Profile;

/**
 * Repository for Profile entity
 * JpaRepository already provides findById method, no need to redeclare it
 */
@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    // No need to declare findById since it's already provided by JpaRepository
}