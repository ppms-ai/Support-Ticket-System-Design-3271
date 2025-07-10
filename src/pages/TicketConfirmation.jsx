import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTickets } from '../context/TicketContext';

const { FiCheckCircle, FiMail, FiClock, FiArrowLeft, FiSearch } = FiIcons;

const TicketConfirmation = () => {
  const navigate = useNavigate();
  const { currentTicket } = useTickets();

  useEffect(() => {
    // if someone lands here without submitting, kick back to form
    if (!currentTicket) navigate('/');
  }, [currentTicket, navigate]);

  if (!currentTicket) return null;

  const priorityColors = {
    'Low': 'text-success-600 bg-success-50',
    'Medium': 'text-warning-600 bg-warning-50',
    'High': 'text-danger-600 bg-danger-50'
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-soft p-8 text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <SafeIcon icon={FiCheckCircle} className="h-10 w-10 text-success-600" />
        </motion.div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Ticket Submitted Successfully!
        </h1>
        <p className="text-slate-600 mb-8">
          Thank you for contacting us. We've received your support request and will get back to you soon.
        </p>

        {/* Ticket Details Card */}
        <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Ticket Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Ticket Number:</span>
              <span className="font-mono font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                {currentTicket.ticket_number}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Subject:</span>
              <span className="font-medium text-slate-800 max-w-xs text-right">
                {currentTicket.subject}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Priority:</span>
              <span className={`px-3 py-1 rounded-lg font-medium ${priorityColors[currentTicket.priority]}`}>
                {currentTicket.priority}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Business:</span>
              <span className="font-medium text-slate-800 max-w-xs text-right">
                {currentTicket.business}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Status:</span>
              <span className="px-3 py-1 rounded-lg font-medium bg-blue-50 text-blue-600">
                {currentTicket.status}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-primary-50 rounded-xl p-4">
            <SafeIcon icon={FiMail} className="h-6 w-6 text-primary-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-800 mb-1">Email Confirmation</h3>
            <p className="text-sm text-slate-600">
              A confirmation email has been sent to {currentTicket.email}
            </p>
          </div>

          <div className="bg-warning-50 rounded-xl p-4">
            <SafeIcon icon={FiClock} className="h-6 w-6 text-warning-600 mx-auto mb-2" />
            <h3 className="font-semibold text-slate-800 mb-1">Response Time</h3>
            <p className="text-sm text-slate-600">
              We typically respond within 24 hours during business days
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/status"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors space-x-2"
          >
            <SafeIcon icon={FiSearch} className="h-5 w-5" />
            <span>Check Ticket Status</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors space-x-2"
          >
            <SafeIcon icon={FiArrowLeft} className="h-5 w-5" />
            <span>Submit Another Ticket</span>
          </Link>
        </div>

        {/* Important Note */}
        <div className="mt-8 p-4 bg-slate-100 rounded-xl">
          <p className="text-sm text-slate-600">
            <strong>Important:</strong> Please save your ticket number{' '}
            <strong>{currentTicket.ticket_number}</strong> for future reference. 
            You'll need it to check your ticket status or when contacting our support team.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TicketConfirmation;
