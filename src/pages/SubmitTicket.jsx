import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useTickets } from '../context/TicketContext';

const { FiSend, FiPaperclip, FiAlertCircle } = FiIcons;

const BUSINESS_OPTIONS = [
  'Pivot & Prosper',
  'Chic AI',
  'PromptHerAI',
  'PerksPro+',
  'Business Automation Hub',
  'Setchfield Audio',
  'GROW Marketplace',
  'Other'
];

const PRIORITY_OPTIONS = [
  { value: 'Low', color: 'text-success-600 bg-success-50', icon: '🟢' },
  { value: 'Medium', color: 'text-warning-600 bg-warning-50', icon: '🟡' },
  { value: 'High', color: 'text-danger-600 bg-danger-50', icon: '🔴' }
];

export default function SubmitTicket() {
  const navigate = useNavigate();
  const { submitTicket } = useTickets();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    priority: 'Medium',
    business: '',
    attachment: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email is invalid';
    if (!formData.subject.trim()) errs.subject = 'Subject is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.business) errs.business = 'Please select a business/service';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const ticket = submitTicket(formData);
      // send them to confirmation, carrying the full ticket object:
      navigate('/confirmation', { state: { ticket } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInput = (field, value) => {
    setFormData(fd => ({ ...fd, [field]: value }));
    if (errors[field]) setErrors(es => ({ ...es, [field]: '' }));
  };

  const handleFile = e => {
    const file = e.target.files[0];
    setFormData(fd => ({ ...fd, attachment: file }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-soft p-8"
      >
        {/* ————— Your full form UI goes here, wiring inputs like: ————— */}
        {/* <input value={formData.name} onChange={e => handleInput('name', e.target.value)} /> */}
        {/* <select value={formData.business} onChange={e => handleInput('business', e.target.value)}>… */}
        {/* <input type="file" onChange={handleFile} /> */}
        {/* …and your Submit button: */}
        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-medium py-4 rounded-xl"
        >
          {isSubmitting
            ? 'Submitting…'
            : <>
                <SafeIcon icon={FiSend} className="h-5 w-5 mr-2" />
                Submit Support Request
              </>}
        </motion.button>
      </motion.div>
    </div>
  );
}
