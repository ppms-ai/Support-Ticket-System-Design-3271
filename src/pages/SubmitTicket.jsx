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

const SubmitTicket = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // optional fake delay
      await submitTicket(formData); // ✅ Await this to ensure ticket is set in context
      navigate('/confirmation'); // ✅ Confirmation page will use currentTicket from context
    } catch (error) {
      console.error('Error submitting ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, attachment: file }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* You can now safely use formData, handleInputChange, and handleSubmit in your UI */}
      {/* If you want, I can also provide the full form JSX again based on Tailwind + your design */}
    </div>
  );
};

export default SubmitTicket;
