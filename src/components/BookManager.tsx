import React, { useState } from 'react';
import { Book } from '../types';
import { Plus, Pencil, Trash2, CheckCircle2, Terminal, Code2, BookOpen } from 'lucide-react';

interface BookManagerProps {
  books: Book[];
  onAddBook: (book: Omit<Book, 'book_id'>) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: number) => void;
}

export const BookManager: React.FC<BookManagerProps> = ({
  books,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [copies, setCopies] = useState<number>(3);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCopies, setEditCopies] = useState<number>(1);

  const [lastTrace, setLastTrace] = useState<{
    action: string;
    sql: string;
    jdbc: string;
  }>({
    action: 'SELECT (Initial load of books table)',
    sql: 'SELECT book_id, title, author, category, available_copies FROM books ORDER BY book_id ASC;',
    jdbc: `Connection conn = DatabaseConnection.getConnection();\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery("SELECT ... FROM books");\nwhile (rs.next()) { ... }`
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    onAddBook({
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      available_copies: Number(copies) || 1,
    });

    setLastTrace({
      action: 'INSERT (Add new book)',
      sql: `INSERT INTO books (title, author, category, available_copies) VALUES ('${title}', '${author}', '${category}', ${copies});`,
      jdbc: `String sql = "INSERT INTO books (title, author, category, available_copies) VALUES (?, ?, ?, ?)";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "${title}");\npstmt.setString(2, "${author}");\npstmt.setString(3, "${category}");\npstmt.setInt(4, ${copies});\nint rowsAffected = pstmt.executeUpdate();`
    });

    setTitle('');
    setAuthor('');
    setCopies(3);
  };

  const startEdit = (b: Book) => {
    setEditingId(b.book_id);
    setEditTitle(b.title);
    setEditAuthor(b.author);
    setEditCategory(b.category);
    setEditCopies(b.available_copies);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;

    onUpdateBook({
      book_id: editingId,
      title: editTitle.trim(),
      author: editAuthor.trim(),
      category: editCategory.trim(),
      available_copies: Number(editCopies) || 0,
    });

    setLastTrace({
      action: `UPDATE (Book ID #${editingId})`,
      sql: `UPDATE books SET title = '${editTitle}', author = '${editAuthor}', category = '${editCategory}', available_copies = ${editCopies} WHERE book_id = ${editingId};`,
      jdbc: `String sql = "UPDATE books SET title = ?, author = ?, category = ?, available_copies = ? WHERE book_id = ?";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "${editTitle}");\npstmt.setString(2, "${editAuthor}");\npstmt.setString(3, "${editCategory}");\npstmt.setInt(4, ${editCopies});\npstmt.setInt(5, ${editingId});\nint rows = pstmt.executeUpdate();`
    });

    setEditingId(null);
  };

  const handleDelete = (id: number, bookTitle: string) => {
    if (confirm(`Delete book "${bookTitle}" (ID: ${id})?`)) {
      onDeleteBook(id);
      setLastTrace({
        action: `DELETE (Book ID #${id})`,
        sql: `DELETE FROM books WHERE book_id = ${id};`,
        jdbc: `String sql = "DELETE FROM books WHERE book_id = ?";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setInt(1, ${id});\nint rows = pstmt.executeUpdate();`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
            Table: books
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Book Operations (CRUD)</h2>
          <p className="text-sm text-slate-400">
            Demonstrates <strong>Add book</strong> (INSERT), <strong>View books</strong> (SELECT), <strong>Update book</strong> (UPDATE), and <strong>Delete book</strong> (DELETE).
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-2 rounded border border-slate-800">
          Java Class: <span className="text-amber-400">BookDAO.java</span>
        </div>
      </div>

      {/* Form + Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Book Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Add New Book</h3>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Book Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Operating System Concepts"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Author <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Abraham Silberschatz"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Software Eng">Software Eng</option>
                <option value="Mechanical Eng">Mechanical Eng</option>
                <option value="Electrical Eng">Electrical Eng</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Mathematics">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Available Copies <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Execute BookDAO.addBook()
            </button>
          </form>
        </div>

        {/* View Books Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-white">View Books (ResultSet)</h3>
              <p className="text-xs text-slate-400">Total records: {books.length}</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded">
              Statement.executeQuery("SELECT ...")
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/80 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">ID</th>
                  <th className="px-3 py-2.5">Title</th>
                  <th className="px-3 py-2.5">Author</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Copies</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {books.map((b) => (
                  <tr key={b.book_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-emerald-400 font-semibold">
                      #{b.book_id}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-white flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      {b.title}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-300">{b.author}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          b.available_copies > 0
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                            : 'bg-red-950/80 text-red-400 border border-red-800/50'
                        }`}
                      >
                        {b.available_copies} {b.available_copies === 1 ? 'copy' : 'copies'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right space-x-2">
                      <button
                        onClick={() => startEdit(b)}
                        title="Update book"
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.book_id, b.title)}
                        title="Delete book"
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No books found in table.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update Book Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Update Book (ID: #{editingId})</h3>
            <p className="text-xs text-slate-400 mb-4">
              Demonstrates <code>BookDAO.updateBook()</code> with PreparedStatement and <code>executeUpdate()</code>.
            </p>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Author</label>
                <input
                  type="text"
                  required
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Category</label>
                <input
                  type="text"
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Available Copies</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editCopies}
                  onChange={(e) => setEditCopies(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Save Changes (executeUpdate)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1.5 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" /> Java JDBC API Code:
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap">{lastTrace.jdbc}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
