import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Database } from '../../types/database';
import { Search, Plus, Filter, SortDesc } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import JobPostingForm from './JobPostingForm';
import CandidateResults from './CandidateResults';
import Button from '../Button/Button';
import Card from '../Card/Card';
import styles from './ReelHunter.module.css';

const ReelHunter: React.FC = () => {
  const { profile } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'analytics'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  type JobPosting = Database['public']['Tables']['job_postings']['Row'];
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // Sync activeTab with URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'candidates' || hash === 'analytics') {
      setActiveTab(hash as 'candidates' | 'analytics');
    } else {
      setActiveTab('jobs');
    }
  }, [location.hash]);

  // If activeTab changes internally (e.g., after creating a job), update URL hash
  const updateTab = (tab: 'jobs' | 'candidates' | 'analytics') => {
    setActiveTab(tab);
    navigate(`#${tab}`);
  };

  // Check if user is a recruiter
  if (profile?.role !== 'recruiter') {
    return (
      <div className={styles.accessDenied}>
        <h2>Access Denied</h2>
        <p>ReelHunter is exclusively for recruiters. Please contact support if you need access.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>ReelHunter</h1>
            <p className={styles.subtitle}>
              AI-powered recruitment platform for finding exceptional talent
            </p>
          </div>
          
          <div className={styles.headerActions}>
            <Button onClick={() => setShowJobForm(true)}>
              <Plus size={16} />
              Post New Job
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.content}>
        {activeTab === 'jobs' && (
          <div className={styles.jobsSection}>
            <div className={styles.sectionHeader}>
              <h2>Your Job Postings</h2>
              <div className={styles.sectionActions}>
                <Button variant="outline" size="small">
                  <Filter size={16} />
                  Filter
                </Button>
                <Button variant="outline" size="small">
                  <SortDesc size={16} />
                  Sort
                </Button>
              </div>
            </div>

            <div className={styles.jobsGrid}>
              {/* Add Job Card */}
              <Card 
                interactive 
                className={styles.addJobCard}
                onClick={() => setShowJobForm(true)}
              >
                <div className={styles.addJobContent}>
                  <Plus size={48} className={styles.addJobIcon} />
                  <h3>Post New Job</h3>
                  <p>Create a new job posting and find the perfect candidates</p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'candidates' && selectedJob && (
          <CandidateResults job={selectedJob} />
        )}

        {activeTab === 'candidates' && !selectedJob && (
          <div className={styles.noCandidatesSelected}>
            <Search size={64} className={styles.emptyIcon} />
            <h3>Select a Job to View Candidates</h3>
            <p>Choose a job posting from the Jobs tab to see matched candidates</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className={styles.analyticsSection}>
            <div className={styles.analyticsGrid}>
              <Card>
                <Card.Header title="Hiring Metrics" />
                <div className={styles.metricsGrid}>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>2.4x</span>
                    <span className={styles.metricLabel}>Faster Hiring</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>89%</span>
                    <span className={styles.metricLabel}>Match Accuracy</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>45%</span>
                    <span className={styles.metricLabel}>Cost Reduction</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricValue}>94%</span>
                    <span className={styles.metricLabel}>Retention Rate</span>
                  </div>
                </div>
              </Card>

              <Card>
                <Card.Header title="Recent Activity" />
                <div className={styles.activityList}>
                  <div className={styles.activityItem}>
                    <span className={styles.activityText}>New candidate match for React Developer</span>
                    <span className={styles.activityTime}>2 hours ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <span className={styles.activityText}>Job posting analyzed and optimized</span>
                    <span className={styles.activityTime}>1 day ago</span>
                  </div>
                  <div className={styles.activityItem}>
                    <span className={styles.activityText}>5 new candidates added to pool</span>
                    <span className={styles.activityTime}>2 days ago</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Job Posting Form Modal */}
      {showJobForm && (
        <JobPostingForm 
          onClose={() => setShowJobForm(false)}
          onJobCreated={(job: JobPosting) => {
            setShowJobForm(false);
            setSelectedJob(job);
            updateTab('candidates');
          }}
        />
      )}
    </div>
  );
};

export default ReelHunter;