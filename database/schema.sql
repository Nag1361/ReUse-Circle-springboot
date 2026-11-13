-- Optional reference schema for MySQL 8+. Spring Boot ddl-auto=update can create these tables.
-- Run CREATE DATABASE first (or execute this file) before starting the backend.
CREATE DATABASE IF NOT EXISTS reusecircle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reusecircle_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(160) NOT NULL,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS listings (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    title VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL,
    item_condition VARCHAR(60) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    pickup_area VARCHAR(160) NOT NULL,
    image_url VARCHAR(1000),
    status ENUM('AVAILABLE', 'RESERVED', 'COLLECTED') NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT fk_listings_owner FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS item_requests (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT NOT NULL,
    requester_id BIGINT NOT NULL,
    message VARCHAR(500),
    status ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    CONSTRAINT uk_request_listing_user UNIQUE (listing_id, requester_id),
    CONSTRAINT fk_requests_listing FOREIGN KEY (listing_id) REFERENCES listings(id),
    CONSTRAINT fk_requests_requester FOREIGN KEY (requester_id) REFERENCES users(id)
) ENGINE=InnoDB;
