import { Student, Book, Borrowing, BorrowingDetail, DbHealth } from './types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    // Non-JSON response (e.g. HTML 404 or 500 error page)
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 120)}`);
    }
    throw new Error(`Expected JSON but received ${contentType || 'text'}`);
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.details || data?.message || `Server error (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Health & Diagnostics
  async getHealth(): Promise<DbHealth> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const data = await res.json();
        return data as DbHealth;
      }

      // If response is HTML or text, handle gracefully without throwing SyntaxError
      return {
        status: 'disconnected',
        error: `HTTP ${res.status}: Non-JSON response`,
        message: 'Backend server returned non-JSON response.',
      };
    } catch (err: any) {
      return {
        status: 'disconnected',
        error: err.message || 'Network request failed',
        message: 'Could not connect to backend health check.',
      };
    }
  },

  async initializeSafeTables(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/tables/initialize-safe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Students CRUD
  async getStudents(): Promise<Student[]> {
    const res = await fetch(`${BASE_URL}/students`);
    return handleResponse<Student[]>(res);
  },

  async addStudent(student: Omit<Student, 'student_id'>): Promise<Student> {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    return handleResponse<Student>(res);
  },

  async updateStudent(student: Student): Promise<Student> {
    const res = await fetch(`${BASE_URL}/students/${student.student_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    return handleResponse<Student>(res);
  },

  async deleteStudent(studentId: number): Promise<{ message: string; student_id: number }> {
    const res = await fetch(`${BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; student_id: number }>(res);
  },

  // Books CRUD
  async getBooks(): Promise<Book[]> {
    const res = await fetch(`${BASE_URL}/books`);
    return handleResponse<Book[]>(res);
  },

  async addBook(book: Omit<Book, 'book_id'>): Promise<Book> {
    const res = await fetch(`${BASE_URL}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    return handleResponse<Book>(res);
  },

  async updateBook(book: Book): Promise<Book> {
    const res = await fetch(`${BASE_URL}/books/${book.book_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    return handleResponse<Book>(res);
  },

  async deleteBook(bookId: number): Promise<{ message: string; book_id: number }> {
    const res = await fetch(`${BASE_URL}/books/${bookId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; book_id: number }>(res);
  },

  // Borrowings CRUD
  async getBorrowings(): Promise<BorrowingDetail[]> {
    const res = await fetch(`${BASE_URL}/borrowings`);
    return handleResponse<BorrowingDetail[]>(res);
  },

  async borrowBook(studentId: number, bookId: number, borrowDate: string): Promise<BorrowingDetail> {
    const res = await fetch(`${BASE_URL}/borrowings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        book_id: bookId,
        borrow_date: borrowDate,
      }),
    });
    return handleResponse<BorrowingDetail>(res);
  },

  async returnBorrowing(borrowId: number): Promise<BorrowingDetail> {
    const res = await fetch(`${BASE_URL}/borrowings/${borrowId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RETURNED' }),
    });
    return handleResponse<BorrowingDetail>(res);
  },

  async deleteBorrowing(borrowId: number): Promise<{ message: string; borrow_id: number }> {
    const res = await fetch(`${BASE_URL}/borrowings/${borrowId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string; borrow_id: number }>(res);
  },
};
