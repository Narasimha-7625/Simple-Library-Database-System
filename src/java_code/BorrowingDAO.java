import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Tutorial 3: Full Stack Web Development - UNIT 3 (SQL and JDBC)
 * Class: BorrowingDAO (Data Access Object)
 * Table: borrowings (with Foreign Keys to students and books)
 *
 * Demonstrates:
 * - Connection interface
 * - Statement & PreparedStatement interfaces
 * - ResultSet interface
 * - Querying database with JOIN, Subqueries
 * - Updating database
 */
public class BorrowingDAO {

    // Simple DTO for viewing joined borrowing record
    public static class BorrowingRecord {
        private int borrowId;
        private int studentId;
        private String studentName;
        private String department;
        private int bookId;
        private String bookTitle;
        private String author;
        private String borrowDate;
        private String status;

        public BorrowingRecord(int borrowId, int studentId, String studentName, String department,
                               int bookId, String bookTitle, String author, String borrowDate, String status) {
            this.borrowId = borrowId;
            this.studentId = studentId;
            this.studentName = studentName;
            this.department = department;
            this.bookId = bookId;
            this.bookTitle = bookTitle;
            this.author = author;
            this.borrowDate = borrowDate;
            this.status = status;
        }

        public int getBorrowId() { return borrowId; }
        public int getStudentId() { return studentId; }
        public String getStudentName() { return studentName; }
        public String getDepartment() { return department; }
        public int getBookId() { return bookId; }
        public String getBookTitle() { return bookTitle; }
        public String getAuthor() { return author; }
        public String getBorrowDate() { return borrowDate; }
        public String getStatus() { return status; }
    }

    /**
     * Operation 1: Borrow book (INSERT into borrowings + UPDATE available_copies)
     * Demonstrates: PreparedStatement and executeUpdate()
     */
    public boolean borrowBook(int studentId, int bookId, String borrowDate) {
        String insertSql = "INSERT INTO borrowings (student_id, book_id, borrow_date, status) VALUES (?, ?, ?, 'BORROWED')";
        String updateBookSql = "UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ? AND available_copies > 0";

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Begin transaction block

            // Check and decrement book copies
            try (PreparedStatement updateStmt = conn.prepareStatement(updateBookSql)) {
                updateStmt.setInt(1, bookId);
                int updated = updateStmt.executeUpdate();
                if (updated == 0) {
                    conn.rollback();
                    System.err.println("Book is not available or does not exist!");
                    return false;
                }
            }

            // Insert borrowing record
            try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                insertStmt.setInt(1, studentId);
                insertStmt.setInt(2, bookId);
                insertStmt.setDate(3, Date.valueOf(borrowDate));
                insertStmt.executeUpdate();
            }

            conn.commit(); // Commit transaction
            return true;

        } catch (SQLException e) {
            System.err.println("Error borrowing book: " + e.getMessage());
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) { /* ignore */ }
            }
            return false;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ex) { /* ignore */ }
            }
        }
    }

    /**
     * Operation 2: View borrowing records (SELECT with SQL JOIN)
     * Demonstrates:
     * - SQL INNER JOIN of 3 tables (borrowings, students, books)
     * - Statement, executeQuery(), and ResultSet traversal
     */
    public List<BorrowingRecord> getAllBorrowingRecords() {
        List<BorrowingRecord> list = new ArrayList<>();
        String sql = "SELECT b.borrow_id, s.student_id, s.name AS student_name, s.department, " +
                     "       bk.book_id, bk.title AS book_title, bk.author, b.borrow_date, b.status " +
                     "FROM borrowings b " +
                     "JOIN students s ON b.student_id = s.student_id " +
                     "JOIN books bk ON b.book_id = bk.book_id " +
                     "ORDER BY b.borrow_id DESC";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                list.add(new BorrowingRecord(
                        rs.getInt("borrow_id"),
                        rs.getInt("student_id"),
                        rs.getString("student_name"),
                        rs.getString("department"),
                        rs.getInt("book_id"),
                        rs.getString("book_title"),
                        rs.getString("author"),
                        rs.getString("borrow_date"),
                        rs.getString("status")
                ));
            }

        } catch (SQLException e) {
            System.err.println("Error viewing borrowing records: " + e.getMessage());
        }

        return list;
    }

    /**
     * Demonstrates SQL Subquery:
     * Retrieve all students who currently have borrowed books.
     */
    public List<String> getStudentsWithActiveBorrowings() {
        List<String> results = new ArrayList<>();
        String sql = "SELECT name, email FROM students " +
                     "WHERE student_id IN (SELECT DISTINCT student_id FROM borrowings WHERE status = 'BORROWED')";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                results.add(rs.getString("name") + " (" + rs.getString("email") + ")");
            }
        } catch (SQLException e) {
            System.err.println("Error running subquery: " + e.getMessage());
        }
        return results;
    }
}
