/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import Button from '../Button/Button';
import Card from '../Card/Card';
import styles from './JobPostingForm.module.css';
import { supabase } from '../../lib/supabase';

interface JobPostingFormProps {
  onClose: () => void;
  onJobCreated: (job: any) => void;
}

interface JobAnalysis {
  clarity: number;
  realism: number;
  inclusivity: number;
  suggestions: string[];
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ onClose, onJobCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: [''],
    location: '',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    remote_allowed: false,
    experience_level: 'mid',
    employment_type: 'full-time'
  });

  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [roleTitle, setRoleTitle] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear analysis when form changes
    if (analysis) {
      setAnalysis(null);
      setShowAnalysis(false);
    }
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: newRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, requirements: newRequirements }));
    }
  };

  const handleAnalyzeDescription = async () => {
    if (!formData.description) {
      setAnalysisError('Please enter a job description to analyze.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-job', {
        body: { job_description: formData.description },
      });

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from the analysis function.');
      }
      
      setAnalysisResult(data);
      // Automatically apply suggestions to the form
      setSuggestedSkills(data.suggested_skills || []);
      setRoleTitle(data.extracted_role || formData.title);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error('Error analyzing job description:', errorMessage);
      setAnalysisError(`Failed to analyze: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Simulate saving job posting
      const jobPosting: any = {
        id: Date.now().toString(),
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        ai_analysis_score: analysisResult,
        status: 'active',
        created_at: new Date().toISOString()
      };

      // In real implementation, save to Supabase
      console.log('Saving job posting:', jobPosting);

      onJobCreated(jobPosting);
    } catch (error) {
      console.error('Failed to save job posting:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--accent-green)';
    if (score >= 60) return 'var(--accent-yellow)';
    return 'var(--accent-red)';
  };

  const canAnalyze = formData.title && formData.description && formData.requirements.some(req => req.trim());

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Create Job Posting</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h3>Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label>Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Senior React Developer"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Company name"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Experience Level</label>
                  <select
                    value={formData.experience_level}
                    onChange={(e) => handleInputChange('experience_level', e.target.value)}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="principal">Principal</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className={styles.section}>
              <h3>Job Description</h3>
              
              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  rows={6}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Requirements *</label>
                {formData.requirements.map((req, index) => (
                  <div key={index} className={styles.requirementRow}>
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => handleRequirementChange(index, e.target.value)}
                      placeholder="e.g., 3+ years of React experience"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className={styles.removeButton}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="small"
                  onClick={addRequirement}
                >
                  Add Requirement
                </Button>
              </div>
            </div>

            {/* Location & Compensation */}
            <div className={styles.section}>
              <h3>Location & Compensation</h3>
              
              <div className={styles.formGroup}>
                <label>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., San Francisco, CA or Remote"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.remote_allowed}
                    onChange={(e) => handleInputChange('remote_allowed', e.target.checked)}
                  />
                  Remote work allowed
                </label>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Min Salary</label>
                  <input
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => handleInputChange('salary_min', e.target.value)}
                    placeholder="80000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Max Salary</label>
                  <input
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => handleInputChange('salary_max', e.target.value)}
                    placeholder="120000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Currency</label>
                  <select
                    value={formData.salary_currency}
                    onChange={(e) => handleInputChange('salary_currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          {showAnalysis && analysisResult && (
            <div className={styles.analysisSection}>
              <Card>
                <Card.Header
                  icon={<Sparkles size={20} />}
                  title="AI Job Analysis"
                  description="Our AI has analyzed your job posting for optimization opportunities"
                />
                
                <div className={styles.analysisScores}>
                  <div className={styles.scoreItem}>
                    <div className={styles.scoreLabel}>Clarity</div>
                    <div 
                      className={styles.scoreValue}
                      style={{ color: getScoreColor(analysisResult.clarity) }}
                    >
                      {analysisResult.clarity}%
                    </div>
                  </div>
                  
                  <div className={styles.scoreItem}>
                    <div className={styles.scoreLabel}>Realism</div>
                    <div 
                      className={styles.scoreValue}
                      style={{ color: getScoreColor(analysisResult.realism) }}
                    >
                      {analysisResult.realism}%
                    </div>
                  </div>
                  
                  <div className={styles.scoreItem}>
                    <div className={styles.scoreLabel}>Inclusivity</div>
                    <div 
                      className={styles.scoreValue}
                      style={{ color: getScoreColor(analysisResult.inclusivity) }}
                    >
                      {analysisResult.inclusivity}%
                    </div>
                  </div>
                </div>

                {analysisResult.suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    <h4>Suggestions for Improvement:</h4>
                    <ul>
                      {analysisResult.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Form Actions */}
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={handleAnalyzeDescription}
              disabled={!canAnalyze || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
            
            {analysisError && (
              <div className={styles.errorBanner}>
                <p>{analysisError}</p>
              </div>
            )}

            {analysisResult && (
              <div className={styles.analysisResult}>
                <h3 className="text-lg font-semibold mb-2">Analysis Complete</h3>
                <p><strong>Extracted Role:</strong> {analysisResult.extracted_role}</p>
                <p><strong>Top 5 Suggested Skills:</strong></p>
                <ul className="list-disc list-inside">
                  {suggestedSkills.slice(0, 5).map(skill => <li key={skill}>{skill}</li>)}
                </ul>
                <Button onClick={() => {
                  setFormData(prev => ({ ...prev, title: roleTitle, required_skills: suggestedSkills }));
                  setAnalysisResult(null);
                }}>Apply Suggestions</Button>
              </div>
            )}

            <div className={styles.submitActions}>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create Job Posting'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;