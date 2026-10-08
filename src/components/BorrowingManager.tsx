import React, { useState } from 'react';
import { Student, Book, Borrowing, BorrowingDetail } from '../types';
import { BookCheck, Calendar, ArrowRightLeft, Terminal, Code2, CheckCircle2, AlertCircle } from 'lucide-react';

interface BorrowingManagerProps {
  students: Student[];
  books: Book[];
  borrowings: Borrowing[];
  onBorrowBook: (studentId: number, bookId: number, date: string) => boolean;
  onReturnBook: (borrowId: number) => void;
}

export const BorrowingManager: React.FC<BorrowingManagerProps> = ({
  students,
  books,
  borrowings,
  onBorrowBook,
  onReturnBook,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.student_id || 1);
  const [selectedBookId, setSelectedBookId] = useState<number>(books[0]?.book_id || 1);
  const [borrowDate, setBorrowDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [lastTrace, setLastTrace] = useState<{
    action: string;
    sql: string;
    jdbc: string;
  }>({
    action: 'SELECT with 3-Table JOIN (View Borrowing Records)',
    sql: `SELECT b.borrow_id, s.student_id, s.name AS student_name, s.department, \n       bk.book_id, bk.title AS book_title, bk.author, b.borrow_date, b.status \nFROM borrowings b \nJOIN students s ON b.student_id = s.student_id \nJOIN books bk ON b.book_id = bk.book_id \nORDER BY b.borrow_id DESC;`,
    jdbc: `Connection conn = DatabaseConnection.getConnection();\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery(sql);\nwhile (rs.next()) {\n  int borrowId = rs.getInt("borrow_id");\n  String studentName = rs.getString("student_name");\n  String bookTitle = rs.getString("book_title");\n  // process row...\n}`
  });

  // Calculate joined records for display
  const joinedRecords: BorrowingDetail[] = borrowings.map((b) => {
    const student = students.find((s) => s.student_id === b.student_id);
    const book = books.find((bk) => bk.book_id === b.book_id);
    return {
      borrow_id: b.borrow_id,
      student_id: b.student_id,
      student_name: student ? student.name : `Student #${b.student_id}`,
      department: student ? student.department : 'Unknown',
      book_id: b.book_id,
      book_title: book ? book.title : `Book #${b.book_id}`,
      author: book ? book.author : 'Unknown',
      borrow_date: b.borrow_date,
      status: b.status,
    };
  }).reverse();

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBook = books.find((b) => b.book_id === selectedBookId);
    if (!targetBook || targetBook.available_copies <= 0) {
      setStatusMessage({
        type: 'error',
        text: `Cannot borrow: "${targetBook?.title || 'Selected book'}" has 0 available copies.`
      });
      return;
    }

    const ok = onBorrowBook(selectedStudentId, selectedBookId, borrowDate);
    if (ok) {
      const student = students.find(s => s.student_id === selectedStudentId);
      setStatusMessage({
        type: 'success',
        text: `Book successfully issued to ${student?.name}!`
      });

      setLastTrace({
        action: 'TRANSACTION (INSERT borrowing + UPDATE books copies)',
        sql: `-- Transaction Block:\nconn.setAutoCommit(false);\nUPDATE books SET available_copies = available_copies - 1 WHERE book_id = ${selectedBookId};\nINSERT INTO borrowings (student_id, book_id, borrow_date, status) \nVALUES (${selectedStudentId}, ${selectedBookId}, '${borrowDate}', 'BORROWED');\nconn.commit();`,
        jdbc: `conn.setAutoCommit(false);\nPreparedStatement updateStmt = conn.prepareStatement("UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?");\nupdateStmt.setInt(1, ${selectedBookId});\nupdateStmt.executeUpdate();\n\nPreparedStatement insertStmt = conn.prepareStatement("INSERT INTO borrowings (student_id, book_id, borrow_date, status) VALUES (?, ?, ?, 'BORROWED')");\ninsertStmt.setInt(1, ${selectedStudentId});\ninsertStmt.setInt(2, ${selectedBookId});\ninsertStmt.setDate(3, Date.valueOf("${borrowDate}"));\ninsertStmt.executeUpdate();\nconn.commit();`
      });
    }
  };

  const handleReturn = (borrowId: number) => {
    onReturnBook(borrowId);
    setStatusMessage({
      type: 'success',
      text: `Borrowing #${borrowId} marked as RETURNED and book inventory restored.`
    });

    setLastTrace({
      action: `UPDATE (Return book for borrowing #${borrowId})`,
      sql: `UPDATE borrowings SET status = 'RETURNED' WHERE borrow_id = ${borrowId};\nUPDATE books SET available_copies = available_copies + 1 WHERE book_id = (SELECT book_id FROM borrowings WHERE borrow_id = ${borrowId});`,
      jdbc: `conn.setAutoCommit(false);\nPreparedStatement ps1 = conn.prepareStatement("UPDATE borrowings SET status = 'RETURNED' WHERE borrow_id = ?");\nps1.setInt(1, ${borrowId});\nps1.executeUpdate();\n// increment inventory\nconn.commit();`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
            Table: borrowings (Foreign Keys: student_id, book_id)
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Borrowing Operations & Relational JOIN</h2>
          <p className="text-sm text-slate-400">
            Demonstrates <strong>Borrow book</strong> (INSERT & UPDATE transaction) and <strong>View borrowing records</strong> (3-Table SQL JOIN across borrowings, students, and books).
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-2 rounded border border-slate-800">
          Java Class: <span className="text-amber-400">BorrowingDAO.java</span>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs underline text-slate-400 hover:text-white ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Issue Form + Records Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Borrow Book Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <BookCheck className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Borrow Book</h3>
          </div>

          <form onSubmit={handleBorrow} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Student (FOREIGN KEY: student_id)
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    #{s.student_id} - {s.name} ({s.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Book (FOREIGN KEY: book_id)
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {books.map((b) => (
                  <option key={b.book_id} value={b.book_id} disabled={b.available_copies <= 0}>
                    #{b.book_id} - {b.title} ({b.available_copies} available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Borrow Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <BookCheck className="w-4 h-4" />
              Execute BorrowingDAO.borrowBook()
            </button>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Transaction Workflow:</p>
              <p>1. Decrements book copies in <code>books</code> table.</p>
              <p>2. Inserts borrow record with foreign keys into <code>borrowings</code>.</p>
              <p>3. Calls <code>conn.commit()</code> to guarantee ACID consistency.</p>
            </div>
          </form>
        </div>

        {/* View Borrowing Records Table (JOIN) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-white">View Borrowing Records (SQL JOIN)</h3>
              <p className="text-xs text-slate-400">Total records: {joinedRecords.length}</p>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-800/60 px-2 py-1 rounded">
              SELECT ... FROM borrowings JOIN students JOIN books
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Borrow ID</th>
                  <th className="px-3 py-2.5">Student</th>
                  <th className="px-3 py-2.5">Book Title</th>
                  <th className="px-3 py-2.5">Borrow Date</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {joinedRecords.map((r) => (
                  <tr key={r.borrow_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-purple-400 font-semibold">
                      #{r.borrow_id}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-white">{r.student_name}</div>
                      <div className="text-xs text-slate-400">{r.department}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-200">{r.book_title}</div>
                      <div className="text-xs text-slate-400">by {r.author}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-mono text-slate-300">
                      {r.borrow_date}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                          r.status === 'BORROWED'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {r.status === 'BORROWED' ? (
                        <button
                          onClick={() => handleReturn(r.borrow_id)}
                          className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700 px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title="Mark as returned and increment book copy"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          Return
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {joinedRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No borrowing records found. Issue a book using the form.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live JDBC Execution Trace Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
        <div className="flex items-center gap-2 mb-2 text-slate-400 font-sans font-medium text-sm">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Last Executed JDBC & SQL Trace ({lastTrace.action})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          <div className="bg-slate-900/90 p-3 rounded border border-slate-800">
            <div className="text-amber-400 font-bold mb-1 flex items-center gap-1.5 font-sans">
              <Code2 className="w-3.5 h-3.5" /> Executed SQL Query:
            </div>
            <pre className="text-slate-200 whitespace-pre-wrap">{lastTrace.sql}</pre>
          </div>
          <div className="bg-slate-900/90 p-3 rounded border border-slate-800">
            <div className="text-purple-400 font-bold mb-1 flex items-center gap-1.5 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" /> Java JDBC API Code:
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap">{lastTrace.jdbc}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
