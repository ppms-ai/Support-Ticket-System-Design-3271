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
    attachment: null,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // submitTicket returns the newly created ticket and sets currentTicket in context
      submitTicket(formData);
      // navigate to confirmation page, which will pull currentTicket from context
      navigate('/confirmation');
    } catch (err) {
      console.error('Error submitting ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setFormData(prev => ({ ...prev, attachment: file }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-soft p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Submit Support Request</h1>
          <p className="text-slate-600">We're here to help! Please provide details about your issue and we'll get back to you soon.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  errors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-200`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                  errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-200`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Business Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business/Service <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.business}
              onChange={(e) => handleInputChange('business', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                errors.business ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-200`}
            >
              <option value="">Select a business/service</option>
              {BUSINESS_OPTIONS.map((business) => (
                <option key={business} value={business}>
                  {business}
                </option>
              ))}
            </select>
            {errors.business && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                {errors.business}
              </p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                errors.subject ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-200`}
              placeholder="Brief description of your issue"
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Priority Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRIORITY_OPTIONS.map((priority) => (
                <label
                  key={priority.value}
                  className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.priority === priority.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{priority.icon}</span>
                    <div>
                      <div className="font-medium text-slate-800">{priority.value}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                errors.description ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-200`}
              placeholder="Please provide detailed information about your issue, including any error messages, steps you've taken, and what you expected to happen..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attachment (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <div className="text-center">
                  <SafeIcon icon={FiPaperclip} className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-600">
                    {formData.attachment ? formData.attachment.name : 'Click to upload a file'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supported: Images, PDFs, Documents (Max 10MB)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <SafeIcon icon={FiSend} className="h-5 w-5" />
                <span>Submit Support Request</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default SubmitTicket;
