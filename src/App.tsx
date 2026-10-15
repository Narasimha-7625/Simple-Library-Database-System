import React, { useState, useEffect, useCallback } from 'react';
import { Student, Book, BorrowingDetail, DbHealth } from './types';
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
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'students' | 'books' | 'borrowings' | 'code' | 'tutorial'
  >('students');

  const reportDatabaseError = (action: string, err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    setStatusNotification({ type: 'error', text: `${action} failed: ${message}` });
  };

  const loadDatabaseData = useCallback(async () => {
    setLoading(true);
    try {
      const health = await api.getHealth();
      setDbHealth(health);

      if (health.status !== 'connected') {
        setStudents([]);
        setBooks([]);
        setBorrowings([]);
        setStatusNotification({
          type: 'error',
          text: health.message || health.error || 'Could not connect to MySQL.',
        });
        return;
      }

      const [studentsData, booksData, borrowingsData] = await Promise.all([
        api.getStudents(),
        api.getBooks(),
        api.getBorrowings(),
      ]);
      setStudents(studentsData);
      setBooks(booksData);
      setBorrowings(borrowingsData);
      setStatusNotification(null);
    } catch (err) {
      reportDatabaseError('Loading MySQL data', err);
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
    } catch (err) {
      reportDatabaseError('Saving student to MySQL', err);
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
    } catch (err) {
      reportDatabaseError('Updating student in MySQL', err);
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
    } catch (err) {
      reportDatabaseError('Deleting student from MySQL', err);
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
    } catch (err) {
      reportDatabaseError('Saving book to MySQL', err);
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
    } catch (err) {
      reportDatabaseError('Updating book in MySQL', err);
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
    } catch (err) {
      reportDatabaseError('Deleting book from MySQL', err);
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
    } catch (err) {
      reportDatabaseError('Recording borrowing in MySQL', err);
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
    } catch (err) {
      reportDatabaseError('Returning book in MySQL', err);
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
    } catch (err) {
      reportDatabaseError('Deleting borrowing from MySQL', err);
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
                <AlertCircle className="w-4 h-4 shrink-0" />
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
