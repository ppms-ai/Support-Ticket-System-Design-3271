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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      submitTicket(formData);
      navigate('/confirmation');
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-soft p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Submit Support Request</h1>
          <p className="text-slate-600">We're here to help! Fill out the form below and we'll get back to you soon.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-danger-300 bg-danger-50' : 'border-slate-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600 flex items-center">
                  <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.email ? 'border-danger-300 bg-danger-50' : 'border-slate-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600 flex items-center">
                  <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Business & Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select which business/service *
              </label>
              <select
                value={formData.business}
                onChange={(e) => handleInputChange('business', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  errors.business ? 'border-danger-300 bg-danger-50' : 'border-slate-300'
                }`}
              >
                <option value="">Select which business/service</option>
                {BUSINESS_OPTIONS.map(business => (
                  <option key={business} value={business}>{business}</option>
                ))}
              </select>
              {errors.business && (
                <p className="mt-1 text-sm text-danger-600 flex items-center">
                  <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                  {errors.business}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITY_OPTIONS.map(({ value, color, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleInputChange('priority', value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.priority === value
                        ? `border-current ${color}`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{icon}</div>
                      <div className="text-sm font-medium">{value}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                errors.subject ? 'border-danger-300 bg-danger-50' : 'border-slate-300'
              }`}
              placeholder="Brief description of your issue"
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-danger-600 flex items-center">
                <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={5}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none ${
                errors.description ? 'border-danger-300 bg-danger-50' : 'border-slate-300'
              }`}
              placeholder="Please provide detailed information about your issue..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-danger-600 flex items-center">
                <SafeIcon icon={FiAlertCircle} className="h-4 w-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attachment (optional)
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="attachment"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="attachment"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl cursor-pointer hover:border-slate-400 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiPaperclip} className="h-5 w-5 text-slate-500" />
                <span className="text-slate-600">
                  {formData.attachment ? formData.attachment.name : 'Choose file...'}
                </span>
              </label>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Supported formats: JPG, PNG, PDF, DOC, DOCX, TXT (Max 10MB)
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
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