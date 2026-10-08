import java.util.List;
import java.util.Scanner;

/**
 * Tutorial 3: Full Stack Web Development - UNIT 3 (SQL and JDBC)
 * Application: Simple Library Database System
 * Entry Point: Main.java
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("   SIMPLE LIBRARY DATABASE SYSTEM (UNIT 3 - SQL & JDBC)");
        System.out.println("==================================================");

        StudentDAO studentDAO = new StudentDAO();
        BookDAO bookDAO = new BookDAO();
        BorrowingDAO borrowingDAO = new BorrowingDAO();
        Scanner scanner = new Scanner(System.in);

        boolean running = true;
        while (running) {
            System.out.println("\n--- MAIN MENU ---");
            System.out.println("1. Students: View All");
            System.out.println("2. Students: Add New");
            System.out.println("3. Students: Update");
            System.out.println("4. Students: Delete");
            System.out.println("5. Books: View All");
            System.out.println("6. Books: Add New");
            System.out.println("7. Books: Update");
            System.out.println("8. Books: Delete");
            System.out.println("9. Borrowings: Borrow Book");
            System.out.println("10. Borrowings: View Borrow Records (JOIN)");
            System.out.println("11. SQL Demo: Active Borrowers (Subquery)");
            System.out.println("0. Exit");
            System.out.print("Enter choice: ");

            int choice = -1;
            try {
                choice = Integer.parseInt(scanner.nextLine().trim());
            } catch (Exception e) {
                System.out.println("Invalid input!");
                continue;
            }

            switch (choice) {
                case 1:
                    System.out.println("\n--- Students List ---");
                    List<StudentDAO.Student> students = studentDAO.getAllStudents();
                    for (StudentDAO.Student s : students) {
                        System.out.println(s);
                    }
                    break;

                case 2:
                    System.out.print("Name: ");
                    String name = scanner.nextLine();
                    System.out.print("Email: ");
                    String email = scanner.nextLine();
                    System.out.print("Department: ");
                    String dept = scanner.nextLine();
                    System.out.print("Phone: ");
                    String phone = scanner.nextLine();
                    studentDAO.addStudent(new StudentDAO.Student(name, email, dept, phone));
                    System.out.println("Student added successfully!");
                    break;

                case 3:
                    System.out.print("Student ID to update: ");
                    int updateId = Integer.parseInt(scanner.nextLine());
                    System.out.print("New Name: ");
                    String uName = scanner.nextLine();
                    System.out.print("New Email: ");
                    String uEmail = scanner.nextLine();
                    System.out.print("New Department: ");
                    String uDept = scanner.nextLine();
                    System.out.print("New Phone: ");
                    String uPhone = scanner.nextLine();
                    studentDAO.updateStudent(updateId, uName, uEmail, uDept, uPhone);
                    System.out.println("Student updated!");
                    break;

                case 4:
                    System.out.print("Student ID to delete: ");
                    int delId = Integer.parseInt(scanner.nextLine());
                    studentDAO.deleteStudent(delId);
                    System.out.println("Student deleted!");
                    break;

                case 5:
                    System.out.println("\n--- Books List ---");
                    List<BookDAO.Book> books = bookDAO.getAllBooks();
                    for (BookDAO.Book b : books) {
                        System.out.println(b);
                    }
                    break;

                case 6:
                    System.out.print("Title: ");
                    String title = scanner.nextLine();
                    System.out.print("Author: ");
                    String author = scanner.nextLine();
                    System.out.print("Category: ");
                    String cat = scanner.nextLine();
                    System.out.print("Available Copies: ");
                    int copies = Integer.parseInt(scanner.nextLine());
                    bookDAO.addBook(new BookDAO.Book(title, author, cat, copies));
                    System.out.println("Book added successfully!");
                    break;

                case 7:
                    System.out.print("Book ID to update: ");
                    int ubId = Integer.parseInt(scanner.nextLine());
                    System.out.print("New Title: ");
                    String ubTitle = scanner.nextLine();
                    System.out.print("New Author: ");
                    String ubAuthor = scanner.nextLine();
                    System.out.print("New Category: ");
                    String ubCat = scanner.nextLine();
                    System.out.print("New Copies: ");
                    int ubCopies = Integer.parseInt(scanner.nextLine());
                    bookDAO.updateBook(ubId, ubTitle, ubAuthor, ubCat, ubCopies);
                    System.out.println("Book updated!");
                    break;

                case 8:
                    System.out.print("Book ID to delete: ");
                    int dbId = Integer.parseInt(scanner.nextLine());
                    bookDAO.deleteBook(dbId);
                    System.out.println("Book deleted!");
                    break;

                case 9:
                    System.out.print("Student ID: ");
                    int sId = Integer.parseInt(scanner.nextLine());
                    System.out.print("Book ID: ");
                    int bId = Integer.parseInt(scanner.nextLine());
                    System.out.print("Date (YYYY-MM-DD): ");
                    String date = scanner.nextLine();
                    if (borrowingDAO.borrowBook(sId, bId, date)) {
                        System.out.println("Book borrowed successfully!");
                    } else {
                        System.out.println("Failed to borrow book (check IDs or copies).");
                    }
                    break;

                case 10:
                    System.out.println("\n--- Borrowing Records (JOIN Query) ---");
                    List<BorrowingDAO.BorrowingRecord> records = borrowingDAO.getAllBorrowingRecords();
                    for (BorrowingDAO.BorrowingRecord r : records) {
                        System.out.printf("[%d] Student: %s (%s) | Book: %s by %s | Date: %s | Status: %s%n",
                                r.getBorrowId(), r.getStudentName(), r.getDepartment(),
                                r.getBookTitle(), r.getAuthor(), r.getBorrowDate(), r.getStatus());
                    }
                    break;

                case 11:
                    System.out.println("\n--- Subquery: Students with active borrowings ---");
                    List<String> active = borrowingDAO.getStudentsWithActiveBorrowings();
                    for (String str : active) {
                        System.out.println(" - " + str);
                    }
                    break;

                case 0:
                    running = false;
                    System.out.println("Exiting Simple Library Database System. Goodbye!");
                    break;

                default:
                    System.out.println("Invalid selection!");
            }
        }
        scanner.close();
    }
}
