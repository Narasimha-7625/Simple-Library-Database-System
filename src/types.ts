export interface Student {
  student_id: number;
  name: string;
  email: string;
  department: string;
  phone?: string;
}

export interface Book {
  book_id: number;
  title: string;
  author: string;
  category: string;
  available_copies: number;
}

export interface Borrowing {
  borrow_id: number;
  student_id: number;
  book_id: number;
  borrow_date: string;
  status: 'BORROWED' | 'RETURNED';
}

export interface BorrowingDetail {
  borrow_id: number;
  student_id: number;
  student_name: string;
  department: string;
  book_id: number;
  book_title: string;
  author: string;
  borrow_date: string;
  status: 'BORROWED' | 'RETURNED';
}

export interface QueryExecutionResult {
  sql: string;
  jdbcSnippet: string;
  affectedRows?: number;
  data?: Record<string, any>[];
  columns?: string[];
  message: string;
  topic: string;
  type: 'DQL' | 'DML' | 'DDL';
}

export interface DbHealth {
  status: 'connected' | 'disconnected' | 'connected_with_warnings' | 'checking';
  database?: string;
  host?: string;
  user?: string;
  tables?: {
    students: boolean;
    books: boolean;
    borrowings: boolean;
  };
  counts?: {
    students: number;
    books: number;
    borrowings: number;
  };
  allRequiredTablesExist?: boolean;
  error?: string;
  code?: string;
  message?: string;
}
