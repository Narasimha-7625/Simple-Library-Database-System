import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Tutorial 3: Full Stack Web Development - UNIT 3 (SQL and JDBC)
 * Class: StudentDAO (Data Access Object)
 * Table: students
 *
 * Demonstrates:
 * - Connection interface
 * - Statement & PreparedStatement interfaces
 * - ResultSet interface (rs.next(), rs.getInt(), rs.getString())
 * - Querying database (executeQuery)
 * - Updating database (executeUpdate for INSERT, UPDATE, DELETE)
 */
public class StudentDAO {

    // Simple model class representation
    public static class Student {
        private int studentId;
        private String name;
        private String email;
        private String department;
        private String phone;

        public Student(int studentId, String name, String email, String department, String phone) {
            this.studentId = studentId;
            this.name = name;
            this.email = email;
            this.department = department;
            this.phone = phone;
        }

        public Student(String name, String email, String department, String phone) {
            this(0, name, email, department, phone);
        }

        public int getStudentId() { return studentId; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getDepartment() { return department; }
        public String getPhone() { return phone; }

        @Override
        public String toString() {
            return String.format("[%d] %s | %s | Dept: %s | Phone: %s",
                    studentId, name, email, department, (phone != null ? phone : "N/A"));
        }
    }

    /**
     * Operation 1: Add student (INSERT)
     * Demonstrates: PreparedStatement and executeUpdate()
     */
    public boolean addStudent(Student student) {
        String sql = "INSERT INTO students (name, email, department, phone) VALUES (?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setString(1, student.getName());
            pstmt.setString(2, student.getEmail());
            pstmt.setString(3, student.getDepartment());
            pstmt.setString(4, student.getPhone());

            int rowsAffected = pstmt.executeUpdate(); // Updating database
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error adding student: " + e.getMessage());
            return false;
        }
    }

    /**
     * Operation 2: View students (SELECT)
     * Demonstrates: Statement, executeQuery(), and ResultSet traversal
     */
    public List<Student> getAllStudents() {
        List<Student> list = new ArrayList<>();
        String sql = "SELECT student_id, name, email, department, phone FROM students ORDER BY student_id ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();           // Statement interface
             ResultSet rs = stmt.executeQuery(sql)) {           // Querying database -> ResultSet

            // Traverse the cursor through rows
            while (rs.next()) {
                int id = rs.getInt("student_id");
                String name = rs.getString("name");
                String email = rs.getString("email");
                String dept = rs.getString("department");
                String phone = rs.getString("phone");

                list.add(new Student(id, name, email, dept, phone));
            }

        } catch (SQLException e) {
            System.err.println("Error viewing students: " + e.getMessage());
        }

        return list;
    }

    /**
     * Operation 3: Update student (UPDATE)
     * Demonstrates: PreparedStatement, executeUpdate()
     */
    public boolean updateStudent(int studentId, String name, String email, String department, String phone) {
        String sql = "UPDATE students SET name = ?, email = ?, department = ?, phone = ? WHERE student_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            pstmt.setString(2, email);
            pstmt.setString(3, department);
            pstmt.setString(4, phone);
            pstmt.setInt(5, studentId);

            int rowsAffected = pstmt.executeUpdate(); // Updating database
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error updating student: " + e.getMessage());
            return false;
        }
    }

    /**
     * Operation 4: Delete student (DELETE)
     * Demonstrates: PreparedStatement, executeUpdate()
     */
    public boolean deleteStudent(int studentId) {
        String sql = "DELETE FROM students WHERE student_id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, studentId);
            int rowsAffected = pstmt.executeUpdate(); // Updating database
            return rowsAffected > 0;

        } catch (SQLException e) {
            System.err.println("Error deleting student: " + e.getMessage());
            return false;
        }
    }
}
