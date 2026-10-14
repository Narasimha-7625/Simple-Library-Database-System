import React, { useState } from 'react';
import { Student, Book, Borrowing, BorrowingDetail, QueryExecutionResult } from '../types';
import { Play, RotateCcw, Check, Database, Sparkles, Terminal, Code2 } from 'lucide-react';

interface SqlWorkbenchProps {
  students: Student[];
  books: Book[];
  borrowings: (Borrowing | BorrowingDetail)[];
  onExecuteCustomAction?: (type: string) => void;
}

interface SqlPreset {
  id: string;
  name: string;
  category: string;
  sql: string;
  description: string;
  type: 'DQL' | 'DML' | 'DDL';
  run: (students: Student[], books: Book[], borrowings: (Borrowing | BorrowingDetail)[]) => QueryExecutionResult;
}

export const SqlWorkbench: React.FC<SqlWorkbenchProps> = ({
  students,
  books,
  borrowings,
}) => {
  // Define comprehensive SQL presets covering all Unit 3 topics
  const presets: SqlPreset[] = [
    {
      id: 'select_basics',
      name: 'SQL Basics: SELECT All Columns',
      category: 'SQL Basics',
      type: 'DQL',
      sql: `SELECT student_id, name, email, department, phone FROM students;`,
      description: 'Demonstrates basic SELECT query fetching columns from the students table.',
      run: (st) => ({
        sql: `SELECT student_id, name, email, department, phone FROM students;`,
        topic: 'SQL Basics & SELECT',
        type: 'DQL',
        message: `Query OK, ${st.length} rows in set.`,
        columns: ['student_id', 'name', 'email', 'department', 'phone'],
        data: st.map(s => ({
          student_id: s.student_id,
          name: s.name,
          email: s.email,
          department: s.department,
          phone: s.phone || 'NULL'
        })),
        jdbcSnippet: `// 1. Establish connection & create Statement\nConnection conn = DatabaseConnection.getConnection();\nStatement stmt = conn.createStatement();\n\n// 2. Execute query returning ResultSet\nString sql = "SELECT student_id, name, email, department, phone FROM students";\nResultSet rs = stmt.executeQuery(sql);\n\n// 3. Process records with cursor\nwhile (rs.next()) {\n    int id = rs.getInt("student_id");\n    String name = rs.getString("name");\n    System.out.println(id + ": " + name);\n}`
      })
    },
    {
      id: 'where_clause',
      name: 'WHERE Clause: Filtering',
      category: 'Filtering',
      type: 'DQL',
      sql: `SELECT student_id, name, email, department \nFROM students \nWHERE department = 'Computer Science';`,
      description: 'Filters rows in the students table using the WHERE conditional clause.',
      run: (st) => {
        const filtered = st.filter(s => s.department === 'Computer Science');
        return {
          sql: `SELECT student_id, name, email, department FROM students WHERE department = 'Computer Science';`,
          topic: 'WHERE Clause',
          type: 'DQL',
          message: `Query OK, ${filtered.length} rows returned with department = 'Computer Science'.`,
          columns: ['student_id', 'name', 'email', 'department'],
          data: filtered.map(s => ({
            student_id: s.student_id,
            name: s.name,
            email: s.email,
            department: s.department
          })),
          jdbcSnippet: `String sql = "SELECT student_id, name, email, department FROM students WHERE department = ?";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "Computer Science");\nResultSet rs = pstmt.executeQuery();\nwhile (rs.next()) {\n    System.out.println(rs.getInt(1) + " | " + rs.getString(2));\n}`
        };
      }
    },
    {
      id: 'join_clause',
      name: 'JOIN: 3-Table INNER JOIN',
      category: 'Relational Joins',
      type: 'DQL',
      sql: `SELECT \n    b.borrow_id,\n    s.name AS student_name,\n    s.department,\n    bk.title AS book_title,\n    bk.author,\n    b.borrow_date,\n    b.status\nFROM borrowings b\nJOIN students s ON b.student_id = s.student_id\nJOIN books bk ON b.book_id = bk.book_id;`,
      description: 'Combines records across borrowings, students, and books matching primary and foreign keys.',
      run: (st, bk, br) => {
        const joined = br.map(b => {
          const student = st.find(s => s.student_id === b.student_id);
          const book = bk.find(k => k.book_id === b.book_id);
          return {
            borrow_id: b.borrow_id,
            student_name: student ? student.name : `Student #${b.student_id}`,
            department: student ? student.department : 'N/A',
            book_title: book ? book.title : `Book #${b.book_id}`,
            author: book ? book.author : 'N/A',
            borrow_date: b.borrow_date,
            status: b.status
          };
        });
        return {
          sql: `SELECT b.borrow_id, s.name AS student_name, s.department, bk.title AS book_title, bk.author, b.borrow_date, b.status FROM borrowings b JOIN students s ON b.student_id = s.student_id JOIN books bk ON b.book_id = bk.book_id;`,
          topic: 'SQL JOIN (INNER JOIN)',
          type: 'DQL',
          message: `Query OK, ${joined.length} rows returned across 3 joined tables.`,
          columns: ['borrow_id', 'student_name', 'department', 'book_title', 'author', 'borrow_date', 'status'],
          data: joined,
          jdbcSnippet: `String joinSql = "SELECT b.borrow_id, s.name, s.department, bk.title, bk.author, b.borrow_date, b.status " +\n                 "FROM borrowings b " +\n                 "JOIN students s ON b.student_id = s.student_id " +\n                 "JOIN books bk ON b.book_id = bk.book_id";\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery(joinSql);\nwhile (rs.next()) {\n    System.out.println("Borrow #" + rs.getInt("borrow_id") + " for " + rs.getString("name"));\n}`
        };
      }
    },
    {
      id: 'union_operator',
      name: 'UNION: Distinct Departments & Categories',
      category: 'Set Operators',
      type: 'DQL',
      sql: `SELECT department AS classification, 'Student Department' AS source_table FROM students\nUNION\nSELECT category AS classification, 'Book Category' AS source_table FROM books;`,
      description: 'Combines unique department and book category values eliminating duplicates.',
      run: (st, bk) => {
        const studentDepts = Array.from(new Set(st.map(s => s.department)));
        const bookCats = Array.from(new Set(bk.map(b => b.category)));
        const unionSet = Array.from(new Set([...studentDepts, ...bookCats]));
        const data = unionSet.map(val => {
          const inStudents = studentDepts.includes(val);
          const inBooks = bookCats.includes(val);
          let source = '';
          if (inStudents && inBooks) source = 'Both (Students & Books)';
          else if (inStudents) source = 'Students Table';
          else source = 'Books Table';
          return { classification: val, source_table: source };
        });

        return {
          sql: `SELECT department AS classification FROM students UNION SELECT category FROM books;`,
          topic: 'UNION Set Operator',
          type: 'DQL',
          message: `Query OK, ${data.length} distinct union rows returned.`,
          columns: ['classification', 'source_table'],
          data,
          jdbcSnippet: `String unionSql = "SELECT department AS classification FROM students UNION SELECT category FROM books";\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery(unionSql);\nwhile (rs.next()) {\n    System.out.println(rs.getString("classification"));\n}`
        };
      }
    },
    {
      id: 'intersect_operator',
      name: 'INTERSECT: Matching Departments & Categories',
      category: 'Set Operators',
      type: 'DQL',
      sql: `-- SQL Standard / MySQL 8.0+:\nSELECT department FROM students\nINTERSECT\nSELECT category FROM books;\n\n-- MySQL Pre-8.0 Equivalent:\nSELECT DISTINCT department \nFROM students \nWHERE department IN (SELECT category FROM books);`,
      description: 'Finds values that exist in BOTH student departments AND book categories.',
      run: (st, bk) => {
        const studentDepts = new Set(st.map(s => s.department));
        const bookCats = new Set(bk.map(b => b.category));
        const intersected = Array.from(studentDepts).filter(dept => bookCats.has(dept));

        return {
          sql: `SELECT department FROM students INTERSECT SELECT category FROM books;`,
          topic: 'INTERSECT Set Operator',
          type: 'DQL',
          message: `Query OK, ${intersected.length} common intersection rows found.`,
          columns: ['department', 'exists_in_both'],
          data: intersected.map(d => ({ department: d, exists_in_both: 'YES (Both in students & books)' })),
          jdbcSnippet: `// MySQL 8.0+ supports INTERSECT keyword:\nString sql = "SELECT department FROM students INTERSECT SELECT category FROM books";\n// Or cross-version compatible query:\n// String sql = "SELECT DISTINCT department FROM students WHERE department IN (SELECT category FROM books)";\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery(sql);\nwhile (rs.next()) {\n    System.out.println("Common domain: " + rs.getString(1));\n}`
        };
      }
    },
    {
      id: 'except_operator',
      name: 'EXCEPT (MINUS): Departments Without Book Match',
      category: 'Set Operators',
      type: 'DQL',
      sql: `-- SQL Standard / MySQL 8.0+:\nSELECT department FROM students\nEXCEPT\nSELECT category FROM books;\n\n-- Compatible Subquery Equivalent:\nSELECT DISTINCT department \nFROM students \nWHERE department NOT IN (SELECT category FROM books);`,
      description: 'Returns departments present in students but NOT present as a book category.',
      run: (st, bk) => {
        const studentDepts = Array.from(new Set(st.map(s => s.department)));
        const bookCats = new Set(bk.map(b => b.category));
        const exceptList = studentDepts.filter(dept => !bookCats.has(dept));

        return {
          sql: `SELECT department FROM students EXCEPT SELECT category FROM books;`,
          topic: 'EXCEPT (Set Difference) Operator',
          type: 'DQL',
          message: `Query OK, ${exceptList.length} rows in students EXCEPT books.`,
          columns: ['department', 'notes'],
          data: exceptList.map(d => ({
            department: d,
            notes: 'Exists in students table, but no book has this category'
          })),
          jdbcSnippet: `// MySQL 8.0+ supports EXCEPT (Oracle uses MINUS):\nString sql = "SELECT department FROM students EXCEPT SELECT category FROM books";\n// Compatible equivalent:\n// String sql = "SELECT DISTINCT department FROM students WHERE department NOT IN (SELECT category FROM books)";\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery(sql);\nwhile (rs.next()) {\n    System.out.println("Difference: " + rs.getString(1));\n}`
        };
      }
    },
    {
      id: 'subquery_demo',
      name: 'Subquery: Nested Query for Active Borrowers',
      category: 'Subqueries',
      type: 'DQL',
      sql: `SELECT student_id, name, email, department\nFROM students\nWHERE student_id IN (\n    SELECT DISTINCT student_id \n    FROM borrowings \n    WHERE status = 'BORROWED'\n);`,
      description: 'Demonstrates nested subquery evaluating students who currently have active borrowed books.',
      run: (st, _, br) => {
        const activeStudentIds = new Set(br.filter(b => b.status === 'BORROWED').map(b => b.student_id));
        const activeStudents = st.filter(s => activeStudentIds.has(s.student_id));

        return {
          sql: `SELECT student_id, name, email, department FROM students WHERE student_id IN (SELECT DISTINCT student_id FROM borrowings WHERE status = 'BORROWED');`,
          topic: 'Subquery (Nested SELECT)',
          type: 'DQL',
          message: `Query OK, ${activeStudents.length} active borrower students identified via subquery.`,
          columns: ['student_id', 'name', 'email', 'department'],
          data: activeStudents.map(s => ({
            student_id: s.student_id,
            name: s.name,
            email: s.email,
            department: s.department
          })),
          jdbcSnippet: `String subquerySql = "SELECT student_id, name, email, department FROM students " +\n                    "WHERE student_id IN (SELECT DISTINCT student_id FROM borrowings WHERE status = 'BORROWED')";\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery(subquerySql);\nwhile (rs.next()) {\n    System.out.println("Active borrower: " + rs.getString("name"));\n}`
        };
      }
    },
    {
      id: 'insert_demo',
      name: 'INSERT: Insert New Student Record',
      category: 'Data Manipulation (DML)',
      type: 'DML',
      sql: `INSERT INTO students (name, email, department, phone)\nVALUES ('Aditi Rao', 'aditi.rao@srmist.edu.in', 'Computer Science', '9876543220');`,
      description: 'Demonstrates SQL INSERT statement with column mapping.',
      run: () => ({
        sql: `INSERT INTO students (name, email, department, phone) VALUES ('Aditi Rao', 'aditi.rao@srmist.edu.in', 'Computer Science', '9876543220');`,
        topic: 'INSERT Statement (DML)',
        type: 'DML',
        affectedRows: 1,
        message: 'Query OK, 1 row affected (Inserted with auto-increment ID).',
        jdbcSnippet: `String sql = "INSERT INTO students (name, email, department, phone) VALUES (?, ?, ?, ?)";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "Aditi Rao");\npstmt.setString(2, "aditi.rao@srmist.edu.in");\npstmt.setString(3, "Computer Science");\npstmt.setString(4, "9876543220");\nint rows = pstmt.executeUpdate(); // returns 1`
      })
    },
    {
      id: 'update_demo',
      name: 'UPDATE: Modify Available Copies',
      category: 'Data Manipulation (DML)',
      type: 'DML',
      sql: `UPDATE books\nSET available_copies = available_copies + 1\nWHERE category = 'Computer Science';`,
      description: 'Demonstrates SQL UPDATE statement updating matching rows with arithmetic expression.',
      run: (st, bk) => {
        const count = bk.filter(b => b.category === 'Computer Science').length;
        return {
          sql: `UPDATE books SET available_copies = available_copies + 1 WHERE category = 'Computer Science';`,
          topic: 'UPDATE Statement (DML)',
          type: 'DML',
          affectedRows: count,
          message: `Query OK, ${count} rows affected (Computer Science books stock incremented).`,
          jdbcSnippet: `String sql = "UPDATE books SET available_copies = available_copies + 1 WHERE category = ?";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "Computer Science");\nint affectedRows = pstmt.executeUpdate();\nSystem.out.println("Rows updated: " + affectedRows);`
        };
      }
    },
    {
      id: 'delete_demo',
      name: 'DELETE: Remove Borrowing Records',
      category: 'Data Manipulation (DML)',
      type: 'DML',
      sql: `DELETE FROM borrowings\nWHERE status = 'RETURNED';`,
      description: 'Demonstrates SQL DELETE statement with WHERE condition.',
      run: (st, bk, br) => {
        const count = br.filter(b => b.status === 'RETURNED').length;
        return {
          sql: `DELETE FROM borrowings WHERE status = 'RETURNED';`,
          topic: 'DELETE Statement (DML)',
          type: 'DML',
          affectedRows: count,
          message: `Query OK, ${count} returned records deleted.`,
          jdbcSnippet: `String sql = "DELETE FROM borrowings WHERE status = ?";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "RETURNED");\nint rows = pstmt.executeUpdate();\nSystem.out.println("Archived rows deleted: " + rows);`
        };
      }
    },
    {
      id: 'create_table_demo',
      name: 'CREATE TABLE: Schema DDL',
      category: 'Data Definition (DDL)',
      type: 'DDL',
      sql: `CREATE TABLE IF NOT EXISTS library_audit (\n    audit_id INT AUTO_INCREMENT PRIMARY KEY,\n    action_type VARCHAR(50) NOT NULL,\n    record_id INT NOT NULL,\n    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);`,
      description: 'Demonstrates DDL CREATE TABLE statement with PRIMARY KEY and AUTO_INCREMENT.',
      run: () => ({
        sql: `CREATE TABLE IF NOT EXISTS library_audit (\n    audit_id INT AUTO_INCREMENT PRIMARY KEY,\n    action_type VARCHAR(50) NOT NULL,\n    record_id INT NOT NULL,\n    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);`,
        topic: 'CREATE TABLE (DDL)',
        type: 'DDL',
        message: 'Query OK, 0 rows affected (Table "library_audit" created successfully).',
        jdbcSnippet: `String ddl = "CREATE TABLE IF NOT EXISTS library_audit (" +\n             "audit_id INT AUTO_INCREMENT PRIMARY KEY, " +\n             "action_type VARCHAR(50) NOT NULL, " +\n             "record_id INT NOT NULL, " +\n             "timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";\nStatement stmt = conn.createStatement();\nint result = stmt.executeUpdate(ddl); // DDL returns 0`
      })
    },
    {
      id: 'alter_table_demo',
      name: 'ALTER TABLE: Modify Schema Structure',
      category: 'Data Definition (DDL)',
      type: 'DDL',
      sql: `ALTER TABLE students\nADD COLUMN phone VARCHAR(15) NULL;`,
      description: 'Demonstrates DDL ALTER TABLE adding a new column to an existing table.',
      run: () => ({
        sql: `ALTER TABLE students ADD COLUMN phone VARCHAR(15) NULL;`,
        topic: 'ALTER TABLE (DDL)',
        type: 'DDL',
        message: 'Query OK, 0 rows affected (Column "phone" added to "students" schema).',
        jdbcSnippet: `String alterSql = "ALTER TABLE students ADD COLUMN phone VARCHAR(15) NULL";\nStatement stmt = conn.createStatement();\nstmt.executeUpdate(alterSql); // returns 0`
      })
    },
    {
      id: 'drop_table_demo',
      name: 'DROP TABLE: Remove Table Schema',
      category: 'Data Definition (DDL)',
      type: 'DDL',
      sql: `DROP TABLE IF EXISTS library_audit;`,
      description: 'Demonstrates DDL DROP TABLE statement to remove a table definition.',
      run: () => ({
        sql: `DROP TABLE IF EXISTS library_audit;`,
        topic: 'DROP TABLE (DDL)',
        type: 'DDL',
        message: 'Query OK, 0 rows affected (Table "library_audit" dropped if existed).',
        jdbcSnippet: `String dropSql = "DROP TABLE IF EXISTS library_audit";\nStatement stmt = conn.createStatement();\nstmt.executeUpdate(dropSql); // returns 0`
      })
    }
  ];

  const [selectedPresetId, setSelectedPresetId] = useState<string>('select_basics');
  const [editorSql, setEditorSql] = useState<string>(presets[0].sql);
  const [currentResult, setCurrentResult] = useState<QueryExecutionResult>(
    presets[0].run(students, books, borrowings)
  );

  const handleSelectPreset = (p: SqlPreset) => {
    setSelectedPresetId(p.id);
    setEditorSql(p.sql);
    const res = p.run(students, books, borrowings);
    setCurrentResult(res);
  };

  const handleExecute = () => {
    // If the editor has the exact text of a preset or matches it
    const activePreset = presets.find(p => p.id === selectedPresetId);
    if (activePreset) {
      const res = activePreset.run(students, books, borrowings);
      // Overwrite SQL with what's in the editor
      setCurrentResult({
        ...res,
        sql: editorSql.trim()
      });
    } else {
      // Default fallback
      const fallback = presets[0].run(students, books, borrowings);
      setCurrentResult({
        ...fallback,
        sql: editorSql.trim()
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
            Unit 3: SQL Topics Demonstrator
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Interactive SQL Query Workbench</h2>
          <p className="text-sm text-slate-400">
            Test and verify all required Unit 3 SQL topics: SELECT, WHERE, JOIN, UNION, INTERSECT, EXCEPT, Subquery, INSERT, UPDATE, DELETE, CREATE/ALTER/DROP TABLE.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
            Total Topics: {presets.length}
          </span>
        </div>
      </div>

      {/* Preset Topics Pills */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Click any Unit 3 topic to load query & JDBC code:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => {
            const isSelected = p.id === selectedPresetId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{p.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                  p.type === 'DQL' ? 'bg-cyan-900/80 text-cyan-200' :
                  p.type === 'DML' ? 'bg-amber-900/80 text-amber-200' : 'bg-rose-900/80 text-rose-200'
                }`}>
                  {p.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">
              SQL Statement Editor &amp; Runner
            </h3>
            <span className="text-xs text-slate-500">
              ({presets.find(p => p.id === selectedPresetId)?.description})
            </span>
          </div>
          <button
            onClick={handleExecute}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Execute Query
          </button>
        </div>

        <div className="relative">
          <textarea
            value={editorSql}
            onChange={(e) => setEditorSql(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-sm text-amber-300 focus:outline-none focus:border-blue-500 selection:bg-blue-900"
          />
        </div>
      </div>

      {/* Query Execution Result & JDBC Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SQL Output Table / Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h4 className="font-semibold text-white text-sm">Query Execution Output</h4>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              {currentResult.type}
            </span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs font-mono text-slate-300 mb-3">
            {currentResult.message}
          </div>

          {currentResult.columns && currentResult.data && currentResult.data.length > 0 ? (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase sticky top-0 border-b border-slate-800">
                  <tr>
                    {currentResult.columns.map(col => (
                      <th key={col} className="px-3 py-2 font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {currentResult.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      {currentResult.columns!.map(col => (
                        <td key={col} className="px-3 py-2 whitespace-nowrap">
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-950/50 rounded-lg border border-slate-800/50">
              <Check className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-slate-200">Statement Executed Successfully</p>
              <p className="text-xs text-slate-400 mt-1">
                {currentResult.affectedRows !== undefined
                  ? `${currentResult.affectedRows} row(s) affected in database.`
                  : currentResult.message}
              </p>
            </div>
          )}
        </div>

        {/* Java JDBC Code for this operation */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <h4 className="font-semibold text-white text-sm">Corresponding Java JDBC Code</h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">java.sql.*</span>
          </div>

          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 flex-1 overflow-x-auto">
            <pre className="font-mono text-xs text-blue-300 whitespace-pre-wrap leading-relaxed">
              {currentResult.jdbcSnippet}
            </pre>
          </div>

          <div className="mt-3 p-3 bg-slate-950/60 rounded border border-slate-800/60 text-xs text-slate-400">
            <strong>JDBC Topic Illustrated:</strong>{' '}
            {currentResult.type === 'DQL'
              ? 'Statement.executeQuery() returns a ResultSet cursor navigated using rs.next().'
              : 'PreparedStatement.executeUpdate() performs write/schema changes and returns affected rows integer count.'}
          </div>
        </div>
      </div>
    </div>
  );
};
