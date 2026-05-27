"use client";
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Mail, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Search, 
  TrendingUp, 
  Clock, 
  Award, 
  AlertCircle, 
  FileText,
  User,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Copy,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  // State variables
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, highest-salary, interview-date
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // Triggers details modal
  const [isEditing, setIsEditing] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  
  // Drag and drop visual state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  
  // Form states
  const [addForm, setAddForm] = useState({
    companyName: '',
    jobTitle: '',
    status: 'Applied',
    salary: '',
    location: 'Remote',
    jobUrl: '',
    notes: '',
    interviewDate: '',
    contactName: '',
    contactEmail: ''
  });
  
  const [editForm, setEditForm] = useState({
    id: null,
    companyName: '',
    jobTitle: '',
    status: 'Applied',
    salary: '',
    location: 'Remote',
    jobUrl: '',
    notes: '',
    interviewDate: '',
    contactName: '',
    contactEmail: ''
  });

  // Load jobs from Spring Boot API
  useEffect(() => {
    fetchJobs();
  }, []);

  // Sync filtered jobs when search, location, or sort changes
  useEffect(() => {
    let result = [...jobs];
    
    // 1. Text Search (Company & Title)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.companyName?.toLowerCase().includes(q) || 
        job.jobTitle?.toLowerCase().includes(q)
      );
    }
    
    // 2. Location Filter
    if (locationFilter !== 'All') {
      result = result.filter(job => job.location === locationFilter);
    }
    
    // 3. Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0));
    } else if (sortBy === 'highest-salary') {
      result.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    } else if (sortBy === 'interview-date') {
      // Jobs with interviews first, sorted ascending by closeness
      result.sort((a, b) => {
        if (!a.interviewDate) return 1;
        if (!b.interviewDate) return -1;
        return new Date(a.interviewDate) - new Date(b.interviewDate);
      });
    }
    
    setFilteredJobs(result);
  }, [jobs, searchQuery, locationFilter, sortBy]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/jobs');
      if (response.ok) {
        const data = await response.json();
        // Clean status fields for backward compatibility
        const sanitized = data.map(job => ({
          ...job,
          status: job.status === 'Offers' ? 'Offered' : job.status,
          location: job.location || 'Remote',
          salary: job.salary || null
        }));
        setJobs(sanitized);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add application submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...addForm,
        salary: addForm.salary ? parseFloat(addForm.salary) : null,
        interviewDate: addForm.interviewDate || null,
        // Match the legacy "Offers" status dynamically backend-side, but keep code clean
        status: addForm.status
      };
      
      const response = await fetch('http://localhost:8080/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setShowAddModal(false);
        setAddForm({
          companyName: '',
          jobTitle: '',
          status: 'Applied',
          salary: '',
          location: 'Remote',
          jobUrl: '',
          notes: '',
          interviewDate: '',
          contactName: '',
          contactEmail: ''
        });
        fetchJobs();
      }
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  // Edit/Update application submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.id) return;
    
    try {
      const payload = {
        ...editForm,
        salary: editForm.salary ? parseFloat(editForm.salary) : null,
        interviewDate: editForm.interviewDate || null
      };

      const response = await fetch(`http://localhost:8080/api/jobs/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updated = await response.json();
        // Standardize status for front-end columns
        updated.status = updated.status === 'Offers' ? 'Offered' : updated.status;
        
        setJobs(prev => prev.map(j => j.id === editForm.id ? updated : j));
        setSelectedJob(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating job application:", error);
    }
  };

  // Delete application
  const handleDeleteJob = async (id) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setJobs(prev => prev.filter(j => j.id !== id));
        setSelectedJob(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error deleting job application:", error);
    }
  };

  // Copy HR Email Action
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  // Start edit mode
  const startEditing = (job) => {
    setEditForm({
      id: job.id,
      companyName: job.companyName || '',
      jobTitle: job.jobTitle || '',
      status: job.status || 'Applied',
      salary: job.salary ? job.salary.toString() : '',
      location: job.location || 'Remote',
      jobUrl: job.jobUrl || '',
      notes: job.notes || '',
      interviewDate: job.interviewDate || '',
      contactName: job.contactName || '',
      contactEmail: job.contactEmail || ''
    });
    setIsEditing(true);
  };

  // --- Drag and Drop Logic ---
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id.toString());
    setDraggingId(id);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData("text/plain");
    const id = parseInt(idStr, 10);
    
    setDragOverColumn(null);
    setDraggingId(null);
    
    if (!id) return;
    
    const originalJob = jobs.find(j => j.id === id);
    if (!originalJob || originalJob.status === targetStatus) return;
    
    // Optimistic UI update for instant feedback
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: targetStatus } : j));
    
    try {
      const updatedJob = { ...originalJob, status: targetStatus };
      const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJob)
      });
      
      if (!response.ok) {
        throw new Error("API return code error");
      }
    } catch (error) {
      console.error("Error dropping and saving:", error);
      // Revert optimistic update on failure
      setJobs(prev => prev.map(j => j.id === id ? originalJob : j));
      alert("Oops! Could not save status change. Restoring column position.");
    }
  };

  // --- Metrics calculation ---
  const totalCount = jobs.length;
  const interviewingCount = jobs.filter(j => j.status === 'Interviewing').length;
  const offeredCount = jobs.filter(j => j.status === 'Offered' || j.status === 'Offers').length;
  const rejectedCount = jobs.filter(j => j.status === 'Rejected').length;
  const offerRate = totalCount > 0 ? Math.round((offeredCount / totalCount) * 100) : 0;

  // Kanban Columns List
  const COLUMNS = [
    { id: 'Applied', title: 'Applied', color: 'blue', border: 'border-blue-500/30', glow: 'var(--card-glow-applied)' },
    { id: 'Interviewing', title: 'Interviewing', color: 'yellow', border: 'border-yellow-500/30', glow: 'var(--card-glow-interviewing)' },
    { id: 'Offered', title: 'Offered', color: 'emerald', border: 'border-emerald-500/30', glow: 'var(--card-glow-offered)' },
    { id: 'Rejected', title: 'Rejected', color: 'rose', border: 'border-rose-500/30', glow: 'var(--card-glow-rejected)' }
  ];

  return (
    <div className="relative min-h-screen bg-[#090b11] text-slate-100 p-6 md:p-10 font-sans">
      {/* Decorative ambient neon background glows */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-xl shadow-lg shadow-indigo-500/20">
                <Briefcase className="w-6 h-6 text-[#090b11] stroke-[2.5]" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                CareerSuite
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-2 font-light">
              Elevate your career search. Track, manage, and ace your university job applications.
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-slate-900 font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 transform active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Add Application
          </button>
        </div>

        {/* TOP STATISTICS DASHBOARD */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Card 1: Total */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-28">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold tracking-wider uppercase">
              Total Tracker
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-3xl font-bold font-mono">{totalCount}</span>
              <span className="text-slate-400 text-xs ml-1.5 font-light">applications</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* Card 2: Interviewing */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-28">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold tracking-wider uppercase">
              Interviews
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <span className="text-3xl font-bold font-mono text-yellow-400">{interviewingCount}</span>
              <span className="text-slate-400 text-xs ml-1.5 font-light">active</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* Card 3: Offered */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-28">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold tracking-wider uppercase">
              Offers Received
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-3xl font-bold font-mono text-emerald-400">{offeredCount}</span>
              <span className="text-slate-400 text-xs ml-1.5 font-light">secured</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* Card 4: Rejected */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between h-28">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold tracking-wider uppercase">
              Rejections
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <span className="text-3xl font-bold font-mono text-rose-500">{rejectedCount}</span>
              <span className="text-slate-400 text-xs ml-1.5 font-light">closed</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>

          {/* Card 5: Conversion Rate */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 col-span-2 lg:col-span-1 relative overflow-hidden flex flex-col justify-between h-28">
            <div className="flex justify-between items-center text-slate-400 text-xs font-semibold tracking-wider uppercase">
              Offer Conversion
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-3xl font-bold font-mono text-cyan-400">{offerRate}%</span>
              <span className="text-slate-400 text-xs ml-1.5 font-light">success rate</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </div>

        {/* SEARCH, SORT & FILTERS BAR */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by company or role title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Location filter dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-white/5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value="All" className="bg-[#090b11]">All Formats</option>
                <option value="Remote" className="bg-[#090b11]">Remote</option>
                <option value="Hybrid" className="bg-[#090b11]">Hybrid</option>
                <option value="Onsite" className="bg-[#090b11]">Onsite</option>
              </select>
            </div>

            {/* Sort options dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-white/5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest" className="bg-[#090b11]">Newest Applied</option>
                <option value="highest-salary" className="bg-[#090b11]">Highest Pay</option>
                <option value="interview-date" className="bg-[#090b11]">Nearest Interview</option>
              </select>
            </div>
          </div>
        </div>

        {/* DRAG AND DROP KANBAN BOARD */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm mt-4 font-light animate-pulse">Syncing Workspace...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {COLUMNS.map(col => {
              const colJobs = filteredJobs.filter(job => job.status === col.id);
              const isOver = dragOverColumn === col.id;
              
              return (
                <div 
                  key={col.id} 
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className={`glass-panel p-4 rounded-2xl border ${isOver ? 'column-drag-over' : 'border-white/5'} min-h-[550px] transition-all duration-200`}
                  style={{ boxShadow: isOver ? `0 0 25px ${col.glow}` : 'none' }}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        col.id === 'Applied' ? 'bg-blue-400' :
                        col.id === 'Interviewing' ? 'bg-yellow-400' :
                        col.id === 'Offered' ? 'bg-emerald-400' : 'bg-rose-500'
                      }`}></span>
                      <h2 className="font-semibold text-sm tracking-wide uppercase text-slate-300">
                        {col.title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white/5 text-slate-400 px-2 py-0.5 rounded-md">
                      {colJobs.length}
                    </span>
                  </div>

                  {/* Cards container */}
                  <div className="space-y-3.5 min-h-[450px]">
                    {colJobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-600 border border-dashed border-white/5 rounded-xl min-h-[200px]">
                        <p className="text-xs font-light">Drag cards here</p>
                      </div>
                    ) : (
                      colJobs.map(job => (
                        <div
                          key={job.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, job.id)}
                          onClick={() => setSelectedJob(job)}
                          className={`glass-panel p-4 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-slate-500/30 transition-all duration-200 group relative ${
                            draggingId === job.id ? 'card-dragging' : 'hover:-translate-y-0.5'
                          }`}
                        >
                          {/* Card Content */}
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1 leading-snug">
                              {job.jobTitle}
                            </h3>
                            {/* Hover details button */}
                            <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all -translate-x-1 group-hover:translate-x-0" />
                          </div>
                          
                          <p className="text-slate-400 text-xs font-medium mb-3">
                            {job.companyName}
                          </p>

                          {/* Detail Badges */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* Location Badge */}
                            <span className="flex items-center gap-1 text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                              <MapPin className="w-2.5 h-2.5 text-indigo-400" />
                              {job.location}
                            </span>

                            {/* Salary Badge */}
                            {job.salary && (
                              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                                <DollarSign className="w-2.5 h-2.5" />
                                {job.salary.toLocaleString()}
                              </span>
                            )}

                            {/* Interview Badge */}
                            {job.interviewDate && job.status === 'Interviewing' && (
                              <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/5 px-2 py-0.5 rounded-full border border-yellow-500/10 animate-pulse">
                                <Calendar className="w-2.5 h-2.5" />
                                {job.interviewDate}
                              </span>
                            )}

                            {/* Notes indicator */}
                            {job.notes && (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 border border-white/5" title="Has prep notes">
                                <FileText className="w-2.5 h-2.5 text-slate-400" />
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-3.5 pt-2.5 border-t border-white/5 text-[10px] text-slate-500">
                            <span>Applied: {job.appliedDate}</span>
                            
                            {/* Direct Delete button on card */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJob(job.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-rose-500 p-1 rounded hover:bg-white/5 transition-all duration-200 cursor-pointer"
                              title="Delete application"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: ADD APPLICATION */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
              
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 hover:bg-white/5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Plus className="w-5 h-5 text-indigo-400 stroke-[2.5]" />
                </div>
                <h2 className="text-xl font-bold">New Job Application</h2>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Job Title *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Software Engineer Intern"
                      value={addForm.jobTitle} 
                      onChange={(e) => setAddForm({...addForm, jobTitle: e.target.value})}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Company *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Google"
                      value={addForm.companyName} 
                      onChange={(e) => setAddForm({...addForm, companyName: e.target.value})}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                    <select 
                      value={addForm.status}
                      onChange={(e) => setAddForm({...addForm, status: e.target.value})}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Workplace</label>
                    <select 
                      value={addForm.location}
                      onChange={(e) => setAddForm({...addForm, location: e.target.value})}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Salary (Monthly)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 50000"
                      value={addForm.salary} 
                      onChange={(e) => setAddForm({...addForm, salary: e.target.value})}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vacancy Link (URL)</label>
                  <input 
                    type="url" 
                    placeholder="https://linkedin.com/jobs/..."
                    value={addForm.jobUrl} 
                    onChange={(e) => setAddForm({...addForm, jobUrl: e.target.value})}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Recruiter Name</label>
                    <input 
                      type="text" 
                      placeholder="HR Executive Name"
                      value={addForm.contactName} 
                      onChange={(e) => setAddForm({...addForm, contactName: e.target.value})}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Recruiter Email</label>
                    <input 
                      type="email" 
                      placeholder="hr@company.com"
                      value={addForm.contactEmail} 
                      onChange={(e) => setAddForm({...addForm, contactEmail: e.target.value})}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Interview Date</label>
                  <input 
                    type="date" 
                    value={addForm.interviewDate} 
                    onChange={(e) => setAddForm({...addForm, interviewDate: e.target.value})}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prep Notes / Key Requirements</label>
                  <textarea 
                    rows="3"
                    placeholder="Enter technologies, interview formats, or checklist details..."
                    value={addForm.notes} 
                    onChange={(e) => setAddForm({...addForm, notes: e.target.value})}
                    className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm transition font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-indigo-500 hover:bg-indigo-600 text-slate-900 font-semibold px-5 py-2 rounded-xl transition shadow-lg shadow-indigo-500/10 cursor-pointer"
                  >
                    Save Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: APPLICATION DETAILS & NOTE EDITING */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-panel border-white/10 p-6 md:p-8 rounded-2xl w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              
              <button 
                onClick={() => {
                  setSelectedJob(null);
                  setIsEditing(false);
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 p-1 hover:bg-white/5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                    selectedJob.status === 'Applied' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    selectedJob.status === 'Interviewing' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    selectedJob.status === 'Offered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {selectedJob.status}
                  </span>
                  <span className="text-slate-500 text-xs font-light font-mono">ID: {selectedJob.id}</span>
                </div>
                
                {!isEditing ? (
                  <>
                    <h2 className="text-2xl font-extrabold text-white leading-tight">{selectedJob.jobTitle}</h2>
                    <p className="text-slate-400 text-base font-semibold mt-1">{selectedJob.companyName}</p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 mt-4 text-indigo-400">
                    <Edit className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Editing Mode</span>
                  </div>
                )}
              </div>

              {!isEditing ? (
                /* READ-ONLY VIEW */
                <div className="space-y-6">
                  
                  {/* Grid details */}
                  <div className="grid grid-cols-2 gap-5 bg-slate-900/40 p-4 rounded-xl border border-white/5 text-sm">
                    {/* Location */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Workplace</p>
                        <p className="text-slate-200 font-medium">{selectedJob.location}</p>
                      </div>
                    </div>

                    {/* Salary */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Allow Allowance</p>
                        <p className="text-emerald-400 font-bold font-mono">
                          {selectedJob.salary ? `${selectedJob.salary.toLocaleString()}` : "Not Specified"}
                        </p>
                      </div>
                    </div>

                    {/* Applied Date */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Applied Date</p>
                        <p className="text-slate-200 font-medium">{selectedJob.appliedDate}</p>
                      </div>
                    </div>

                    {/* Interview Date */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Interview Schedule</p>
                        <p className={`font-semibold ${selectedJob.interviewDate ? 'text-yellow-400' : 'text-slate-400 font-light'}`}>
                          {selectedJob.interviewDate ? selectedJob.interviewDate : "None Scheduled"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recruiter / URL Links */}
                  <div className="flex flex-wrap gap-4 items-center justify-between border-t border-b border-white/5 py-4">
                    {/* Recruiter info */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs font-semibold">{selectedJob.contactName || "Recruiter Unnamed"}</p>
                        
                        {selectedJob.contactEmail ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-slate-500 text-xs font-mono">{selectedJob.contactEmail}</span>
                            <button 
                              onClick={() => copyToClipboard(selectedJob.contactEmail)}
                              className="text-slate-400 hover:text-cyan-400 transition"
                              title="Copy email to clipboard"
                            >
                              {emailCopied ? (
                                <span className="text-[10px] text-cyan-400 font-bold uppercase">Copied!</span>
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <p className="text-slate-600 text-xs font-light">No email added</p>
                        )}
                      </div>
                    </div>

                    {/* Link button */}
                    {selectedJob.jobUrl ? (
                      <a 
                        href={selectedJob.jobUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#090b11] bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-500 hover:to-indigo-600 font-semibold px-4 py-2 rounded-xl transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Visit Vacancy Link
                      </a>
                    ) : (
                      <button disabled className="flex items-center gap-1.5 text-xs text-slate-600 bg-white/5 border border-white/5 cursor-not-allowed px-4 py-2 rounded-xl">
                        No vacancy URL listed
                      </button>
                    )}
                  </div>

                  {/* Notes / Preparation section */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Preparation & Interview Notes
                    </h3>
                    <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 min-h-[120px] whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-light font-mono">
                      {selectedJob.notes || "No study plans or prep checklist written yet. Click 'Edit Application' below to start drafting interview preparation notes or key requirements!"}
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleDeleteJob(selectedJob.id)}
                      className="flex items-center gap-2 text-xs text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 px-3 py-2 rounded-xl border border-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete App
                    </button>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setSelectedJob(null);
                        }}
                        className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm transition font-medium"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => startEditing(selectedJob)}
                        className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        <Edit className="w-4 h-4 text-cyan-400" />
                        Edit Application
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                /* EDITING VIEW FORM */
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Job Title</label>
                      <input 
                        type="text" 
                        required 
                        value={editForm.jobTitle} 
                        onChange={(e) => setEditForm({...editForm, jobTitle: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Company</label>
                      <input 
                        type="text" 
                        required 
                        value={editForm.companyName} 
                        onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                      <select 
                        value={editForm.status}
                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Workplace</label>
                      <select 
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Onsite">Onsite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Salary (Allowance)</label>
                      <input 
                        type="number" 
                        value={editForm.salary} 
                        onChange={(e) => setEditForm({...editForm, salary: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Vacancy Link</label>
                    <input 
                      type="url" 
                      value={editForm.jobUrl} 
                      onChange={(e) => setEditForm({...editForm, jobUrl: e.target.value})}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Recruiter Name</label>
                      <input 
                        type="text" 
                        value={editForm.contactName} 
                        onChange={(e) => setEditForm({...editForm, contactName: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Recruiter Email</label>
                      <input 
                        type="email" 
                        value={editForm.contactEmail} 
                        onChange={(e) => setEditForm({...editForm, contactEmail: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Interview Date</label>
                      <input 
                        type="date" 
                        value={editForm.interviewDate} 
                        onChange={(e) => setEditForm({...editForm, interviewDate: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date Applied</label>
                      <input 
                        type="date" 
                        required
                        value={editForm.appliedDate} 
                        onChange={(e) => setEditForm({...editForm, appliedDate: e.target.value})}
                        className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Prep Checklist / Interview Notes</label>
                    <textarea 
                      rows="5"
                      value={editForm.notes} 
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      className="w-full bg-slate-900/60 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono leading-relaxed"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm transition font-medium"
                    >
                      Discard changes
                    </button>
                    <button 
                      type="submit" 
                      className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 font-semibold px-5 py-2 rounded-xl transition shadow-lg shadow-cyan-500/10 cursor-pointer"
                    >
                      Save changes
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}