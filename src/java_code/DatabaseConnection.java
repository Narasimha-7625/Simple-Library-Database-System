import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Tutorial 3: Full Stack Web Development - UNIT 3 (SQL and JDBC)
 * Class: DatabaseConnection
 * Demonstrates:
 * 1. Setting up database connection parameters
 * 2. DriverManager class usage
 * 3. Connection interface
 */
public class DatabaseConnection {

    // JDBC Driver and Database URL
    // Standard MySQL 8+ driver is "com.mysql.cj.jdbc.Driver"
    private static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";
    private static final String DB_URL = "jdbc:mysql://localhost:3306/library_db?useSSL=false&allowPublicKeyRetrieval=true";

    // Database Credentials
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "password";

    // Private constructor to prevent instantiation (Utility pattern)
    private DatabaseConnection() {}

    /**
     * Establishes and returns a new active Connection to the MySQL database.
     * Demonstrates Step 1 (Load Driver) and Step 2 (Get Connection via DriverManager).
     */
    public static Connection getConnection() throws SQLException {
        try {
            // Step 1: Register and load JDBC driver class into memory
            Class.forName(JDBC_DRIVER);
        } catch (ClassNotFoundException e) {
            System.err.println("JDBC Driver not found: " + e.getMessage());
            throw new SQLException("Unable to load MySQL JDBC Driver", e);
        }

        // Step 2: Establish connection using DriverManager
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }
}
