import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    year: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load students');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      full_name: '',
      email: '',
      phone: '',
      department: '',
      year: ''
    });
    setEditingStudent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
        toast.success('Student updated successfully');
      } else {
        await api.post('/students', formData);
        toast.success('Student added successfully');
      }
      setShowModal(false);
      resetForm();
      loadStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || '',
      department: student.department || '',
      year: student.year || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this student?')) {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student deactivated successfully');
        loadStudents();
      } catch (error) {
        toast.error('Failed to deactivate student');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          <FaArrowLeft /> Back
        </button>
        <h1>Student Management</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FaPlus /> Add Student
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Year</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td><strong>{student.student_id}</strong></td>
                <td>{student.full_name}</td>
                <td>{student.email}</td>
                <td>{student.phone || 'N/A'}</td>
                <td>{student.department || 'N/A'}</td>
                <td>{student.year || 'N/A'}</td>
                <td>
                  <span className={`badge ${student.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(student)} style={{ marginRight: '8px' }}>
                    <FaEdit />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(student.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Student ID *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  min="1"
                  max="10"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
