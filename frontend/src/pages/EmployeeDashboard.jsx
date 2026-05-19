import React, { useState, useEffect } from 'react';
import { getEmployees, deleteEmployee } from '../api/apiService';
import EmployeeForm from '../components/EmployeeForm';

export default function EmployeeDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [minScore, setMinScore] = useState('');
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Fetch employees
  const fetchEmployeesList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEmployees();
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Fetch Employees Error:', err);
      setError('Failed to fetch employees. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  // Handle delete employee (matches test case: Delete employee)
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the analytics system?`)) {
      try {
        const res = await deleteEmployee(id);
        if (res.data.success) {
          showNotification('Employee removed successfully!');
          fetchEmployeesList();
        }
      } catch (err) {
        console.error('Delete Error:', err);
        setError(err.response?.data?.message || 'Failed to remove employee.');
      }
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const handleFormSuccess = (data, message) => {
    setShowFormModal(false);
    setEditingEmployee(null);
    showNotification(message);
    fetchEmployeesList();
  };

  // Get unique departments for the dropdown selector
  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);

  // Client-side real-time matching, searching, and filtering
  const filteredEmployees = employees.filter(emp => {
    // 1. Search term match (Name, email, skills, department)
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Department filter match
    const matchesDept = selectedDept === '' || emp.department === selectedDept;

    // 3. Minimum performance score match
    const matchesScore = minScore === '' || emp.performanceScore >= Number(minScore);

    return matchesSearch && matchesDept && matchesScore;
  });

  // Calculate high-fidelity dashboard metrics
  const totalEmployeesCount = filteredEmployees.length;
  
  const avgPerformanceScore = filteredEmployees.length > 0
    ? Math.round(filteredEmployees.reduce((sum, emp) => sum + emp.performanceScore, 0) / filteredEmployees.length)
    : 0;

  const avgExperience = filteredEmployees.length > 0
    ? (filteredEmployees.reduce((sum, emp) => sum + emp.experience, 0) / filteredEmployees.length).toFixed(1)
    : '0';

  // Find department with highest average score
  const getTopDept = () => {
    if (filteredEmployees.length === 0) return 'N/A';
    const deptScores = {};
    filteredEmployees.forEach(emp => {
      if (!deptScores[emp.department]) {
        deptScores[emp.department] = { sum: 0, count: 0 };
      }
      deptScores[emp.department].sum += emp.performanceScore;
      deptScores[emp.department].count += 1;
    });

    let topDeptName = 'N/A';
    let highestAvg = 0;

    Object.keys(deptScores).forEach(dept => {
      const avg = deptScores[dept].sum / deptScores[dept].count;
      if (avg > highestAvg) {
        highestAvg = avg;
        topDeptName = dept;
      }
    });

    return `${topDeptName} (${Math.round(highestAvg)}%)`;
  };

  // Determine performance class badge color
  const getScoreBadgeClass = (score) => {
    if (score >= 85) return 'score-circle score-high';
    if (score >= 70) return 'score-circle score-mid';
    return 'score-circle score-low';
  };

  return (
    <div className="container animated-fade">
      {/* Upper Analytics Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HR Performance Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track, audit, and analyze your team metrics dynamically.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingEmployee(null); setShowFormModal(true); }}>
          ➕ Register Employee
        </button>
      </div>

      {successMsg && (
        <div className="badge badge-success" style={{ display: 'block', width: '100%', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', borderRadius: '8px', fontSize: '0.9rem', textTransform: 'none', textShadow: 'none', fontWeight: 500 }}>
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', borderRadius: '8px', fontSize: '0.9rem', textTransform: 'none', textShadow: 'none', fontWeight: 500 }}>
          ❌ {error}
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-info">
            <h3>{totalEmployeesCount}</h3>
            <p>Total Headcount</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon" style={{ color: 'var(--secondary)', background: 'rgba(157, 78, 221, 0.1)' }}>📊</div>
          <div className="metric-info">
            <h3>{avgPerformanceScore}%</h3>
            <p>Avg Performance</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon" style={{ color: 'var(--accent)', background: 'rgba(247, 37, 133, 0.1)' }}>🏆</div>
          <div className="metric-info">
            <h3>{getTopDept()}</h3>
            <p>Top Performing Dept</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon" style={{ color: 'var(--color-info)', background: 'rgba(17, 138, 178, 0.1)' }}>⏳</div>
          <div className="metric-info">
            <h3>{avgExperience} yrs</h3>
            <p>Avg Experience</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Panel */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🔍 Filters & Search Panel
        </h4>
        <div className="search-filter-panel">
          <div className="form-group">
            <label className="form-label">Search Query</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, skills, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label className="form-label">Filter Department</label>
            <select
              className="form-input"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ maxWidth: '200px' }}>
            <label className="form-label">Min Score ({minScore || 0}+)</label>
            <input
              type="range"
              min="0"
              max="100"
              className="form-input"
              style={{ padding: '0.2rem' }}
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
            />
          </div>

          {(searchTerm || selectedDept || minScore) && (
            <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSelectedDept(''); setMinScore(''); }}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Employee list table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <div style={{ border: '3px solid rgba(255,255,255,0.05)', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }}></div>
            Retrieving employee directory...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>📂</span>
            No employees found matching selected criteria. Click "Register Employee" above to add new profiles.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee Info</th>
                  <th>Department</th>
                  <th>Core Skills</th>
                  <th style={{ textAlign: 'center' }}>Experience</th>
                  <th style={{ textAlign: 'center' }}>Score</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{emp.department}</span>
                    </td>
                    <td>
                      <div className="skills-wrapper">
                        {emp.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {emp.experience} yrs
                    </td>
                    <td style={{ display: 'flex', justifyContent: 'center' }}>
                      <div className={getScoreBadgeClass(emp.performanceScore)}>
                        {emp.performanceScore}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-icon" title="Edit Employee" onClick={() => { setEditingEmployee(emp); setShowFormModal(true); }}>
                          ✏️
                        </button>
                        <button className="btn btn-danger btn-icon" title="Delete Employee" onClick={() => handleDelete(emp._id, emp.name)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration/Edit Form Modal */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingEmployee ? 'Edit Profile' : 'New Registration'}</h3>
              <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => { setShowFormModal(false); setEditingEmployee(null); }}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <EmployeeForm
                employee={editingEmployee}
                onCancel={() => { setShowFormModal(false); setEditingEmployee(null); }}
                onSuccess={handleFormSuccess}
              />
            </div>
          </div>
        </div>
      )}

      {/* Keyframe spinner style hack */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
