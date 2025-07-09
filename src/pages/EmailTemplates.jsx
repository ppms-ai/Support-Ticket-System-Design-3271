import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useEmailTemplates } from '../context/EmailTemplateContext';

const {
  FiMail,
  FiEdit3,
  FiEye,
  FiSave,
  FiSettings,
  FiCode,
  FiPalette,
  FiMonitor
} = FiIcons;

const EmailTemplates = () => {
  const {
    templates,
    brandingConfig,
    saveTemplate,
    saveBrandingConfig,
    getTemplate,
    previewTemplate
  } = useEmailTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [localBranding, setLocalBranding] = useState(brandingConfig);

  useEffect(() => {
    setLocalBranding(brandingConfig);
  }, [brandingConfig]);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate]);

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setEditingTemplate(null);
    setPreviewMode(false);
  };

  const handleEditTemplate = () => {
    const template = getTemplate(selectedTemplate);
    setEditingTemplate({ ...template });
    setPreviewMode(false);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    try {
      setIsSaving(true);
      await saveTemplate(editingTemplate.id, editingTemplate);
      setSaveResult({
        success: true,
        message: 'Template saved successfully!'
      });
      setEditingTemplate(null);
    } catch (error) {
      setSaveResult({
        success: false,
        message: 'Error saving template: ' + error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    try {
      setIsSaving(true);
      await saveBrandingConfig(localBranding);
      setSaveResult({
        success: true,
        message: 'Branding configuration saved successfully!'
      });
    } catch (error) {
      setSaveResult({
        success: false,
        message: 'Error saving branding: ' + error.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setPreviewMode(true);
    setEditingTemplate(null);
  };

  const updateTemplateField = (field, value) => {
    setEditingTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateBrandingField = (field, value) => {
    setLocalBranding(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const currentTemplate = getTemplate(selectedTemplate);
  const previewData = previewTemplate(selectedTemplate);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <SafeIcon icon={FiMail} className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-slate-800">Email Templates</h1>
      </div>

      {/* Save Result */}
      {saveResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-xl flex items-center space-x-2 ${
            saveResult.success
              ? 'bg-success-50 border border-success-200 text-success-700'
              : 'bg-danger-50 border border-danger-200 text-danger-700'
          }`}
        >
          <SafeIcon
            icon={saveResult.success ? FiSave : FiEdit3}
            className="h-5 w-5"
          />
          <span>{saveResult.message}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'templates'
              ? 'bg-primary-100 text-primary-700'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <SafeIcon icon={FiCode} className="h-4 w-4 inline mr-2" />
          Templates
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'branding'
              ? 'bg-primary-100 text-primary-700'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          <SafeIcon icon={FiPalette} className="h-4 w-4 inline mr-2" />
          Branding
        </button>
      </div>

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Templates</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTemplate === template.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-slate-500">{template.id}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template Editor/Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-soft">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {currentTemplate?.name || 'Select a template'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {editingTemplate
                      ? 'Editing template'
                      : previewMode
                      ? 'Preview mode'
                      : 'View template'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreview}
                    disabled={!currentTemplate}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEye} className="h-4 w-4" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={handleEditTemplate}
                    disabled={!currentTemplate}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 disabled:bg-slate-50 disabled:text-slate-400 text-primary-700 rounded-lg transition-colors"
                  >
                    <SafeIcon icon={FiEdit3} className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  {editingTemplate && (
                    <button
                      onClick={handleSaveTemplate}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-success-500 hover:bg-success-600 disabled:bg-slate-300 text-white rounded-lg transition-colors"
                    >
                      {isSaving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <SafeIcon icon={FiSave} className="h-4 w-4" />
                      )}
                      <span>Save</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {editingTemplate ? (
                  /* Edit Mode */
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.name}
                        onChange={(e) =>
                          updateTemplateField('name', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Subject
                      </label>
                      <input
                        type="text"
                        value={editingTemplate.subject}
                        onChange={(e) =>
                          updateTemplateField('subject', e.target.value)
                        }
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Use {{variable}} for dynamic content"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        HTML Content
                      </label>
                      <textarea
                        value={editingTemplate.html_content}
                        onChange={(e) =>
                          updateTemplateField('html_content', e.target.value)
                        }
                        rows={20}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                        placeholder="HTML content with {{variables}}"
                      />
                    </div>
                    {/* Variables Reference */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-800 mb-2">Available Variables:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {editingTemplate.variables?.map((variable, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <code className="bg-slate-200 px-2 py-1 rounded text-xs">
                              {`{{${variable.name}}}`}
                            </code>
                            <span className="text-slate-600">{variable.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : previewMode ? (
                  /* Preview Mode */
                  <div>
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-800 mb-2">Subject Preview:</h4>
                      <p className="text-slate-700">{previewData.subject}</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-100 px-4 py-2 text-sm text-slate-600 flex items-center space-x-2">
                        <SafeIcon icon={FiMonitor} className="h-4 w-4" />
                        <span>Email Preview</span>
                      </div>
                      <div
                        className="p-4 bg-white max-h-96 overflow-auto"
                        dangerouslySetInnerHTML={{ __html: previewData.html }}
                      />
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  currentTemplate && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-slate-800 mb-2">Subject:</h4>
                        <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                          {currentTemplate.subject}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800 mb-2">HTML Content:</h4>
                        <pre className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                          {currentTemplate.html_content}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800 mb-2">Variables:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {currentTemplate.variables?.map((variable, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <code className="bg-slate-200 px-2 py-1 rounded text-xs">
                                {`{{${variable.name}}}`}
                              </code>
                              <span className="text-slate-600 text-sm">{variable.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branding' && (
        <div className="bg-white rounded-xl shadow-soft p-8">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">Branding Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={localBranding.company_name}
                onChange={(e) =>
                  updateBrandingField('company_name', e.target.value)
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Address
              </label>
              <input
                type="text"
                value={localBranding.company_address}
                onChange={(e) =>
                  updateBrandingField('company_address', e.target.value)
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="123 Main Street, City, State 12345"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Primary Color (Pink/Rose)
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={localBranding.primary_color}
                  onChange={(e) =>
                    updateBrandingField('primary_color', e.target.value)
                  }
                  className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={localBranding.primary_color}
                  onChange={(e) =>
                    updateBrandingField('primary_color', e.target.value)
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="#e4a4ab"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Secondary Color (Dark Gray)
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={localBranding.secondary_color}
                  onChange={(e) =>
                    updateBrandingField('secondary_color', e.target.value)
                  }
                  className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={localBranding.secondary_color}
                  onChange={(e) =>
                    updateBrandingField('secondary_color', e.target.value)
                  }
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="#474747"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dashboard URL
              </label>
              <input
                type="url"
                value={localBranding.dashboard_url}
                onChange={(e) =>
                  updateBrandingField('dashboard_url', e.target.value)
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://yourdomain.com/admin/dashboard"
              />
            </div>
          </div>
          <div className="mt-8">
            <button
              onClick={handleSaveBranding}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 text-white rounded-lg transition-colors"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <SafeIcon icon={FiSave} className="h-5 w-5" />
              )}
              <span>Save Branding</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;