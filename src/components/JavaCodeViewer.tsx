import React, { useState } from 'react';
import { RAW_JAVA_FILES } from '../data/initialData';
import { FileCode, Copy, Check, Info } from 'lucide-react';

export const JavaCodeViewer: React.FC = () => {
  const fileNames = Object.keys(RAW_JAVA_FILES) as Array<keyof typeof RAW_JAVA_FILES>;
  const [selectedFile, setSelectedFile] = useState<keyof typeof RAW_JAVA_FILES>('DatabaseConnection.java');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(RAW_JAVA_FILES[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileDescriptions: Record<string, { topic: string; notes: string }> = {
    'DatabaseConnection.java': {
      topic: 'JDBC Driver & DriverManager',
      notes: 'Demonstrates Step 1 & Step 2 of JDBC: Class.forName("com.mysql.cj.jdbc.Driver") and DriverManager.getConnection().'
    },
    'StudentDAO.java': {
      topic: 'PreparedStatement, Statement, ResultSet, CRUD',
      notes: 'Encapsulates students table operations: addStudent (INSERT), getAllStudents (SELECT), updateStudent (UPDATE), deleteStudent (DELETE).'
    },
    'BookDAO.java': {
      topic: 'PreparedStatement & ResultSet',
      notes: 'Encapsulates books table operations: addBook (INSERT), getAllBooks (SELECT), updateBook (UPDATE), deleteBook (DELETE).'
    },
    'BorrowingDAO.java': {
      topic: 'Relational JOIN, Transactions & Subqueries',
      notes: 'Demonstrates 3-table SQL INNER JOIN, transaction atomicity (setAutoCommit/commit/rollback), and Subqueries.'
    },
    'schema.sql': {
      topic: 'DDL, DML, Constraints & Set Operators',
      notes: 'Complete standard MySQL script with CREATE TABLE, ALTER TABLE, DROP TABLE, foreign keys, and all Unit 3 query demonstrations.'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
            Source Code Inspector
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Java &amp; JDBC Implementation Files</h2>
          <p className="text-sm text-slate-400">
            Pure Java code using standard <code className="text-blue-300">java.sql.*</code> (DriverManager, Connection, Statement, PreparedStatement, ResultSet) with NO Spring/Hibernate frameworks.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 font-mono">
          Package: java.sql.*
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {fileNames.map((fileName) => {
          const isSelected = selectedFile === fileName;
          return (
            <button
              key={fileName}
              onClick={() => setSelectedFile(fileName)}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-2 border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{fileName}</span>
            </button>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs flex items-start gap-3 text-slate-300">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-white">
            {fileDescriptions[selectedFile]?.topic}:{' '}
          </span>
          <span>{fileDescriptions[selectedFile]?.notes}</span>
        </div>
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
            <span className="font-mono text-xs text-slate-300 font-medium ml-2">
              {selectedFile}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors cursor-pointer border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed selection:bg-blue-900">
          <pre>{RAW_JAVA_FILES[selectedFile]}</pre>
        </div>
      </div>
    </div>
  );
};
