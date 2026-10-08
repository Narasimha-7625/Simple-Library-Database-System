import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Tutorial 3: Full Stack Web Development - UNIT 3 (SQL and JDBC)
 * Class: BookDAO (Data Access Object)
 * Table: books
 *
 * Demonstrates:
 * - Connection interface
 * - Statement & PreparedStatement interfaces
 * - ResultSet interface
 * - Querying database
 * - Updating database
 */
public class BookDAO {

    // Simple model class representation
    public static class Book {
        private int bookId;
        private String title;
        private String author;
        private String category;
        private int availableCopies;

        public Book(int bookId, String title, String author, String category, int availableCopies) {
            this.bookId = bookId;
            this.title = title;
            this.author = author;
            this.category = category;
            this.availableCopies = availableCopies;
        }

        public Book(String title, String author, String category, int availableCopies) {
            this(0, title, author, category, availableCopies);
        }

        public int getBookId() { return bookId; }
        public String getTitle() { return title; }
        public String getAuthor() { return author; }
        public String getCategory() { return category; }
        public int getAvailableCopies() { return availableCopies; }

        @Override
        public String toString() {
            return String.format("[%d] \"%s\" by %s | Category: %s | Copies: %d",
                    bookId, title, author, category, availableCopies);
        }
    }

    /**
     * Operation 1: Add book (INSERT)
     * Demonstrates: PreparedStatement, executeUpdate()
     */
    public boolean addBook(Book book) {
        String sql = "INSERT INTO books (title, author, category, available_copies) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, book.getTitle());
            pstmt.setString(2, book.getAuthor());
            pstmt.setString(3, book.getCategory());
            pstmt.setInt(4, book.getAvailableCopies());

            int rowsAffected = pstmt.executeUpdate(); // Updating database
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error adding book: " + e.getMessage());
            return false;
        }
    }

    /**
     * Operation 2: View books (SELECT)
     * Demonstrates: Statement, executeQuery(), ResultSet
     */
    public List<Book> getAllBooks() {
        List<Book> list = new ArrayList<>();
        String sql = "SELECT book_id, title, author, category, available_copies FROM books ORDER BY book_id ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                int id = rs.getInt("book_id");
                String title = rs.getString("title");
                String author = rs.getString("author");
                String category = rs.getString("category");
                int copies = rs.getInt("available_copies");

                list.add(new Book(id, title, author, category, copies));
            }

        } catch (SQLException e) {
            System.err.println("Error viewing books: " + e.getMessage());
        }

        return list;
    }

    /**
     * Operation 3: Update book (UPDATE)
     * Demonstrates: PreparedStatement, executeUpdate()
     */
    public boolean updateBook(int bookId, String title, String author, String category, int availableCopies) {
        String sql = "UPDATE books SET title = ?, author = ?, category = ?, available_copies = ? WHERE book_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, title);
            pstmt.setString(2, author);
            pstmt.setString(3, category);
            pstmt.setInt(4, availableCopies);
            pstmt.setInt(5, bookId);

            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error updating book: " + e.getMessage());
            return false;
        }
    }

    /**
     * Operation 4: Delete book (DELETE)
     * Demonstrates: PreparedStatement, executeUpdate()
     */
    public boolean deleteBook(int bookId) {
        String sql = "DELETE FROM books WHERE book_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, bookId);
            int rowsAffected = pstmt.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting book: " + e.getMessage());
            return false;
        }
    }
}
