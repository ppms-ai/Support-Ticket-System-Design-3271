import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTickets } from '../context/TicketContext';

const { FiSearch, FiClock, FiUser, FiMessageSquare, FiAlertCircle } = FiIcons;

const CheckStatus = () => {
  const { findTicket } = useTickets();
  const [searchData, setSearchData] = useState({
    ticketNumber: '',
    email: ''
  });
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setTicket(null);
    setIsSearching(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundTicket = findTicket(searchData.ticketNumber, searchData.email);
      
      if (foundTicket) {
        setTicket(foundTicket);
      } else {
        setError('No ticket found with the provided ticket number and email address.');
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-50 text-blue-600',
      'In Progress': 'bg-warning-50 text-warning-600',
      'Resolved': 'bg-success-50 text-success-600',
      'Closed': 'bg-slate-50 text-slate-600'
    };
    return colors[status] || 'bg-slate-50 text-slate-600';
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-soft p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Check Ticket Status</h1>
          <p className="text-slate-600">Enter your ticket number and email address to view your support request status.</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ticket Number
              </label>
              <input
                type="text"
                value={searchData.ticketNumber}
                onChange={(e) => setSearchData(prev => ({ ...prev, ticketNumber: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="e.g., SUP-123456"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={searchData.email}
                onChange={(e) => setSearchData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSearching}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSearch} className="h-5 w-5" />
                  <span>Search Ticket</span>
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-6"
          >
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-center space-x-2">
              <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-danger-600" />
              <p className="text-danger-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Ticket Details */}
        {ticket && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-slate-200 rounded-xl p-6"
          >
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">{ticket.subject}</h2>
                <p className="text-slate-600 mb-4">{ticket.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">Ticket:</span>
                    <span className="font-mono font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                      {ticket.ticketNumber}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">Status:</span>
                    <span className={`px-2 py-1 rounded font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">Priority:</span>
                    <span className={`px-2 py-1 rounded font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={FiClock} className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Created</span>
                </div>
                <p className="text-slate-800">
                  {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-slate-500">
                  {format(new Date(ticket.createdAt), 'h:mm a')}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={FiUser} className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Business</span>
                </div>
                <p className="text-slate-800">{ticket.business}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={FiClock} className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Last Updated</span>
                </div>
                <p className="text-slate-800">
                  {format(new Date(ticket.updatedAt), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-slate-500">
                  {format(new Date(ticket.updatedAt), 'h:mm a')}
                </p>
              </div>
            </div>

            {/* Notes */}
            {ticket.notes && ticket.notes.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <SafeIcon icon={FiMessageSquare} className="h-5 w-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Updates</h3>
                </div>
                <div className="space-y-3">
                  {ticket.notes.map((note) => (
                    <div key={note.id} className="bg-primary-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-primary-700">{note.author}</span>
                        <span className="text-sm text-primary-600">
                          {format(new Date(note.createdAt), 'MMM dd, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-slate-700">{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="mt-6 p-4 bg-primary-50 rounded-xl">
              <p className="text-sm text-primary-700">
                <strong>Need to add more information?</strong> Reply to your confirmation email or call us at (555) 123-4567 
                and reference ticket number <strong>{ticket.ticketNumber}</strong>
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckStatus;