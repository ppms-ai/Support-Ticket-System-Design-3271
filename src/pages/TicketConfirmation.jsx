import React from 'react';
import { useTickets } from '../context/TicketContext';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';

const priorityColors = {
  Low: 'bg-success-100 text-success-700',
  Medium: 'bg-warning-100 text-warning-700',
  High: 'bg-danger-100 text-danger-700'
};

const TicketConfirmation = () => {
  const { currentTicket } = useTickets();

  if (!currentTicket) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-lg text-slate-600 mb-4">Oops! We couldn't find your ticket details.</p>
        <Link to="/" className="text-primary-600 font-medium hover:underline">
          Go back to submit a ticket
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SafeIcon icon={FiCheckCircle} className="h-10 w-10 text-success-600" />
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Ticket Submitted Successfully!</h1>
      <p className="text-slate-600 mb-8">
        Thank you for contacting us. We’ve received your support request and will get back to you soon.
      </p>

      <div className="bg-slate-50 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Ticket Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Ticket Number</span>
            <span className="font-mono font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
              {currentTicket.ticket_number}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Subject</span>
            <span className="font-medium text-slate-800">{currentTicket.subject}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Priority</span>
            <span className={`px-3 py-1 rounded-lg font-medium ${priorityColors[currentTicket.priority]}`}>
              {currentTicket.priority}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Business</span>
            <span className="font-medium text-slate-800">{currentTicket.business}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center mb-6">
        <Link to="/status" className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors">
          <SafeIcon icon={FiSearch} className="h-5 w-5 mr-2" />
          Check Ticket Status
        </Link>
        <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
          <SafeIcon icon={FiArrowLeft} className="h-5 w-5 mr-2" />
          Submit Another Ticket
        </Link>
      </div>

      <div className="mt-8 p-4 bg-slate-100 rounded-xl text-sm text-slate-600">
        <strong>Important:</strong> Please save your ticket number <strong>{currentTicket.ticket_number}</strong> for future reference.
      </div>
    </motion.div>
  );
};

export default TicketConfirmation;
