import React, { useState } from 'react';
import { Student, Book, Borrowing } from './types';
import { INITIAL_STUDENTS, INITIAL_BOOKS, INITIAL_BORROWINGS } from './data/initialData';
import { StudentManager } from './components/StudentManager';
import { BookManager } from './components/BookManager';
import { BorrowingManager } from './components/BorrowingManager';
import { SqlWorkbench } from './components/SqlWorkbench';
import { JavaCodeViewer } from './components/JavaCodeViewer';
import { TutorialGuide } from './components/TutorialGuide';
import {
  Users,
  BookMarked,
  ArrowRightLeft,
  Terminal,
  FileCode,
  GraduationCap,
  RotateCcw,
  Database,
  Layers
} from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [borrowings, setBorrowings] = useState<Borrowing[]>(INITIAL_BORROWINGS);

  const [activeTab, setActiveTab] = useState<
    'students' | 'books' | 'borrowings' | 'sql' | 'code' | 'tutorial'
  >('students');

  // --- Student Operations ---
  const handleAddStudent = (newS: Omit<Student, 'student_id'>) => {
    const nextId = students.length > 0 ? Math.max(...students.map(s => s.student_id)) + 1 : 1;
    setStudents(prev => [...prev, { student_id: nextId, ...newS }]);
  };

  const handleUpdateStudent = (updated: Student) => {
    setStudents(prev => prev.map(s => s.student_id === updated.student_id ? updated : s));
  };

  const handleDeleteStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.student_id !== id));
    // Cascade delete on borrowings (ON DELETE CASCADE)
    setBorrowings(prev => prev.filter(b => b.student_id !== id));
  };

  // --- Book Operations ---
  const handleAddBook = (newB: Omit<Book, 'book_id'>) => {
    const nextId = books.length > 0 ? Math.max(...books.map(b => b.book_id)) + 1 : 1;
    setBooks(prev => [...prev, { book_id: nextId, ...newB }]);
  };

  const handleUpdateBook = (updated: Book) => {
    setBooks(prev => prev.map(b => b.book_id === updated.book_id ? updated : b));
  };

  const handleDeleteBook = (id: number) => {
    setBooks(prev => prev.filter(b => b.book_id !== id));
    // Cascade delete on borrowings (ON DELETE CASCADE)
    setBorrowings(prev => prev.filter(b => b.book_id !== id));
  };

  // --- Borrowing Operations ---
  const handleBorrowBook = (studentId: number, bookId: number, date: string): boolean => {
    const book = books.find(b => b.book_id === bookId);
    if (!book || book.available_copies <= 0) return false;

    // Decrement available copies in books table
    setBooks(prev =>
      prev.map(b => (b.book_id === bookId ? { ...b, available_copies: b.available_copies - 1 } : b))
    );

    // Insert into borrowings
    const nextId = borrowings.length > 0 ? Math.max(...borrowings.map(b => b.borrow_id)) + 1 : 1;
    setBorrowings(prev => [
      ...prev,
      {
        borrow_id: nextId,
        student_id: studentId,
        book_id: bookId,
        borrow_date: date,
        status: 'BORROWED'
      }
    ]);
    return true;
  };

  const handleReturnBook = (borrowId: number) => {
    const record = borrowings.find(b => b.borrow_id === borrowId);
    if (!record || record.status === 'RETURNED') return;

    // Update status to RETURNED
    setBorrowings(prev =>
      prev.map(b => (b.borrow_id === borrowId ? { ...b, status: 'RETURNED' } : b))
    );

    // Increment available copies back
    setBooks(prev =>
      prev.map(b => (b.book_id === record.book_id ? { ...b, available_copies: b.available_copies + 1 } : b))
    );
  };

  const handleResetDatabase = () => {
    if (confirm('Reset database to default seed records?')) {
      setStudents(INITIAL_STUDENTS);
      setBooks(INITIAL_BOOKS);
      setBorrowings(INITIAL_BORROWINGS);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Academic Navigation Bar */}
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
              </div>
              <p className="text-xs text-slate-400">
                Full Stack Web Development &bull; <span className="text-slate-300">UNIT 3: SQL and JDBC</span>
              </p>
            </div>
          </div>

          {/* Quick Stats & Reset Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              <span className="text-blue-400">{students.length} students</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-emerald-400">{books.length} books</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-purple-400">{borrowings.length} borrowings</span>
            </div>

            <button
              onClick={handleResetDatabase}
              title="Reset all 3 tables to initial seed records"
              className="text-xs flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset DB</span>
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
              onClick={() => setActiveTab('sql')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sql'
                  ? 'border-amber-500 text-white bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-400" />
              SQL Workbench (All Topics)
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
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {activeTab === 'students' && (
          <StudentManager
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {activeTab === 'books' && (
          <BookManager
            books={books}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
          />
        )}

        {activeTab === 'borrowings' && (
          <BorrowingManager
            students={students}
            books={books}
            borrowings={borrowings}
            onBorrowBook={handleBorrowBook}
            onReturnBook={handleReturnBook}
          />
        )}

        {activeTab === 'sql' && (
          <SqlWorkbench
            students={students}
            books={books}
            borrowings={borrowings}
          />
        )}

        {activeTab === 'code' && <JavaCodeViewer />}

        {activeTab === 'tutorial' && <TutorialGuide />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          Full Stack Web Development &bull; Tutorial 3: Simple Library Database System &bull; Technology: HTML, CSS, Java, JDBC, MySQL
        </p>
      </footer>
    </div>
  );
}
