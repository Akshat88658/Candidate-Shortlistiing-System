import React, { useState, useEffect, useRef } from 'react';
import { addComplaint } from '../api/apiService';

/* Animated number counter */
function AnimatedCounter({ value, duration = 600 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display}</span>;
}

/* Typing text animation */
function TypingText({ text, speed = 25 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}

function CitizenPortal() {
  const [formData, setFormData] = useState({
    name: '', email: '', title: '', category: 'Water Supply', location: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [aiStep, setAiStep] = useState(0); // 0=hidden, 1=analyzing, 2=priority, 3=dept, 4=summary, 5=response, 6=done
  const [focusedField, setFocusedField] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const resultRef = useRef(null);

  const categories = ['Water Supply', 'Electricity', 'Sanitation', 'Roads & Infrastructure', 'Public Safety', 'Others'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'description') setCharCount(value.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess(''); setAiResult(null); setShowAI(false); setAiStep(0);

    if (!formData.name.trim() || !formData.email.trim() || !formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Please fill all required fields.');
      setLoading(false);
      return;
    }

    try {
      // Start progressive AI steps
      setAiStep(1); // Analyzing...
      const res = await addComplaint(formData);
      
      if (res.data.success) {
        setAiResult(res.data.complaint);
        setSuccess('Complaint registered successfully!');
        setFormData({ name: '', email: '', title: '', category: 'Water Supply', location: '', description: '' });
        setCharCount(0);

        // Progressive reveal of AI features
        setShowAI(true);
        setAiStep(2); // Priority
        setTimeout(() => setAiStep(3), 500);  // Department
        setTimeout(() => setAiStep(4), 1000); // Summary
        setTimeout(() => setAiStep(5), 1500); // AutoResponse
        setTimeout(() => {
          setAiStep(6); // All done
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2000);
      } else {
        setError(res.data.message || 'Submission failed.');
        setAiStep(0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Connection error.');
      setAiStep(0);
    } finally {
      setLoading(false);
    }
  };

  const pCfg = {
    High:   { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', icon: '🔴', bar: 'bg-red-500' },
    Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', icon: '🟡', bar: 'bg-amber-500' },
    Low:    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: '🟢', bar: 'bg-emerald-500' }
  };
  const gp = (p) => pCfg[p] || pCfg.Medium;

  const inputClass = (name) => `w-full px-4 py-3 rounded-xl bg-black/60 border text-white placeholder-slate-500 text-sm transition-all duration-300 focus:outline-none focus-glow ${focusedField === name ? 'border-indigo-400 bg-black/80 shadow-lg shadow-indigo-500/10' : 'border-indigo-500/15 hover:border-indigo-500/30'}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-white text-xs font-semibold mb-5 tracking-wider uppercase animate-border-dance">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          AI-Powered Grievance System
        </div>
        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent leading-tight animate-gradient">
          Municipal Smart Support
        </h1>
        <p className="mt-3 text-white text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Lodge complaints with instant AI-driven priority detection, department routing, and automated responses.
        </p>

        {/* Live stats ticker */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white">
          <div className="flex items-center gap-1.5 tooltip-trigger">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>System Online</span>
            <span className="tooltip-text">AI Engine is active</span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <span>⚡</span> <span>AI Response &lt; 3s</span>
          </div>
          <div className="w-px h-4 bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <span>🔒</span> <span>Secure & Encrypted</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass rounded-2xl p-8 sm:p-10 animate-pulse-glow card-interactive">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-indigo-500/15">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/25 animate-float">
              📝
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Lodge a New Complaint</h2>
              <p className="text-xs text-slate-500 mt-0.5">All fields are required • AI analysis is automatic</p>
            </div>
            {/* Form completion indicator */}
            <div className="hidden sm:flex items-center gap-1">
              {['name','email','title','location','description'].map((f) => (
                <div key={f} className={`w-2 h-2 rounded-full transition-all duration-500 ${formData[f].trim() ? 'bg-emerald-400 scale-110' : 'bg-slate-700'}`} 
                     title={f}></div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger">
              <div className="animate-fade-in-left">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                  {formData.name && <span className="ml-1 text-emerald-400">✓</span>}
                </label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="e.g. Rahul Kumar"
                  className={inputClass('name')}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                />
              </div>
              <div className="animate-fade-in-right">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                  {formData.email && <span className="ml-1 text-emerald-400">✓</span>}
                </label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="e.g. rahul@gmail.com"
                  className={inputClass('email')}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Title */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Complaint Title
                {formData.title && <span className="ml-1 text-emerald-400">✓</span>}
              </label>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange} required
                placeholder="e.g. Water Leakage near Central Market"
                className={inputClass('title')}
                onFocus={() => setFocusedField('title')} onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Category + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger">
              <div className="animate-fade-in-left">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  name="category" value={formData.category} onChange={handleChange}
                  className={`${inputClass('category')} cursor-pointer appearance-none`}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                  onFocus={() => setFocusedField('category')} onBlur={() => setFocusedField(null)}
                >
                  {categories.map(c => <option key={c} value={c} className="bg-[#1e1b4b] text-white">{c}</option>)}
                </select>
              </div>
              <div className="animate-fade-in-right">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Location / City
                  {formData.location && <span className="ml-1 text-emerald-400">✓</span>}
                </label>
                <input
                  type="text" name="location" value={formData.location} onChange={handleChange} required
                  placeholder="e.g. Ghaziabad"
                  className={inputClass('location')}
                  onFocus={() => setFocusedField('location')} onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Description with char counter */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Detailed Description
                  {formData.description && <span className="ml-1 text-emerald-400">✓</span>}
                </label>
                <span className={`text-xs font-mono transition-colors duration-200 ${charCount > 400 ? 'text-red-400' : charCount > 200 ? 'text-amber-400' : 'text-slate-600'}`}>
                  {charCount}/500
                </span>
              </div>
              <textarea
                name="description" value={formData.description} onChange={handleChange} rows="4" required maxLength={500}
                placeholder="Describe the issue in detail so that our AI engine can analyze it accurately..."
                className={`${inputClass('description')} resize-y`}
                onFocus={() => setFocusedField('description')} onBlur={() => setFocusedField(null)}
              />
              {/* Character progress bar */}
              <div className="mt-1.5 h-1 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${charCount > 400 ? 'bg-red-500' : charCount > 200 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                     style={{ width: `${Math.min((charCount / 500) * 100, 100)}%` }}></div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-shake">
                <span>⚠️</span>
                <span className="text-red-400 text-sm font-medium">{error}</span>
              </div>
            )}
            {success && !loading && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-scale-in">
                <span className="animate-confetti">🎉</span>
                <span className="text-emerald-400 text-sm font-medium">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.97] btn-ripple"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  AI is Analyzing Your Complaint...
                </span>
              ) : '🚀 Submit & Analyze with AI'}
            </button>
          </form>
        </div>
      </div>

      {/* ========== AI ANALYSIS LOADING STATE ========== */}
      {aiStep >= 1 && aiStep < 6 && !aiResult && (
        <div className="w-full max-w-2xl mt-8 animate-fade-in-up">
          <div className="glass rounded-2xl p-8 border-indigo-400/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-lg animate-float">🤖</div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Processing</h3>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  Analyzing complaint
                  <span className="typing-indicator flex gap-1">
                    <span></span><span></span><span></span>
                  </span>
                </p>
              </div>
            </div>
            {/* Progress steps */}
            <div className="space-y-3">
              {[
                { step: 2, label: 'Detecting priority level...', icon: '🚨' },
                { step: 3, label: 'Recommending department...', icon: '🏢' },
                { step: 4, label: 'Generating summary...', icon: '📋' },
                { step: 5, label: 'Drafting auto-response...', icon: '✉️' }
              ].map((s) => (
                <div key={s.step} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-500 ${aiStep >= s.step ? 'bg-indigo-500/10 border border-indigo-500/15' : 'opacity-30'}`}>
                  <span>{aiStep >= s.step ? '✅' : s.icon}</span>
                  <span className={`text-sm ${aiStep >= s.step ? 'text-indigo-300 font-medium' : 'text-slate-600'}`}>{s.label}</span>
                  {aiStep === s.step && (
                    <svg className="w-4 h-4 animate-spin text-indigo-400 ml-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== AI ANALYSIS RESULTS ========== */}
      {aiResult && showAI && aiStep >= 2 && (
        <div ref={resultRef} className="w-full max-w-2xl mt-8 space-y-5">
          {/* Header Card */}
          <div className="glass rounded-2xl p-6 border-indigo-400/20 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-lg shadow-lg shadow-emerald-500/25 animate-confetti">
                  🤖
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Analysis Complete</h3>
                  <p className="text-xs text-slate-500">4 AI features processed • Saved to MongoDB</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${gp(aiResult.aiPriority).bg} ${gp(aiResult.aiPriority).text} border ${gp(aiResult.aiPriority).border} animate-scale-in`}>
                {gp(aiResult.aiPriority).icon} {aiResult.aiPriority}
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
            {/* 1. PRIORITY DETECTION */}
            {aiStep >= 2 && (
              <div className={`glass rounded-xl p-5 border ${gp(aiResult.aiPriority).border} card-interactive animate-fade-in-left`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🚨</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Priority Detection</span>
                </div>
                <p className={`text-3xl font-black ${gp(aiResult.aiPriority).text} mb-2`}>
                  {aiResult.aiPriority}
                </p>
                {/* Priority bar */}
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${gp(aiResult.aiPriority).bar} progress-bar`}
                       style={{ width: aiResult.aiPriority === 'High' ? '95%' : aiResult.aiPriority === 'Medium' ? '60%' : '30%' }}></div>
                </div>
                <p className="text-[10px] text-slate-600 mt-2">AI-classified urgency level</p>
              </div>
            )}

            {/* 2. DEPARTMENT RECOMMENDATION */}
            {aiStep >= 3 && (
              <div className="glass rounded-xl p-5 border border-cyan-500/20 card-interactive animate-fade-in-right">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🏢</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Dept. Recommendation</span>
                </div>
                <p className="text-lg font-bold text-cyan-400 mb-1">
                  <TypingText text={aiResult.aiDepartment} speed={40} />
                </p>
                <p className="text-[10px] text-slate-600">Auto-routed by AI classifier</p>
              </div>
            )}
          </div>

          {/* 3. SUMMARY GENERATION */}
          {aiStep >= 4 && (
            <div className="glass rounded-xl p-5 border border-indigo-500/15 card-interactive animate-fade-in-up">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📋</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AI Summary Generation</span>
              </div>
              <blockquote className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-indigo-400 pl-4">
                "<TypingText text={aiResult.aiSummary} speed={20} />"
              </blockquote>
            </div>
          )}

          {/* 4. AUTO RESPONSE GENERATION */}
          {aiStep >= 5 && (
            <div className="glass rounded-xl overflow-hidden border border-emerald-500/15 card-interactive animate-fade-in-up">
              <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/8 border-b border-emerald-500/15">
                <span className="text-lg">✉️</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Auto Response Generation</span>
                <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">GENERATED</span>
              </div>
              <div className="px-5 py-3 bg-emerald-500/5 border-b border-emerald-500/10 font-mono text-xs text-slate-400 space-y-0.5">
                <p><span className="text-slate-600">To:</span> <span className="text-emerald-400">{aiResult.email}</span></p>
                <p><span className="text-slate-600">Subject:</span> <span className="text-white">Complaint Ref #{aiResult._id.slice(-6).toUpperCase()}</span></p>
              </div>
              <div className="px-5 py-4 bg-[#0d0b1e]">
                {aiResult.aiAutoResponse.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-slate-400 leading-relaxed font-mono">{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CitizenPortal;
