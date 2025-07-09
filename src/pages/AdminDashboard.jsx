import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';

const { FiFilter, FiDownload, FiUser, FiClock, FiMessageSquare, FiEdit3, FiSave, FiX, FiPlus, FiBarChart3, FiMail } = FiIcons;

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const BUSINESSES = [
  'Pivot & Prosper',
  'Chic AI',
  'PromptHerAI',
  'PerksPro+',
  'Business Automation Hub',
  'Setchfield Audio',
  'GROW Marketplace',
  'Other'
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { tickets, updateTicket, addNote, getTicketStats, sendCustomerNote } = useTickets();
  const [authChecked, setAuthChecked] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    business: '',
    assignee: ''
  });
  const [editingTicket, setEditingTicket] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/admin/login');
    } else if (isAuthenticated === true) {
      setAuthChecked(true);
    }
  }, [isAuthenticated, navigate]);

  if (!authChecked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const stats = getTicketStats();
  const filteredTickets = tickets.filter(ticket => {
    return (
      (!filters.status || ticket.status === filters.status) &&
      (!filters.priority || ticket.priority === filters.priority) &&
      (!filters.business || ticket.business === filters.business) &&
      (!filters.assignee || ticket.assignee === filters.assignee)
    );
  });

  const handleUpdateTicket = (ticketId, updates) => {
    updateTicket(ticketId, updates);
    if (editingTicket && editingTicket.id === ticketId) {
      setEditingTicket({ ...editingTicket, ...updates });
    }
  };

  const handleAddNote = async (ticketId) => {
    if (newNote.trim()) {
      await addNote(ticketId, newNote);
      // Send customer email if it's a public note
      if (isPublicNote) {
        await sendCustomerNote(ticketId, newNote, true);
      }
      setNewNote('');
      setIsPublicNote(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Ticket Number', 'Name', 'Email', 'Subject', 'Status', 'Priority', 'Business', 'Created At'];
    const csvData = [
      headers.join(','),
      ...filteredTickets.map(ticket => [
        ticket.ticket_number,
        ticket.name,
        ticket.email,
        `"${ticket.subject}"`,
        ticket.status,
        ticket.priority,
        ticket.business,
        format(new Date(ticket.created_at), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `support-tickets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-50 text-blue-600 border-blue-200',
      'In Progress': 'bg-warning-50 text-warning-600 border-warning-200',
      'Resolved': 'bg-success-50 text-success-600 border-success-200',
      'Closed': 'bg-slate-50 text-slate-600 border-slate-200'
    };
    return colors[status] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-success-50 text-success-600',
      'Medium': 'bg-warning-50 text-warning-600',
      'High': 'bg-danger-50 text-danger-600'
    };
    return colors[priority] || 'bg-slate-50 text-slate-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Support Dashboard</h1>
          <p className="text-slate-600">Manage and track all support tickets</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiFilter} className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <SafeIcon icon={FiDownload} className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Tickets</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <SafeIcon icon={FiBarChart3} className="h-8 w-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Open</p>
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-warning-600">{stats.inProgress}</p>
            </div>
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Resolved</p>
              <p className="text-2xl font-bold text-success-600">{stats.resolved}</p>
            </div>
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Closed</p>
              <p className="text-2xl font-bold text-slate-600">{stats.closed}</p>
            </div>
            <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-xl shadow-soft p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business</label>
              <select
                value={filters.business}
                onChange={(e) => setFilters(prev => ({ ...prev, business: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Businesses</option>
                {BUSINESSES.map(business => (
                  <option key={business} value={business}>{business}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Assignee</label>
              <input
                type="text"
                value={filters.assignee}
                onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Filter by assignee"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({ status: '', priority: '', business: '', assignee: '' })}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft p-12 text-center">
            <p className="text-slate-600">No tickets found matching your filters.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              layout
              className="bg-white rounded-xl shadow-soft p-6"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="font-mono text-sm bg-primary-50 text-primary-600 px-2 py-1 rounded">
                      {ticket.ticket_number}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{ticket.subject}</h3>
                  <p className="text-slate-600 mb-4 line-clamp-2">{ticket.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiUser} className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{ticket.name} ({ticket.email})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiClock} className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-600">Business: {ticket.business}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                  <button
                    onClick={() => setEditingTicket(editingTicket?.id === ticket.id ? null : ticket)}
                    className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit3} className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Edit Panel */}
              {editingTicket?.id === ticket.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-t border-slate-200 mt-6 pt-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select
                        value={editingTicket.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setEditingTicket(prev => ({ ...prev, status: newStatus }));
                          handleUpdateTicket(ticket.id, { status: newStatus });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                      <select
                        value={editingTicket.priority}
                        onChange={(e) => {
                          const newPriority = e.target.value;
                          setEditingTicket(prev => ({ ...prev, priority: newPriority }));
                          handleUpdateTicket(ticket.id, { priority: newPriority });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {PRIORITIES.map(priority => (
                          <option key={priority} value={priority}>{priority}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
                      <input
                        type="text"
                        value={editingTicket.assignee || ''}
                        onChange={(e) => {
                          const newAssignee = e.target.value;
                          setEditingTicket(prev => ({ ...prev, assignee: newAssignee }));
                          handleUpdateTicket(ticket.id, { assignee: newAssignee });
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Assign to team member"
                      />
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Notes & Updates</label>
                    {ticket.notes && ticket.notes.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {ticket.notes.map((note) => (
                          <div key={note.id} className="bg-slate-50 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-slate-700">{note.author}</span>
                              <span className="text-xs text-slate-500">
                                {format(new Date(note.created_at), 'MMM dd, yyyy h:mm a')}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm">{note.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`public-${ticket.id}`}
                          checked={isPublicNote}
                          onChange={(e) => setIsPublicNote(e.target.checked)}
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor={`public-${ticket.id}`} className="text-sm text-slate-700 flex items-center space-x-1">
                          <SafeIcon icon={FiMail} className="h-4 w-4" />
                          <span>Email customer with this update</span>
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder={isPublicNote ? "Add update for customer..." : "Add internal note..."}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddNote(ticket.id)}
                        />
                        <button
                          onClick={() => handleAddNote(ticket.id)}
                          className="flex items-center space-x-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                        >
                          <SafeIcon icon={FiPlus} className="h-4 w-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;