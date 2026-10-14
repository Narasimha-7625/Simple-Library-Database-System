import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// MySQL Connection Pool Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'librarydatabase',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create the connection pool
export const pool: Pool = mysql.createPool(dbConfig);

// Helper to check DB connection
async function checkDbConnection(): Promise<{ ok: boolean; error?: string; code?: string }> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { ok: true };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || 'Unknown database error',
      code: err.code || 'DB_ERROR',
    };
  }
}

// -----------------------------------------------------------------------------
// 1. Health & Diagnostic API
// -----------------------------------------------------------------------------
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDbConnection();

  if (!dbStatus.ok) {
    return res.status(503).json({
      status: 'disconnected',
      database: dbConfig.database,
      host: `${dbConfig.host}:${dbConfig.port}`,
      user: dbConfig.user,
      error: dbStatus.error,
      code: dbStatus.code,
      message: 'Failed to connect to MySQL database. Verify MySQL is running and credentials in .env are correct.',
    });
  }

  // Check table presence and row counts
  try {
    const [tables]: any = await pool.query('SHOW TABLES');
    const tableNames: string[] = tables.map((t: any) => Object.values(t)[0]);

    const hasStudents = tableNames.includes('students');
    const hasBooks = tableNames.includes('books');
    const hasBorrowings = tableNames.includes('borrowings');

    let studentCount = 0;
    let bookCount = 0;
    let borrowingCount = 0;

    if (hasStudents) {
      const [rows]: any = await pool.query('SELECT COUNT(*) AS count FROM students');
      studentCount = rows[0]?.count || 0;
    }
    if (hasBooks) {
      const [rows]: any = await pool.query('SELECT COUNT(*) AS count FROM books');
      bookCount = rows[0]?.count || 0;
    }
    if (hasBorrowings) {
      const [rows]: any = await pool.query('SELECT COUNT(*) AS count FROM borrowings');
      borrowingCount = rows[0]?.count || 0;
    }

    return res.json({
      status: 'connected',
      database: dbConfig.database,
      host: `${dbConfig.host}:${dbConfig.port}`,
      user: dbConfig.user,
      tables: {
        students: hasStudents,
        books: hasBooks,
        borrowings: hasBorrowings,
      },
      counts: {
        students: studentCount,
        books: bookCount,
        borrowings: borrowingCount,
      },
      allRequiredTablesExist: hasStudents && hasBooks && hasBorrowings,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'connected_with_warnings',
      database: dbConfig.database,
      error: err.message,
    });
  }
});

// Non-destructive table initialization endpoint (safe: uses CREATE TABLE IF NOT EXISTS)
app.post('/api/tables/initialize-safe', async (_req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    try {
      // 1. Table: students
      await connection.query(`
        CREATE TABLE IF NOT EXISTS students (
          student_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          department VARCHAR(50) NOT NULL,
          phone VARCHAR(15) NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 2. Table: books
      await connection.query(`
        CREATE TABLE IF NOT EXISTS books (
          book_id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          author VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          available_copies INT NOT NULL DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 3. Table: borrowings
      await connection.query(`
        CREATE TABLE IF NOT EXISTS borrowings (
          borrow_id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          book_id INT NOT NULL,
          borrow_date DATE NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',
          FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
          FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      return res.json({
        success: true,
        message: 'Verified/created required tables non-destructively using CREATE TABLE IF NOT EXISTS.',
      });
    } finally {
      connection.release();
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// -----------------------------------------------------------------------------
// 2. Students API (GET, POST, PUT, DELETE)
// -----------------------------------------------------------------------------
app.get('/api/students', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT student_id, name, email, department, phone FROM students ORDER BY student_id ASC'
    );
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students from database', details: err.message });
  }
});

app.post('/api/students', async (req: Request, res: Response) => {
  const { name, email, department, phone } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({ error: 'Name, email, and department are required fields.' });
  }

  try {
    const [result]: any = await pool.query(
      'INSERT INTO students (name, email, department, phone) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim(), department.trim(), phone?.trim() || null]
    );

    const newStudentId = result.insertId;
    const [rows]: any = await pool.query(
      'SELECT student_id, name, email, department, phone FROM students WHERE student_id = ?',
      [newStudentId]
    );

    res.status(201).json(rows[0]);
  } catch (err: any) {
    console.error('Error adding student:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A student with this email address already exists.' });
    }
    res.status(500).json({ error: 'Failed to insert student', details: err.message });
  }
});

app.put('/api/students/:id', async (req: Request, res: Response) => {
  const studentId = parseInt(req.params.id, 10);
  const { name, email, department, phone } = req.body;

  if (isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid student ID.' });
  }
  if (!name || !email || !department) {
    return res.status(400).json({ error: 'Name, email, and department are required.' });
  }

  try {
    const [result]: any = await pool.query(
      'UPDATE students SET name = ?, email = ?, department = ?, phone = ? WHERE student_id = ?',
      [name.trim(), email.trim(), department.trim(), phone?.trim() || null, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Student #${studentId} not found.` });
    }

    const [rows]: any = await pool.query(
      'SELECT student_id, name, email, department, phone FROM students WHERE student_id = ?',
      [studentId]
    );

    res.json(rows[0]);
  } catch (err: any) {
    console.error('Error updating student:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Another student already has this email address.' });
    }
    res.status(500).json({ error: 'Failed to update student', details: err.message });
  }
});

app.delete('/api/students/:id', async (req: Request, res: Response) => {
  const studentId = parseInt(req.params.id, 10);
  if (isNaN(studentId)) {
    return res.status(400).json({ error: 'Invalid student ID.' });
  }

  try {
    const [result]: any = await pool.query('DELETE FROM students WHERE student_id = ?', [studentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Student #${studentId} not found.` });
    }

    res.json({ message: `Student #${studentId} deleted successfully.`, student_id: studentId });
  } catch (err: any) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// 3. Books API (GET, POST, PUT, DELETE)
// -----------------------------------------------------------------------------
app.get('/api/books', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT book_id, title, author, category, available_copies FROM books ORDER BY book_id ASC'
    );
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Failed to fetch books from database', details: err.message });
  }
});

app.post('/api/books', async (req: Request, res: Response) => {
  const { title, author, category, available_copies } = req.body;

  if (!title || !author || !category) {
    return res.status(400).json({ error: 'Title, author, and category are required fields.' });
  }

  const copies = available_copies !== undefined ? Number(available_copies) : 1;
  if (isNaN(copies) || copies < 0) {
    return res.status(400).json({ error: 'Available copies must be a non-negative integer.' });
  }

  try {
    const [result]: any = await pool.query(
      'INSERT INTO books (title, author, category, available_copies) VALUES (?, ?, ?, ?)',
      [title.trim(), author.trim(), category.trim(), copies]
    );

    const newBookId = result.insertId;
    const [rows]: any = await pool.query(
      'SELECT book_id, title, author, category, available_copies FROM books WHERE book_id = ?',
      [newBookId]
    );

    res.status(201).json(rows[0]);
  } catch (err: any) {
    console.error('Error adding book:', err);
    res.status(500).json({ error: 'Failed to insert book', details: err.message });
  }
});

app.put('/api/books/:id', async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.id, 10);
  const { title, author, category, available_copies } = req.body;

  if (isNaN(bookId)) {
    return res.status(400).json({ error: 'Invalid book ID.' });
  }
  if (!title || !author || !category) {
    return res.status(400).json({ error: 'Title, author, and category are required.' });
  }

  const copies = available_copies !== undefined ? Number(available_copies) : 0;
  if (isNaN(copies) || copies < 0) {
    return res.status(400).json({ error: 'Available copies must be a non-negative number.' });
  }

  try {
    const [result]: any = await pool.query(
      'UPDATE books SET title = ?, author = ?, category = ?, available_copies = ? WHERE book_id = ?',
      [title.trim(), author.trim(), category.trim(), copies, bookId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Book #${bookId} not found.` });
    }

    const [rows]: any = await pool.query(
      'SELECT book_id, title, author, category, available_copies FROM books WHERE book_id = ?',
      [bookId]
    );

    res.json(rows[0]);
  } catch (err: any) {
    console.error('Error updating book:', err);
    res.status(500).json({ error: 'Failed to update book', details: err.message });
  }
});

app.delete('/api/books/:id', async (req: Request, res: Response) => {
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) {
    return res.status(400).json({ error: 'Invalid book ID.' });
  }

  try {
    const [result]: any = await pool.query('DELETE FROM books WHERE book_id = ?', [bookId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Book #${bookId} not found.` });
    }

    res.json({ message: `Book #${bookId} deleted successfully.`, book_id: bookId });
  } catch (err: any) {
    console.error('Error deleting book:', err);
    res.status(500).json({ error: 'Failed to delete book', details: err.message });
  }
});

// -----------------------------------------------------------------------------
// 4. Borrowings API (GET, POST, PUT, DELETE with Transactions)
// -----------------------------------------------------------------------------
app.get('/api/borrowings', async (_req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        b.borrow_id,
        b.student_id,
        s.name AS student_name,
        s.department,
        b.book_id,
        bk.title AS book_title,
        bk.author,
        DATE_FORMAT(b.borrow_date, '%Y-%m-%d') AS borrow_date,
        b.status
      FROM borrowings b
      LEFT JOIN students s ON b.student_id = s.student_id
      LEFT JOIN books bk ON b.book_id = bk.book_id
      ORDER BY b.borrow_id DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err: any) {
    console.error('Error fetching borrowings:', err);
    res.status(500).json({ error: 'Failed to fetch borrowing records', details: err.message });
  }
});

app.post('/api/borrowings', async (req: Request, res: Response) => {
  const { student_id, book_id, borrow_date } = req.body;

  const studentId = parseInt(student_id, 10);
  const bookId = parseInt(book_id, 10);
  const dateStr = borrow_date || new Date().toISOString().split('T')[0];

  if (isNaN(studentId) || isNaN(bookId)) {
    return res.status(400).json({ error: 'Valid student_id and book_id are required.' });
  }

  let connection: PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Check student exists
    const [studentRows]: any = await connection.query(
      'SELECT student_id, name FROM students WHERE student_id = ?',
      [studentId]
    );
    if (studentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: `Student with ID #${studentId} does not exist.` });
    }

    // 2. Lock and check book availability
    const [bookRows]: any = await connection.query(
      'SELECT book_id, title, available_copies FROM books WHERE book_id = ? FOR UPDATE',
      [bookId]
    );
    if (bookRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: `Book with ID #${bookId} does not exist.` });
    }

    const book = bookRows[0];
    if (book.available_copies <= 0) {
      await connection.rollback();
      return res.status(400).json({
        error: `Cannot borrow: "${book.title}" has 0 available copies in stock.`,
      });
    }

    // 3. Decrement available copies
    await connection.query(
      'UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?',
      [bookId]
    );

    // 4. Insert borrowing record
    const [insertResult]: any = await connection.query(
      'INSERT INTO borrowings (student_id, book_id, borrow_date, status) VALUES (?, ?, ?, ?)',
      [studentId, bookId, dateStr, 'BORROWED']
    );

    await connection.commit();

    // Fetch the newly joined borrowing record
    const [newRecord]: any = await connection.query(
      `SELECT 
        b.borrow_id,
        b.student_id,
        s.name AS student_name,
        s.department,
        b.book_id,
        bk.title AS book_title,
        bk.author,
        DATE_FORMAT(b.borrow_date, '%Y-%m-%d') AS borrow_date,
        b.status
      FROM borrowings b
      LEFT JOIN students s ON b.student_id = s.student_id
      LEFT JOIN books bk ON b.book_id = bk.book_id
      WHERE b.borrow_id = ?`,
      [insertResult.insertId]
    );

    res.status(201).json(newRecord[0]);
  } catch (err: any) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error borrowing book:', err);
    res.status(500).json({ error: 'Transaction failed while borrowing book', details: err.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.put('/api/borrowings/:id', async (req: Request, res: Response) => {
  const borrowId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (isNaN(borrowId)) {
    return res.status(400).json({ error: 'Invalid borrow ID.' });
  }

  const targetStatus = status ? status.toUpperCase() : 'RETURNED';
  if (!['BORROWED', 'RETURNED'].includes(targetStatus)) {
    return res.status(400).json({ error: "Status must be either 'BORROWED' or 'RETURNED'." });
  }

  let connection: PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get current record
    const [rows]: any = await connection.query(
      'SELECT * FROM borrowings WHERE borrow_id = ? FOR UPDATE',
      [borrowId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: `Borrowing record #${borrowId} not found.` });
    }

    const currentRecord = rows[0];

    // If changing from BORROWED to RETURNED, restore book inventory (+1)
    if (currentRecord.status === 'BORROWED' && targetStatus === 'RETURNED') {
      await connection.query(
        'UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?',
        [currentRecord.book_id]
      );
    } else if (currentRecord.status === 'RETURNED' && targetStatus === 'BORROWED') {
      // Re-borrowing: verify copy available and decrement (-1)
      const [bookRows]: any = await connection.query(
        'SELECT available_copies FROM books WHERE book_id = ? FOR UPDATE',
        [currentRecord.book_id]
      );
      if (bookRows[0].available_copies <= 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Cannot re-borrow: no copies available.' });
      }
      await connection.query(
        'UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?',
        [currentRecord.book_id]
      );
    }

    // Update status
    await connection.query('UPDATE borrowings SET status = ? WHERE borrow_id = ?', [
      targetStatus,
      borrowId,
    ]);

    await connection.commit();

    const [updatedRow]: any = await connection.query(
      `SELECT 
        b.borrow_id,
        b.student_id,
        s.name AS student_name,
        s.department,
        b.book_id,
        bk.title AS book_title,
        bk.author,
        DATE_FORMAT(b.borrow_date, '%Y-%m-%d') AS borrow_date,
        b.status
      FROM borrowings b
      LEFT JOIN students s ON b.student_id = s.student_id
      LEFT JOIN books bk ON b.book_id = bk.book_id
      WHERE b.borrow_id = ?`,
      [borrowId]
    );

    res.json(updatedRow[0]);
  } catch (err: any) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating borrowing record:', err);
    res.status(500).json({ error: 'Failed to update borrowing status', details: err.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.delete('/api/borrowings/:id', async (req: Request, res: Response) => {
  const borrowId = parseInt(req.params.id, 10);
  if (isNaN(borrowId)) {
    return res.status(400).json({ error: 'Invalid borrow ID.' });
  }

  let connection: PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows]: any = await connection.query(
      'SELECT * FROM borrowings WHERE borrow_id = ? FOR UPDATE',
      [borrowId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: `Borrowing record #${borrowId} not found.` });
    }

    const currentRecord = rows[0];

    // If an active borrowed record is deleted, increment available_copies back
    if (currentRecord.status === 'BORROWED') {
      await connection.query(
        'UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?',
        [currentRecord.book_id]
      );
    }

    await connection.query('DELETE FROM borrowings WHERE borrow_id = ?', [borrowId]);
    await connection.commit();

    res.json({ message: `Borrowing record #${borrowId} deleted successfully.`, borrow_id: borrowId });
  } catch (err: any) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error deleting borrowing record:', err);
    res.status(500).json({ error: 'Failed to delete borrowing record', details: err.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// -----------------------------------------------------------------------------
// 5. Mount Frontend (Vite in Development, Static in Production)
// -----------------------------------------------------------------------------
const isProduction = process.env.NODE_ENV === 'production';
// In AI Studio container development, dev server listens on port 3000
const PORT = 3000;

async function ensureTablesExist() {
  try {
    // 1. Create database if it doesn't exist yet on MySQL server
    try {
      const adminConn = await mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
      });
      await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
      await adminConn.end();
    } catch {
      // Continue to try pool
    }

    // 2. Create the 3 required tables
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS students (
          student_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          department VARCHAR(50) NOT NULL,
          phone VARCHAR(15) NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS books (
          book_id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(150) NOT NULL,
          author VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          available_copies INT NOT NULL DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS borrowings (
          borrow_id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          book_id INT NOT NULL,
          borrow_date DATE NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',
          FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
          FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('Verified database and tables in MySQL (ready for MySQL Workbench).');
    } finally {
      connection.release();
    }
  } catch (err: any) {
    // Database will be initialized automatically when MySQL server comes online
  }
}

async function startServer() {
  await ensureTablesExist();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`Simple Library Database System Server is running!`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`MySQL Target: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
