import React, { useState } from 'react';
import { Search, Plus, Filter, SortDesc } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import JobPostingForm from './JobPostingForm';
import CandidateResults from './CandidateResults';
import Button from '../Button/Button';
import Card from '../Card/Card';
import styles from './ReelHunter.module.css';

const ReelHunter: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'analytics'>('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

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

      {/* Navigation Tabs */}
      <nav className={styles.tabNav}>
        <button 
          className={`${styles.tab} ${activeTab === 'jobs' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          Job Postings
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'candidates' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          Candidate Pool
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'analytics' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </nav>

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
              {/* Placeholder job cards */}
              <Card interactive>
                <Card.Header
                  title="Senior React Developer"
                  description="Full-time • Remote • Posted 2 days ago"
                />
                <div className={styles.jobStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>24</span>
                    <span className={styles.statLabel}>Matches</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>8</span>
                    <span className={styles.statLabel}>Applications</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>92%</span>
                    <span className={styles.statLabel}>Quality Score</span>
                  </div>
                </div>
                <Card.Footer>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => setSelectedJob({ id: '1', title: 'Senior React Developer' })}
                  >
                    View Matches
                  </Button>
                  <Button size="small">Edit Job</Button>
                </Card.Footer>
              </Card>

              <Card interactive>
                <Card.Header
                  title="Product Manager"
                  description="Full-time • San Francisco • Posted 1 week ago"
                />
                <div className={styles.jobStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>18</span>
                    <span className={styles.statLabel}>Matches</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>5</span>
                    <span className={styles.statLabel}>Applications</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>87%</span>
                    <span className={styles.statLabel}>Quality Score</span>
                  </div>
                </div>
                <Card.Footer>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => setSelectedJob({ id: '2', title: 'Product Manager' })}
                  >
                    View Matches
                  </Button>
                  <Button size="small">Edit Job</Button>
                </Card.Footer>
              </Card>

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
          onJobCreated={(job) => {
            setShowJobForm(false);
            setSelectedJob(job);
            setActiveTab('candidates');
          }}
        />
      )}
    </div>
  );
};

export default ReelHunter;