-- Create and use database

CREATE DATABASE IF NOT EXISTS users CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE users;

-- Drop old tables if exist
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS user;

-- Admin table
CREATE TABLE admin (
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (username)
);

-- Insert default admin user
INSERT INTO admin (username, password) VALUES ('admin', 'admin');

-- User table
CREATE TABLE user (
  studentID INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  PRIMARY KEY (studentID)
);

-- Insert example user
INSERT INTO user (studentID, name, department) VALUES (90, 'Student', 'Comp Sci');
