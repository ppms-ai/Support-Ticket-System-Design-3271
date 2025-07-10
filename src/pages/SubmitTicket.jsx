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
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.business) newErrors.business = 'Please select a business/service';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      // call context, get back the new ticket object:
      const ticket = await submitTicket(formData);
      // pass it into router state so Confirmation can read it immediately
      navigate('/confirmation', { state: { ticket } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setFormData(f => ({ ...f, attachment: file }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-soft p-8"
      >
        {/* ————— your form UI ————— */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* … copy in all your inputs/buttons here, wiring them to handleInputChange / handleFileChange … */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-medium py-4 px-6 rounded-xl"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Support Request'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
