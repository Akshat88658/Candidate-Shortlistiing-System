import React, { useState, useEffect } from 'react';
import { addEmployee, updateEmployee } from '../api/apiService';

export default function EmployeeForm({ employee, onCancel, onSuccess }) {
  const isEdit = !!employee;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    skillsInput: '',
    performanceScore: '',
    experience: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department || '',
        skillsInput: employee.skills ? employee.skills.join(', ') : '',
        performanceScore: employee.performanceScore !== undefined ? employee.performanceScore : '',
        experience: employee.experience !== undefined ? employee.experience : ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: '',
        skillsInput: '',
        performanceScore: '',
        experience: ''
      });
    }
    setError('');
  }, [employee]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Frontend validations
    const score = Number(formData.performanceScore);
    const exp = Number(formData.experience);

    if (!formData.name.trim()) {
      setError('Employee Name is required.');
      setLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required.');
      setLoading(false);
      return;
    }
    if (!formData.department.trim()) {
      setError('Department is required.');
      setLoading(false);
      return;
    }
    if (!formData.skillsInput.trim()) {
      setError('At least one skill is required.');
      setLoading(false);
      return;
    }
    
    // Performance Score validation - must throw error if missing/invalid (matches test case: Missing performance score -> Validation error)
    if (formData.performanceScore === '' || isNaN(score)) {
      setError('Performance Score is required and must be a valid number.');
      setLoading(false);
      return;
    }
    if (score < 0 || score > 100) {
      setError('Performance Score must be between 0 and 100.');
      setLoading(false);
      return;
    }

    if (formData.experience === '' || isNaN(exp)) {
      setError('Years of Experience is required.');
      setLoading(false);
      return;
    }
    if (exp < 0) {
      setError('Experience cannot be negative.');
      setLoading(false);
      return;
    }

    // Process skills into array
    const skillsArray = formData.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      department: formData.department.trim(),
      skills: skillsArray,
      performanceScore: score,
      experience: exp
    };

    try {
      if (isEdit) {
        const res = await updateEmployee(employee._id, payload);
        if (res.data.success) {
          onSuccess(res.data.data, 'Employee updated successfully!');
        }
      } else {
        const res = await addEmployee(payload);
        if (res.data.success) {
          onSuccess(res.data.data, 'Employee registered successfully!');
        }
      }
    } catch (err) {
      console.error('Submit Error:', err);
      const errMsg = err.response?.data?.message || 'Error processing request. Please verify inputs.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animated-fade">
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{isEdit ? '✏️' : '👤'}</span>
        {isEdit ? 'Update Employee Profile' : 'Register New Employee'}
      </h3>

      {error && (
        <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '0.75rem', marginBottom: '1.25rem', borderRadius: '8px', textTransform: 'none', textAlign: 'left' }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-cols-2">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Aman Verma"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="e.g. aman@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isEdit} /* Avoid changing email on edit to keep email index unique */
            />
          </div>
        </div>

        <div className="grid-cols-2">
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              name="department"
              className="form-input"
              placeholder="e.g. Development, Sales, HR"
              value={formData.department}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input
              type="number"
              name="experience"
              className="form-input"
              placeholder="e.g. 3"
              value={formData.experience}
              onChange={handleInputChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Skills (Comma Separated)</label>
          <input
            type="text"
            name="skillsInput"
            className="form-input"
            placeholder="e.g. React, Node.js, MongoDB, Express"
            value={formData.skillsInput}
            onChange={handleInputChange}
            required
          />
          <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
            Separate skills with commas (e.g. "React, Redux, Node.js")
          </small>
        </div>

        <div className="form-group" style={{ maxWidth: '250px' }}>
          <label className="form-label">Performance Score (0 - 100)</label>
          <input
            type="number"
            name="performanceScore"
            className="form-input"
            placeholder="e.g. 85"
            value={formData.performanceScore}
            onChange={handleInputChange}
            min="0"
            max="100"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          {onCancel && (
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : (isEdit ? 'Update Details' : 'Register Employee')}
          </button>
        </div>
      </form>
    </div>
  );
}
