-- =========================================================================
-- EXPENSE TRACKER DATABASE SCHEMA & SEED DATA SCRIPT
-- Database Engine: MySQL
-- =========================================================================

-- 1. Create Database (If not exists)
CREATE DATABASE IF NOT EXISTS expense_tracker;
USE expense_tracker;

-- 2. Drop Tables if they exist (To allow clean re-runs)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 3. Create Users Table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Categories Table
CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uq_category_user (category_name, user_id),
    INDEX idx_category_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create Expenses Table
CREATE TABLE expenses (
    expense_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    notes TEXT,
    category_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_expenses_user (user_id),
    INDEX idx_expenses_date (expense_date),
    INDEX idx_expenses_user_date (user_id, expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create Budgets Table
CREATE TABLE budgets (
    budget_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uq_budget_user_date (user_id, category_id, month, year),
    INDEX idx_budgets_user_date (user_id, category_id, month, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Seed System Default Categories (user_id = NULL)
INSERT INTO categories (category_name, user_id) VALUES
('Food', NULL),
('Travel', NULL),
('Shopping', NULL),
('Bills', NULL),
('Entertainment', NULL),
('Health', NULL),
('Others', NULL);

-- Seed Sample User (Password is 'password123' BCrypt-hashed: '$2a$10$wT2Hl7JpG9nN8pIe7mfeG.4rB9Klhv.YgW7v5y5i3q6hO1p6S/x2O')
INSERT INTO users (user_id, name, email, password) VALUES
(1, 'John Doe', 'john@example.com', '$2a$10$wT2Hl7JpG9nN8pIe7mfeG.4rB9Klhv.YgW7v5y5i3q6hO1p6S/x2O');

-- Seed Sample Custom Category for John Doe
INSERT INTO categories (category_name, user_id) VALUES
('Subscriptions', 1);

-- Seed Sample Expenses for John Doe (user_id = 1)
-- Categories: Food (1), Travel (2), Bills (4), Subscriptions (8)
INSERT INTO expenses (title, amount, expense_date, payment_method, notes, category_id, user_id) VALUES
('Grocery Shopping', 120.50, '2026-06-25', 'CREDIT_CARD', 'Weekly food refill at Walmart', 1, 1),
('Fuel refill', 45.00, '2026-06-26', 'DEBIT_CARD', 'Shell gas station refill', 2, 1),
('Electricity Bill', 85.20, '2026-06-15', 'NET_BANKING', 'June power bill', 4, 1),
('Netflix Premium', 15.99, '2026-06-01', 'CREDIT_CARD', 'Monthly sub', 8, 1),
('Restaurant Dinner', 65.00, '2026-06-27', 'CASH', 'Dinner with family', 1, 1);

-- Seed Sample Budgets for John Doe (user_id = 1)
-- Set $150 budget for Food in June 2026
-- Set $50 budget for Travel in June 2026
INSERT INTO budgets (category_id, amount, month, year, user_id) VALUES
(1, 150.00, 6, 2026, 1),
(2, 50.00, 6, 2026, 1);
