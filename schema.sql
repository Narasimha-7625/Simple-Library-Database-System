-- =====================================================================
-- Simple Library Database System
-- Tutorial 3: Full Stack Web Development - UNIT 3 (SQL and JDBC)
-- Database: MySQL
-- =====================================================================

-- Step 1: Setting up database
CREATE DATABASE IF NOT EXISTS librarydatabase;
USE librarydatabase;

-- Step 2: DDL - DROP TABLE (in reverse foreign-key order)
DROP TABLE IF EXISTS borrowings;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS students;

-- Step 3: DDL - CREATE TABLE (3 Tables only)
-- Table 1: students
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL
);

-- Table 2: books
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    available_copies INT NOT NULL DEFAULT 1
);

-- Table 3: borrowings
CREATE TABLE borrowings (
    borrow_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    book_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- Step 4: DDL - ALTER TABLE demonstration (e.g., adding phone column)
ALTER TABLE students ADD COLUMN phone VARCHAR(15) NULL;

-- Step 5: DML - INSERT Statements (Initial data)
INSERT INTO students (name, email, department, phone) VALUES
('Aarav Sharma', 'aarav.sharma@srmist.edu.in', 'Computer Science', '9876543210'),
('Diya Patel', 'diya.patel@srmist.edu.in', 'Information Tech', '9876543211'),
('Rohan Verma', 'rohan.verma@srmist.edu.in', 'Computer Science', '9876543212'),
('Sneha Reddy', 'sneha.reddy@srmist.edu.in', 'Mechanical Eng', '9876543213'),
('Vikram Singh', 'vikram.singh@srmist.edu.in', 'Electrical Eng', '9876543214');

INSERT INTO books (title, author, category, available_copies) VALUES
('Database System Concepts', 'Silberschatz', 'Computer Science', 4),
('Introduction to Algorithms', 'Cormen', 'Computer Science', 2),
('Clean Code', 'Robert C. Martin', 'Software Eng', 3),
('Engineering Thermodynamics', 'P.K. Nag', 'Mechanical Eng', 5),
('Digital Logic and Microprocessors', 'Morris Mano', 'Electrical Eng', 1);

INSERT INTO borrowings (student_id, book_id, borrow_date, status) VALUES
(1, 1, '2026-03-01', 'BORROWED'),
(1, 2, '2026-03-05', 'BORROWED'),
(2, 3, '2026-03-10', 'RETURNED'),
(3, 1, '2026-03-12', 'BORROWED'),
(4, 4, '2026-03-15', 'BORROWED');

-- =====================================================================
-- UNIT 3 SQL TOPICS DEMONSTRATIONS
-- =====================================================================

-- 1. SQL Basics - SELECT all columns
SELECT * FROM students;
SELECT * FROM books;
SELECT * FROM borrowings;

-- 2. WHERE clause filtering
SELECT student_id, name, department 
FROM students 
WHERE department = 'Computer Science';

-- 3. JOIN (INNER JOIN of 3 tables to view complete borrow records)
SELECT 
    b.borrow_id,
    s.name AS student_name,
    s.department,
    bk.title AS book_title,
    bk.author,
    b.borrow_date,
    b.status
FROM borrowings b
JOIN students s ON b.student_id = s.student_id
JOIN books bk ON b.book_id = bk.book_id;

-- 4. UNION (Combine distinct list of departments and book categories)
SELECT department AS label, 'Department' AS type FROM students
UNION
SELECT category AS label, 'Book Category' AS type FROM books;

-- 5. INTERSECT (Find categories in books that match student departments)
-- In MySQL 8.0+:
SELECT department FROM students
INTERSECT
SELECT category FROM books;

-- In MySQL versions without INTERSECT keyword (equivalent query):
SELECT DISTINCT s.department 
FROM students s 
WHERE s.department IN (SELECT category FROM books);

-- 6. EXCEPT (Find departments with students that have NO book category match)
-- In MySQL 8.0+:
SELECT department FROM students
EXCEPT
SELECT category FROM books;

-- Equivalent MySQL compatible query:
SELECT DISTINCT department 
FROM students 
WHERE department NOT IN (SELECT category FROM books);

-- 7. Subquery (Find students who have borrowed at least one book)
SELECT student_id, name, email, department
FROM students
WHERE student_id IN (
    SELECT DISTINCT student_id 
    FROM borrowings 
    WHERE status = 'BORROWED'
);

-- Subquery with Scalar comparison (Find books with copies greater than average)
SELECT title, author, available_copies
FROM books
WHERE available_copies > (SELECT AVG(available_copies) FROM books);

-- 8. UPDATE Statement
UPDATE books 
SET available_copies = available_copies - 1 
WHERE book_id = 1;

UPDATE students 
SET department = 'Artificial Intelligence' 
WHERE student_id = 1;

-- 9. DELETE Statement
DELETE FROM borrowings WHERE borrow_id = 5;
DELETE FROM students WHERE student_id = 5;
