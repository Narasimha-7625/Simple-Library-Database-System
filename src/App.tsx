import React, { useState, useEffect, useCallback } from 'react';
import { Student, Book, BorrowingDetail, DbHealth } from './types';
import { INITIAL_STUDENTS, INITIAL_BOOKS, INITIAL_BORROWINGS } from './data/initialData';
import { api } from './api';
import { StudentManager } from './components/StudentManager';
import { BookManager } from './components/BookManager';
import { BorrowingManager } from './components/BorrowingManager';
import { JavaCodeViewer } from './components/JavaCodeViewer';
import { TutorialGuide } from './components/TutorialGuide';
import {
  Users,
  BookMarked,
  ArrowRightLeft,
  FileCode,
  GraduationCap,
  Database,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingDetail[]>([]);

  const [dbHealth, setDbHealth] = useState<DbHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'students' | 'books' | 'borrowings' | 'code' | 'tutorial'
  >('students');

  // Initial demo data fallback for when MySQL is offline
  const initialJoinedBorrowings: BorrowingDetail[] = INITIAL_BORROWINGS.map((b) => {
    const student = INITIAL_STUDENTS.find((s) => s.student_id === b.student_id);
    const book = INITIAL_BOOKS.find((bk) => bk.book_id === b.book_id);
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
  });

  // Load data directly from MySQL (MySQL Workbench database)
  const loadDatabaseData = useCallback(async () => {
    setLoading(true);
    try {
      const health = await api.getHealth();
      setDbHealth(health);

      if (health.status === 'connected') {
        const [studentsData, booksData, borrowingsData] = await Promise.all([
          api.getStudents().catch(() => null),
          api.getBooks().catch(() => null),
          api.getBorrowings().catch(() => null),
        ]);

        if (studentsData !== null) setStudents(studentsData);
        if (booksData !== null) setBooks(booksData);
        if (borrowingsData !== null) setBorrowings(borrowingsData);
      } else {
        // Fallback to initial seed records if MySQL server is not started yet
        setStudents(INITIAL_STUDENTS);
        setBooks(INITIAL_BOOKS);
        setBorrowings(initialJoinedBorrowings);
      }
    } catch (err: any) {
      console.warn('Backend connection note:', err?.message || err);
      setStudents(INITIAL_STUDENTS);
      setBooks(INITIAL_BOOKS);
      setBorrowings(initialJoinedBorrowings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // --- Student Operations (Persisted in MySQL) ---
  const handleAddStudent = async (newS: Omit<Student, 'student_id'>) => {
    try {
      const created = await api.addStudent(newS);
      setStudents((prev) => [...prev, created]);
      setStatusNotification({
        type: 'success',
        text: `Student "${created.name}" saved to MySQL (visible in MySQL Workbench).`,
      });
    } catch (err: any) {
      // If MySQL is offline, record locally and inform user
      const nextId = students.length > 0 ? Math.max(...students.map((s) => s.student_id)) + 1 : 1;
      const created = { student_id: nextId, ...newS };
      setStudents((prev) => [...prev, created]);
      setStatusNotification({
        type: 'info',
        text: `Saved locally. Connect MySQL to store permanently in MySQL Workbench.`,
      });
    }
  };

  const handleUpdateStudent = async (updated: Student) => {
    try {
      const saved = await api.updateStudent(updated);
      setStudents((prev) => prev.map((s) => (s.student_id === saved.student_id ? saved : s)));
      setStatusNotification({
        type: 'success',
        text: `Student #${saved.student_id} updated in MySQL Workbench.`,
      });
    } catch (err: any) {
      setStudents((prev) => prev.map((s) => (s.student_id === updated.student_id ? updated : s)));
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      await api.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.student_id !== id));
      setBorrowings((prev) => prev.filter((b) => b.student_id !== id));
      setStatusNotification({
        type: 'success',
        text: `Student #${id} deleted from MySQL Workbench.`,
      });
    } catch (err: any) {
      setStudents((prev) => prev.filter((s) => s.student_id !== id));
      setBorrowings((prev) => prev.filter((b) => b.student_id !== id));
    }
  };

  // --- Book Operations (Persisted in MySQL) ---
  const handleAddBook = async (newB: Omit<Book, 'book_id'>) => {
    try {
      const created = await api.addBook(newB);
      setBooks((prev) => [...prev, created]);
      setStatusNotification({
        type: 'success',
        text: `Book "${created.title}" saved to MySQL Workbench database.`,
      });
    } catch (err: any) {
      const nextId = books.length > 0 ? Math.max(...books.map((b) => b.book_id)) + 1 : 1;
      const created = { book_id: nextId, ...newB };
      setBooks((prev) => [...prev, created]);
      setStatusNotification({
        type: 'info',
        text: `Saved locally. Connect MySQL to persist in MySQL Workbench.`,
      });
    }
  };

  const handleUpdateBook = async (updated: Book) => {
    try {
      const saved = await api.updateBook(updated);
      setBooks((prev) => prev.map((b) => (b.book_id === saved.book_id ? saved : b)));
      setStatusNotification({
        type: 'success',
        text: `Book #${saved.book_id} updated in MySQL Workbench.`,
      });
    } catch (err: any) {
      setBooks((prev) => prev.map((b) => (b.book_id === updated.book_id ? updated : b)));
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await api.deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.book_id !== id));
      setBorrowings((prev) => prev.filter((b) => b.book_id !== id));
      setStatusNotification({
        type: 'success',
        text: `Book #${id} deleted from MySQL Workbench.`,
      });
    } catch (err: any) {
      setBooks((prev) => prev.filter((b) => b.book_id !== id));
      setBorrowings((prev) => prev.filter((b) => b.book_id !== id));
    }
  };

  // --- Borrowing Operations (Persisted in MySQL with ACID Transactions) ---
  const handleBorrowBook = async (studentId: number, bookId: number, date: string) => {
    try {
      const newRecord = await api.borrowBook(studentId, bookId, date);
      const updatedBooks = await api.getBooks();
      setBooks(updatedBooks);
      setBorrowings((prev) => [newRecord, ...prev]);
      setStatusNotification({
        type: 'success',
        text: `Borrowing #${newRecord.borrow_id} stored in MySQL Workbench (inventory updated).`,
      });
    } catch (err: any) {
      const book = books.find((b) => b.book_id === bookId);
      if (!book || book.available_copies <= 0) {
        throw new Error('No available copies left.');
      }
      setBooks((prev) =>
        prev.map((b) => (b.book_id === bookId ? { ...b, available_copies: b.available_copies - 1 } : b))
      );
      const student = students.find((s) => s.student_id === studentId);
      const nextId = borrowings.length > 0 ? Math.max(...borrowings.map((b) => b.borrow_id)) + 1 : 1;
      const newRecord: BorrowingDetail = {
        borrow_id: nextId,
        student_id: studentId,
        student_name: student?.name || `Student #${studentId}`,
        department: student?.department || 'General',
        book_id: bookId,
        book_title: book.title,
        author: book.author,
        borrow_date: date,
        status: 'BORROWED',
      };
      setBorrowings((prev) => [newRecord, ...prev]);
    }
  };

  const handleReturnBook = async (borrowId: number) => {
    try {
      const updated = await api.returnBorrowing(borrowId);
      setBorrowings((prev) => prev.map((b) => (b.borrow_id === borrowId ? updated : b)));
      const updatedBooks = await api.getBooks();
      setBooks(updatedBooks);
      setStatusNotification({
        type: 'success',
        text: `Borrowing #${borrowId} returned in MySQL Workbench (copy restored).`,
      });
    } catch (err: any) {
      const record = borrowings.find((b) => b.borrow_id === borrowId);
      if (!record || record.status === 'RETURNED') return;
      setBorrowings((prev) =>
        prev.map((b) => (b.borrow_id === borrowId ? { ...b, status: 'RETURNED' } : b))
      );
      setBooks((prev) =>
        prev.map((b) => (b.book_id === record.book_id ? { ...b, available_copies: b.available_copies + 1 } : b))
      );
    }
  };

  const handleDeleteBorrowing = async (borrowId: number) => {
    try {
      await api.deleteBorrowing(borrowId);
      setBorrowings((prev) => prev.filter((b) => b.borrow_id !== borrowId));
      const updatedBooks = await api.getBooks();
      setBooks(updatedBooks);
      setStatusNotification({
        type: 'success',
        text: `Borrowing record #${borrowId} removed from MySQL Workbench.`,
      });
    } catch (err: any) {
      setBorrowings((prev) => prev.filter((b) => b.borrow_id !== borrowId));
    }
  };

  const isConnected = dbHealth?.status === 'connected';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Simple Library Database System
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/40">
                  Tutorial 3
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  MySQL Workbench Database: librarydatabase
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full Stack Web Development &bull; <span className="text-slate-300">UNIT 3: SQL and JDBC &bull; MySQL Backend</span>
              </p>
            </div>
          </div>

          {/* Counts & Refresh */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-blue-400 font-semibold">{students.length} students</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-emerald-400 font-semibold">{books.length} books</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-purple-400 font-semibold">{borrowings.length} borrowings</span>
            </div>

            <button
              onClick={loadDatabaseData}
              disabled={loading}
              title="Sync / Refresh data with MySQL Workbench"
              className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 border-t border-slate-800/80 pt-1">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'students'
                  ? 'border-blue-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              Students Table (CRUD)
            </button>

            <button
              onClick={() => setActiveTab('books')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'books'
                  ? 'border-emerald-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookMarked className="w-4 h-4 text-emerald-400" />
              Books Table (CRUD)
            </button>

            <button
              onClick={() => setActiveTab('borrowings')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'borrowings'
                  ? 'border-purple-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-purple-400" />
              Borrowing &amp; JOINs
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'code'
                  ? 'border-cyan-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4 text-cyan-400" />
              Java &amp; JDBC Code (DAOs)
            </button>

            <button
              onClick={() => setActiveTab('tutorial')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tutorial'
                  ? 'border-rose-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-rose-400" />
              Tutorial 3 Guide &amp; Viva
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-5">
        {/* Toast Notification */}
        {statusNotification && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
              statusNotification.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : statusNotification.type === 'error'
                ? 'bg-red-950/60 border-red-800 text-red-300'
                : 'bg-blue-950/60 border-blue-800 text-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0" />
              )}
              <span>{statusNotification.text}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-slate-400 hover:text-white underline ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'students' && (
          <StudentManager
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            isLoading={loading}
          />
        )}

        {activeTab === 'books' && (
          <BookManager
            books={books}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
            isLoading={loading}
          />
        )}

        {activeTab === 'borrowings' && (
          <BorrowingManager
            students={students}
            books={books}
            borrowings={borrowings}
            onBorrowBook={handleBorrowBook}
            onReturnBook={handleReturnBook}
            onDeleteBorrowing={handleDeleteBorrowing}
            isLoading={loading}
          />
        )}

        {activeTab === 'code' && <JavaCodeViewer />}

        {activeTab === 'tutorial' && <TutorialGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          Full Stack Web Development &bull; Tutorial 3: Simple Library Database System &bull; Database: MySQL Workbench (<code className="text-slate-400">librarydatabase</code>)
        </p>
      </footer>
    </div>
  );
}
