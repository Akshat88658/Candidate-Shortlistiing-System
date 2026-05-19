import React, { useState, useEffect, useCallback } from 'react';
import { getComplaints, updateComplaintStatus, searchComplaintsByLocation, deleteComplaint } from '../api/apiService';

/* Animated counter */
function Counter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.max(1, Math.ceil(value / 30));
    const t = setInterval(() => {
      cur += step;
      if (cur >= value) { setN(value); clearInterval(t); }
      else setN(cur);
    }, 20);
    return () => clearInterval(t);
  }, [value]);
  return <span>{n}</span>;
}

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoc, setSearchLoc] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = catFilter ? await getComplaints(catFilter) : await getComplaints();
      setComplaints(res.data.complaints || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [catFilter]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSearch = async () => {
    if (!searchLoc.trim()) return fetchComplaints();
    setLoading(true);
    try {
      const res = await searchComplaintsByLocation(searchLoc);
      setComplaints(res.data.complaints || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateComplaintStatus(id, status);
      showToast(`Status updated to "${status}"`);
      fetchComplaints();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComplaint(id);
      setDeleteId(null);
      showToast('Complaint deleted successfully');
      fetchComplaints();
    } catch (err) { console.error(err); }
  };

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const highPriority = complaints.filter(c => c.aiPriority === 'High').length;

  const stats = [
    { label: 'Total Complaints', value: total, icon: '📊', color: 'indigo', gradient: 'from-indigo-600/20 to-indigo-500/5' },
    { label: 'Pending', value: pending, icon: '⏳', color: 'amber', gradient: 'from-amber-600/20 to-amber-500/5' },
    { label: 'In Progress', value: inProgress, icon: '🔄', color: 'cyan', gradient: 'from-cyan-600/20 to-cyan-500/5' },
    { label: 'Resolved', value: resolved, icon: '✅', color: 'emerald', gradient: 'from-emerald-600/20 to-emerald-500/5' },
    { label: 'High Priority', value: highPriority, icon: '🚨', color: 'red', gradient: 'from-red-600/20 to-red-500/5' },
  ];

  const colorText = { indigo: 'text-indigo-400', amber: 'text-amber-400', cyan: 'text-cyan-400', emerald: 'text-emerald-400', red: 'text-red-400' };
  const colorBorder = { indigo: 'border-indigo-500/20', amber: 'border-amber-500/20', cyan: 'border-cyan-500/20', emerald: 'border-emerald-500/20', red: 'border-red-500/20' };

  const statusS = {
    'Pending': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    'In Progress': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
    'Resolved': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  };
  const priorityS = {
    'High': 'bg-red-500/15 text-red-400 border-red-500/25',
    'Medium': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    'Low': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl glass border-emerald-500/20 text-emerald-400 text-sm font-medium shadow-xl animate-fade-in-down">
          ✅ {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
              Grievance Dashboard
            </h1>
            <p className="text-white text-sm mt-1">Monitor, manage, and resolve citizen complaints with AI insights</p>
          </div>
          <button onClick={fetchComplaints} className="px-4 py-2 rounded-xl glass text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer border border-white/20 active:scale-95 btn-ripple">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 stagger">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl p-5 bg-gradient-to-br ${s.gradient} border ${colorBorder[s.color]} card-interactive animate-fade-in-up`}>
            <div className="text-xl mb-2">{s.icon}</div>
            <p className={`text-3xl font-black ${colorText[s.color]}`}>
              <Counter value={s.value} />
            </p>
            <p className="text-[10px] text-white font-bold uppercase tracking-widest mt-1">{s.label}</p>
            {/* Mini progress bar */}
            <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
              <div className={`h-full rounded-full progress-bar ${s.color === 'indigo' ? 'bg-indigo-500' : s.color === 'amber' ? 'bg-amber-500' : s.color === 'cyan' ? 'bg-cyan-500' : s.color === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`}
                   style={{ width: total ? `${(s.value / total) * 100}%` : '0%' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <div className="flex-1 flex gap-2">
          <input
            type="text" placeholder="🔍 Search by location..." value={searchLoc}
            onChange={e => setSearchLoc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-black/60 border border-indigo-500/15 text-white text-sm placeholder-slate-500 focus:outline-none focus-glow transition-all"
          />
          <button onClick={handleSearch} className="px-5 py-2.5 rounded-lg bg-indigo-500/15 text-indigo-300 text-sm font-semibold hover:bg-indigo-500/25 transition-all cursor-pointer border border-indigo-500/20 active:scale-95 btn-ripple">
            Search
          </button>
        </div>
        <select
          value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-black/60 border border-indigo-500/15 text-white text-sm focus:outline-none transition-all cursor-pointer appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
        >
          <option value="" className="bg-[#1e1b4b]">All Categories</option>
          {['Water Supply','Electricity','Sanitation','Roads & Infrastructure','Public Safety','Others'].map(c => (
            <option key={c} value={c} className="bg-[#1e1b4b]">{c}</option>
          ))}
        </select>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass rounded-xl p-5 shimmer h-48 animate-pulse"></div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 text-slate-500 animate-fade-in-up">
          <p className="text-5xl mb-4 animate-float">📭</p>
          <p className="font-bold text-lg text-slate-400">No complaints found</p>
          <p className="text-sm">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger">
          {complaints.map((c) => (
            <div key={c._id} className="glass rounded-xl overflow-hidden card-interactive animate-fade-in-up group">
              {/* Priority accent stripe at top */}
              <div className={`h-1 ${c.aiPriority === 'High' ? 'bg-gradient-to-r from-red-500 to-orange-500' : c.aiPriority === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'}`}></div>
              
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 flex-1 group-hover:text-indigo-200 transition-colors">{c.title}</h3>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${priorityS[c.aiPriority] || 'bg-slate-500/15 text-slate-400 border-slate-500/25'}`}>
                    {c.aiPriority || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusS[c.status]}`}>{c.status}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 bg-white/5 border border-white/5">📍 {c.location}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-slate-500 bg-white/5 border border-white/5">📁 {c.category}</span>
                </div>
                <p className="text-xs text-white leading-relaxed line-clamp-2">{c.description}</p>
                {/* AI Department mini-badge */}
                {c.aiDepartment && (
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-cyan-400/70">
                    <span>🏢</span> <span className="font-medium">{c.aiDepartment}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-indigo-500/10 flex items-center justify-between gap-2 bg-white/[0.02]">
                <select
                  value={c.status} onChange={e => handleStatusUpdate(c._id, e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-black/60 border border-indigo-500/15 text-xs text-slate-300 focus:outline-none cursor-pointer appearance-none transition-all hover:border-indigo-500/30"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', paddingRight: '1.5rem' }}
                >
                  <option value="Pending" className="bg-[#1e1b4b]">⏳ Pending</option>
                  <option value="In Progress" className="bg-[#1e1b4b]">🔄 In Progress</option>
                  <option value="Resolved" className="bg-[#1e1b4b]">✅ Resolved</option>
                </select>
                <div className="flex gap-1.5">
                  <button onClick={() => setModal(c)} className="tooltip-trigger px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer uppercase tracking-wider active:scale-95">
                    🤖 AI
                    <span className="tooltip-text">View AI Analysis</span>
                  </button>
                  <button onClick={() => setDeleteId(c._id)} className="tooltip-trigger px-2 py-1.5 rounded-lg text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer active:scale-95">
                    🗑️
                    <span className="tooltip-text">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up" onClick={() => setDeleteId(null)}>
          <div className="glass rounded-2xl p-8 w-full max-w-sm text-center animate-scale-in border-red-500/20" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Complaint?</h3>
            <p className="text-sm text-slate-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25 transition-all cursor-pointer active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="glass rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto border-indigo-400/20 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/25">🤖</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">AI Complaint Analysis</h3>
                    <p className="text-xs text-slate-500">Ref #{modal._id.slice(-6).toUpperCase()} • By {modal.name}</p>
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-lg">✕</button>
              </div>

              {/* Complaint */}
              <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                <h4 className="text-sm font-bold text-white mb-1">{modal.title}</h4>
                <p className="text-xs text-slate-500 mb-2">📧 {modal.email} • 📍 {modal.location} • 📁 {modal.category}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{modal.description}</p>
              </div>

              {/* AI Grid */}
              <div className="grid grid-cols-2 gap-3 stagger">
                <div className={`rounded-xl p-4 border animate-fade-in-left ${priorityS[modal.aiPriority] || 'bg-slate-500/15 border-slate-500/25'}`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">🚨 Priority Detection</p>
                  <p className={`text-2xl font-black ${(priorityS[modal.aiPriority] || '').split(' ')[1] || 'text-slate-400'}`}>{modal.aiPriority || 'N/A'}</p>
                </div>
                <div className="rounded-xl p-4 bg-cyan-500/10 border border-cyan-500/20 animate-fade-in-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">🏢 Department</p>
                  <p className="text-sm font-bold text-cyan-400">{modal.aiDepartment || 'N/A'}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl p-4 bg-indigo-500/8 border border-indigo-500/15 animate-fade-in-up">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">📋 AI Summary</p>
                <p className="text-sm text-slate-300 italic leading-relaxed border-l-2 border-indigo-400 pl-3">"{modal.aiSummary || 'No summary.'}"</p>
              </div>

              {/* Auto Response */}
              <div className="rounded-xl overflow-hidden border border-emerald-500/15 animate-fade-in-up">
                <div className="px-4 py-2.5 bg-emerald-500/8 border-b border-emerald-500/10 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">✉️ Auto Response</p>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">AI GENERATED</span>
                </div>
                <div className="p-4 bg-[#0d0b1e]">
                  {(modal.aiAutoResponse || 'No response.').split('\n').map((line, i) => (
                    <p key={i} className="text-xs text-slate-400 font-mono leading-relaxed">{line || '\u00A0'}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
