import React, { useState } from 'react';
import { Student } from '../types';
import { Plus, Pencil, Trash2, CheckCircle2, Terminal, Code2 } from 'lucide-react';

interface StudentManagerProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'student_id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: number) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [phone, setPhone] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const [lastTrace, setLastTrace] = useState<{
    action: string;
    sql: string;
    jdbc: string;
  }>({
    action: 'SELECT (Initial load of students table)',
    sql: 'SELECT student_id, name, email, department, phone FROM students ORDER BY student_id ASC;',
    jdbc: `Connection conn = DatabaseConnection.getConnection();\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery("SELECT ... FROM students");\nwhile (rs.next()) { ... }`
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAddStudent({
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      phone: phone.trim() || undefined,
    });

    setLastTrace({
      action: 'INSERT (Add new student)',
      sql: `INSERT INTO students (name, email, department, phone) VALUES ('${name}', '${email}', '${department}', '${phone || 'NULL'}');`,
      jdbc: `String sql = "INSERT INTO students (name, email, department, phone) VALUES (?, ?, ?, ?)";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "${name}");\npstmt.setString(2, "${email}");\npstmt.setString(3, "${department}");\npstmt.setString(4, "${phone}");\nint rowsAffected = pstmt.executeUpdate(); // returns 1`
    });

    setName('');
    setEmail('');
    setPhone('');
  };

  const startEdit = (s: Student) => {
    setEditingId(s.student_id);
    setEditName(s.name);
    setEditEmail(s.email);
    setEditDepartment(s.department);
    setEditPhone(s.phone || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;

    onUpdateStudent({
      student_id: editingId,
      name: editName.trim(),
      email: editEmail.trim(),
      department: editDepartment.trim(),
      phone: editPhone.trim() || undefined,
    });

    setLastTrace({
      action: `UPDATE (Student ID #${editingId})`,
      sql: `UPDATE students SET name = '${editName}', email = '${editEmail}', department = '${editDepartment}', phone = '${editPhone}' WHERE student_id = ${editingId};`,
      jdbc: `String sql = "UPDATE students SET name = ?, email = ?, department = ?, phone = ? WHERE student_id = ?";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setString(1, "${editName}");\npstmt.setString(2, "${editEmail}");\npstmt.setString(3, "${editDepartment}");\npstmt.setString(4, "${editPhone}");\npstmt.setInt(5, ${editingId});\nint rowsAffected = pstmt.executeUpdate();`
    });

    setEditingId(null);
  };

  const handleDelete = (id: number, studentName: string) => {
    if (confirm(`Delete student "${studentName}" (ID: ${id})?`)) {
      onDeleteStudent(id);
      setLastTrace({
        action: `DELETE (Student ID #${id})`,
        sql: `DELETE FROM students WHERE student_id = ${id};`,
        jdbc: `String sql = "DELETE FROM students WHERE student_id = ?";\nPreparedStatement pstmt = conn.prepareStatement(sql);\npstmt.setInt(1, ${id});\nint rows = pstmt.executeUpdate();`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Operation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
            Table: students
          </span>
          <h2 className="text-xl font-bold text-white mt-1">Student Operations (CRUD)</h2>
          <p className="text-sm text-slate-400">
            Demonstrates <strong>Add</strong> (INSERT), <strong>View</strong> (SELECT), <strong>Update</strong> (UPDATE), and <strong>Delete</strong> (DELETE) using JDBC PreparedStatement and Statement.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-2 rounded border border-slate-800">
          Java Class: <span className="text-amber-400">StudentDAO.java</span>
        </div>
      </div>

      {/* Grid: Form on left, Table on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Student Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Add New Student</h3>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya@srmist.edu.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Department <span className="text-red-400">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Mechanical Eng">Mechanical Eng</option>
                <option value="Electrical Eng">Electrical Eng</option>
                <option value="Civil Eng">Civil Eng</option>
                <option value="Data Science">Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number (from ALTER TABLE)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Execute StudentDAO.addStudent()
            </button>
          </form>
        </div>

        {/* View Students Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-white">View Students (ResultSet)</h3>
              <p className="text-xs text-slate-400">Total records: {students.length}</p>
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
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Email</th>
                  <th className="px-3 py-2.5">Department</th>
                  <th className="px-3 py-2.5">Phone</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {students.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-blue-400 font-semibold">
                      #{s.student_id}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-white">{s.name}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-300 font-mono">{s.email}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded">
                        {s.department}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs font-mono text-slate-400">
                      {s.phone || <span className="text-slate-600 italic">NULL</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right space-x-2">
                      <button
                        onClick={() => startEdit(s)}
                        title="Update student"
                        className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.student_id, s.name)}
                        title="Delete student"
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No students found in table. Add one using the form on the left.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Update Student Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Update Student (ID: #{editingId})</h3>
            <p className="text-xs text-slate-400 mb-4">
              Demonstrates <code>StudentDAO.updateStudent()</code> with PreparedStatement and <code>executeUpdate()</code>.
            </p>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Department</label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 mt-1"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Tech">Information Tech</option>
                  <option value="Mechanical Eng">Mechanical Eng</option>
                  <option value="Electrical Eng">Electrical Eng</option>
                  <option value="Civil Eng">Civil Eng</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
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
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium"
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
            <div className="text-blue-400 font-bold mb-1 flex items-center gap-1.5 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" /> Java JDBC API Code:
            </div>
            <pre className="text-slate-300 whitespace-pre-wrap">{lastTrace.jdbc}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
