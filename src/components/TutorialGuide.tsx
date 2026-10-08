import React, { useState } from 'react';
import { VIVA_QUESTIONS, UNIT_3_SYLLABUS_MAPPING } from '../data/initialData';
import { BookOpen, Layers, CheckCircle2, HelpCircle, ArrowRight, Table, Server, GitFork } from 'lucide-react';

export const TutorialGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'structure' | 'queries' | 'workflow' | 'mapping' | 'viva'>('structure');

  return (
    <div className="space-y-6">
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('structure')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
            activeSection === 'structure'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          1. Database Structure
        </button>

        <button
          onClick={() => setActiveSection('queries')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
            activeSection === 'queries'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          2. SQL Queries Guide
        </button>

        <button
          onClick={() => setActiveSection('workflow')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
            activeSection === 'workflow'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          3. JDBC Workflow (7 Steps)
        </button>

        <button
          onClick={() => setActiveSection('mapping')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
            activeSection === 'mapping'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          4. Unit-III Topic Mapping
        </button>

        <button
          onClick={() => setActiveSection('viva')}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
            activeSection === 'viva'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          5. 10 Viva Questions & Answers
        </button>
      </div>

      {/* SECTION 1: DATABASE STRUCTURE */}
      {activeSection === 'structure' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Table className="w-5 h-5 text-blue-400" />
              1. Database Structure (3 Tables Only)
            </h3>
            <p className="text-sm text-slate-400">
              The system database is named <code className="text-blue-300">library_db</code> in MySQL. It maintains exactly 3 normalized tables adhering to referential integrity constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Table 1: students */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="font-mono font-bold text-blue-400">students</span>
                <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded">
                  Parent Table
                </span>
              </div>
              <ul className="text-xs space-y-2 font-mono">
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-amber-300 font-bold">student_id (PK)</span>
                  <span className="text-slate-400">INT AUTO_INCREMENT</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">name</span>
                  <span className="text-slate-400">VARCHAR(100) NOT NULL</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">email (UNIQUE)</span>
                  <span className="text-slate-400">VARCHAR(100) NOT NULL</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">department</span>
                  <span className="text-slate-400">VARCHAR(50) NOT NULL</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-emerald-400">phone</span>
                  <span className="text-slate-400">VARCHAR(15) [ALTER TABLE]</span>
                </li>
              </ul>
            </div>

            {/* Table 2: books */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="font-mono font-bold text-emerald-400">books</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">
                  Parent Table
                </span>
              </div>
              <ul className="text-xs space-y-2 font-mono">
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-amber-300 font-bold">book_id (PK)</span>
                  <span className="text-slate-400">INT AUTO_INCREMENT</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">title</span>
                  <span className="text-slate-400">VARCHAR(150) NOT NULL</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">author</span>
                  <span className="text-slate-400">VARCHAR(100) NOT NULL</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">category</span>
                  <span className="text-slate-400">VARCHAR(50) NOT NULL</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">available_copies</span>
                  <span className="text-slate-400">INT DEFAULT 1</span>
                </li>
              </ul>
            </div>

            {/* Table 3: borrowings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                <span className="font-mono font-bold text-purple-400">borrowings</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                  Child Table (Junction)
                </span>
              </div>
              <ul className="text-xs space-y-2 font-mono">
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-amber-300 font-bold">borrow_id (PK)</span>
                  <span className="text-slate-400">INT AUTO_INCREMENT</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-blue-400 font-semibold">student_id (FK)</span>
                  <span className="text-slate-400">REFERENCES students</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-emerald-400 font-semibold">book_id (FK)</span>
                  <span className="text-slate-400">REFERENCES books</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">borrow_date</span>
                  <span className="text-slate-400">DATE NOT NULL</span>
                </li>
                <li className="flex justify-between p-1 bg-slate-950 rounded">
                  <span className="text-slate-200">status</span>
                  <span className="text-slate-400">VARCHAR(20) DEFAULT 'BORROWED'</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed space-y-2">
            <h4 className="font-bold text-white text-sm">Relational Relationships &amp; Integrity:</h4>
            <p>
              • <strong>1-to-Many Relationship:</strong> One Student can borrow multiple Books over time (<code>students.student_id 1:M borrowings.student_id</code>).
            </p>
            <p>
              • <strong>1-to-Many Relationship:</strong> One Book can appear in multiple borrowing transaction records (<code>books.book_id 1:M borrowings.book_id</code>).
            </p>
            <p>
              • <strong>Referential Integrity:</strong> <code>ON DELETE CASCADE</code> guarantees that if a student or book is deleted, corresponding transaction logs in <code>borrowings</code> are automatically maintained without dangling foreign keys.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 2: SQL QUERIES */}
      {activeSection === 'queries' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              2. SQL Queries Guide (Every Unit-III Topic)
            </h3>
            <p className="text-sm text-slate-400">
              Complete reference of SQL queries categorized into DDL (Data Definition Language), DML (Data Manipulation Language), DQL (Data Query Language), and Set Operators.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "1. SQL Basics & SELECT",
                query: "SELECT student_id, name, email, department FROM students;",
                purpose: "Retrieves specified column values across all rows from the students table."
              },
              {
                title: "2. WHERE Clause",
                query: "SELECT * FROM books WHERE category = 'Computer Science' AND available_copies > 0;",
                purpose: "Filters records using conditional predicates."
              },
              {
                title: "3. JOIN (INNER JOIN across 3 tables)",
                query: "SELECT b.borrow_id, s.name, bk.title, b.borrow_date, b.status\nFROM borrowings b\nJOIN students s ON b.student_id = s.student_id\nJOIN books bk ON b.book_id = bk.book_id;",
                purpose: "Combines records from borrowings, students, and books into a single relational view."
              },
              {
                title: "4. UNION Operator",
                query: "SELECT department AS name FROM students\nUNION\nSELECT category AS name FROM books;",
                purpose: "Combines unique values from two queries into a single result set without duplicates."
              },
              {
                title: "5. INTERSECT Operator",
                query: "-- MySQL 8.0+:\nSELECT department FROM students\nINTERSECT\nSELECT category FROM books;\n\n-- Cross-version compatible subquery:\nSELECT DISTINCT department FROM students WHERE department IN (SELECT category FROM books);",
                purpose: "Returns values that exist in both student departments and book categories."
              },
              {
                title: "6. EXCEPT (MINUS) Operator",
                query: "-- MySQL 8.0+:\nSELECT department FROM students\nEXCEPT\nSELECT category FROM books;\n\n-- Compatible equivalent:\nSELECT DISTINCT department FROM students WHERE department NOT IN (SELECT category FROM books);",
                purpose: "Returns student departments that do not exist as any category in the books table."
              },
              {
                title: "7. Subquery (Nested Query)",
                query: "SELECT name, email FROM students\nWHERE student_id IN (\n    SELECT DISTINCT student_id FROM borrowings WHERE status = 'BORROWED'\n);",
                purpose: "Uses an inner SELECT query inside the WHERE clause of an outer query."
              },
              {
                title: "8. INSERT Statement",
                query: "INSERT INTO students (name, email, department, phone)\nVALUES ('Aditi Rao', 'aditi@srmist.edu.in', 'Computer Science', '9876543220');",
                purpose: "Adds a new student record into the database."
              },
              {
                title: "9. UPDATE Statement",
                query: "UPDATE books\nSET available_copies = available_copies - 1\nWHERE book_id = 1 AND available_copies > 0;",
                purpose: "Modifies column values of existing rows matching a condition."
              },
              {
                title: "10. DELETE Statement",
                query: "DELETE FROM students WHERE student_id = 5;",
                purpose: "Removes a specific student row from the database."
              },
              {
                title: "11. CREATE TABLE (DDL)",
                query: "CREATE TABLE borrowings (\n    borrow_id INT AUTO_INCREMENT PRIMARY KEY,\n    student_id INT NOT NULL,\n    book_id INT NOT NULL,\n    borrow_date DATE NOT NULL,\n    status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',\n    FOREIGN KEY (student_id) REFERENCES students(student_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id)\n);",
                purpose: "Creates a new relational table with primary and foreign key constraints."
              },
              {
                title: "12. ALTER TABLE (DDL)",
                query: "ALTER TABLE students ADD COLUMN phone VARCHAR(15) NULL;",
                purpose: "Modifies the structural definition of an existing table by adding a column."
              },
              {
                title: "13. DROP TABLE (DDL)",
                query: "DROP TABLE IF EXISTS borrowings;\nDROP TABLE IF EXISTS books;\nDROP TABLE IF EXISTS students;",
                purpose: "Deletes table schemas and data in reverse foreign-key dependency order."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="font-bold text-white text-sm mb-1">{item.title}</div>
                <div className="text-xs text-slate-400 mb-2">{item.purpose}</div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 font-mono text-xs text-amber-300 whitespace-pre-wrap">
                  {item.query}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: JDBC WORKFLOW */}
      {activeSection === 'workflow' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              3. JDBC Standard Workflow (7 Steps)
            </h3>
            <p className="text-sm text-slate-400">
              The fundamental 7 steps required to connect Java to MySQL database, execute queries, process results, and release database resources.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "Step 1",
                title: "Import java.sql.* Package",
                code: `import java.sql.Connection;\nimport java.sql.DriverManager;\nimport java.sql.Statement;\nimport java.sql.PreparedStatement;\nimport java.sql.ResultSet;\nimport java.sql.SQLException;`,
                explanation: "Brings JDBC core classes and interfaces into Java scope."
              },
              {
                step: "Step 2",
                title: "Load and Register the JDBC Driver",
                code: `Class.forName("com.mysql.cj.jdbc.Driver");`,
                explanation: "Dynamically loads the MySQL connector class into JVM memory and registers it with the DriverManager."
              },
              {
                step: "Step 3",
                title: "Establish Connection via DriverManager",
                code: `String url = "jdbc:mysql://localhost:3306/library_db";\nString user = "root";\nString password = "password";\nConnection conn = DriverManager.getConnection(url, user, password);`,
                explanation: "DriverManager locates a matching driver and opens an active session with the MySQL database."
              },
              {
                step: "Step 4",
                title: "Create Statement or PreparedStatement",
                code: `// For static queries:\nStatement stmt = conn.createStatement();\n\n// For parameterized queries (prevents SQL injection):\nString sql = "INSERT INTO students (name, email, department) VALUES (?, ?, ?)";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "Aarav");\npstmt.setString(2, "aarav@srmist.edu.in");\npstmt.setString(3, "Computer Science");`,
                explanation: "Statement/PreparedStatement interfaces are used to send SQL statements to the database."
              },
              {
                step: "Step 5",
                title: "Execute the Query or Update",
                code: `// For SELECT queries (DQL):\nResultSet rs = stmt.executeQuery("SELECT * FROM students");\n\n// For INSERT, UPDATE, DELETE (DML) or CREATE, ALTER (DDL):\nint rowsAffected = pstmt.executeUpdate();`,
                explanation: "executeQuery() returns a ResultSet table cursor; executeUpdate() executes write operations returning an integer count."
              },
              {
                step: "Step 6",
                title: "Process the ResultSet Cursor",
                code: `while (rs.next()) {\n    int id = rs.getInt("student_id");\n    String name = rs.getString("name");\n    String dept = rs.getString("department");\n    System.out.println(id + " | " + name + " | " + dept);\n}`,
                explanation: "rs.next() advances the cursor to the next row. Typed getter methods (getInt, getString, getDate) extract column data."
              },
              {
                step: "Step 7",
                title: "Close Resources to Prevent Memory Leaks",
                code: `// Using Try-With-Resources (AutoCloseable):\ntry (Connection conn = DatabaseConnection.getConnection();\n     Statement stmt = conn.createStatement();\n     ResultSet rs = stmt.executeQuery(sql)) {\n    // process data\n} // conn, stmt, and rs automatically closed here!`,
                explanation: "Always close ResultSet, Statement, and Connection objects to release database socket connections."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {item.step}
                  </span>
                  <span className="font-bold text-white text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{item.explanation}</p>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-xs text-blue-300 whitespace-pre-wrap">
                  {item.code}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: UNIT-III TOPIC MAPPING */}
      {activeSection === 'mapping' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-emerald-400" />
              4. Where Every Unit-III Topic is Demonstrated
            </h3>
            <p className="text-sm text-slate-400">
              Verification checklist mapping every syllabus item to the exact Java classes, SQL scripts, and user interface features.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Unit-3 Topic</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Demonstrated In</th>
                    <th className="px-4 py-3">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {UNIT_3_SYLLABUS_MAPPING.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-bold text-white font-mono">{m.topic}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-mono">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-blue-400">{m.demonstratedIn}</td>
                      <td className="px-4 py-2.5 text-slate-400">{m.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: 10 VIVA QUESTIONS & ANSWERS */}
      {activeSection === 'viva' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              5. 10 Viva Questions with Model Answers
            </h3>
            <p className="text-sm text-slate-400">
              Exam and viva voce preparation questions with precise technical explanations covering SQL &amp; JDBC.
            </p>
          </div>

          <div className="space-y-3">
            {VIVA_QUESTIONS.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="font-semibold text-white text-sm mb-2 text-purple-300">
                  {item.q}
                </div>
                <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800/80 leading-relaxed whitespace-pre-line">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
