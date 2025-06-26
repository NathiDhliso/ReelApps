import React, { useState } from 'react';
import { useAuthStore } from '@reelapps/auth';
import { Card, Button } from '@reelapps/ui';
import { 
  Target, 
  Video, 
  Code, 
  FileText, 
  Presentation, 
  Award, 
  Plus, 
  CheckCircle, 
  Clock,
  Star,
  Upload
} from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo';
  status: 'planned' | 'in-progress' | 'completed' | 'verified';
  rating?: number;
  verifiedAt?: string;
}

const ReelSkillsDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock skills data - in real app, this would come from API
  const [skills] = useState<Skill[]>([
    {
      id: '1',
      name: 'React',
      category: 'technical',
      proficiency: 'advanced',
      demonstrationMethod: 'code',
      status: 'verified',
      rating: 5,
      verifiedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'TypeScript',
      category: 'technical',
      proficiency: 'intermediate',
      demonstrationMethod: 'code',
      status: 'verified',
      rating: 4,
      verifiedAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Leadership',
      category: 'soft',
      proficiency: 'advanced',
      demonstrationMethod: 'video',
      status: 'completed'
    },
    {
      id: '4',
      name: 'Python',
      category: 'technical',
      proficiency: 'expert',
      demonstrationMethod: 'code',
      status: 'in-progress'
    },
    {
      id: '5',
      name: 'AWS Certified',
      category: 'certification',
      proficiency: 'intermediate',
      demonstrationMethod: 'documentation',
      status: 'planned'
    }
  ]);

  const categories = [
    { value: 'all', label: 'All Skills' },
    { value: 'technical', label: 'Technical' },
    { value: 'soft', label: 'Soft Skills' },
    { value: 'language', label: 'Languages' },
    { value: 'certification', label: 'Certifications' }
  ];

  const filteredSkills = selectedCategory === 'all' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-secondary';
      case 'completed': return 'text-primary';
      case 'in-progress': return 'text-accent';
      case 'planned': return 'text-text-secondary';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return Award;
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'planned': return Target;
      default: return Target;
    }
  };

  const getDemonstrationIcon = (method: string) => {
    switch (method) {
      case 'code': return Code;
      case 'video': return Video;
      case 'documentation': return FileText;
      case 'presentation': return Presentation;
      case 'live-demo': return Target;
      default: return Target;
    }
  };

  const stats = {
    total: skills.length,
    verified: skills.filter(s => s.status === 'verified').length,
    inProgress: skills.filter(s => s.status === 'in-progress').length,
    avgRating: skills.filter(s => s.rating).reduce((acc, s) => acc + (s.rating || 0), 0) / skills.filter(s => s.rating).length || 0
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Skills Dashboard
          </h1>
          <p className="text-text-secondary">
            Welcome back, {profile?.first_name || user?.email}! Showcase your skills and get verified.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-surface border-surface">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Skills</p>
                  <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </Card.Header>
          </Card>

          <Card className="bg-surface border-surface">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Verified</p>
                  <p className="text-2xl font-bold text-secondary">{stats.verified}</p>
                </div>
                <Award className="h-8 w-8 text-secondary" />
              </div>
            </Card.Header>
          </Card>

          <Card className="bg-surface border-surface">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">In Progress</p>
                  <p className="text-2xl font-bold text-accent">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-accent" />
              </div>
            </Card.Header>
          </Card>

          <Card className="bg-surface border-surface">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Avg Rating</p>
                  <p className="text-2xl font-bold text-accent-secondary">{stats.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-accent-secondary" />
              </div>
            </Card.Header>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.value
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:bg-primary hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text-primary">
            Your Skills ({filteredSkills.length})
          </h2>
          <Button className="bg-primary hover:bg-primary-hover">
            <Plus size={16} className="mr-2" />
            Add New Skill
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => {
            const StatusIcon = getStatusIcon(skill.status);
            const DemoIcon = getDemonstrationIcon(skill.demonstrationMethod);
            
            return (
              <Card 
                key={skill.id} 
                className="bg-surface border-surface hover:border-primary transition-colors cursor-pointer"
              >
                <Card.Header>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-1">
                        {skill.name}
                      </h3>
                      <p className="text-sm text-text-secondary capitalize">
                        {skill.category} • {skill.proficiency}
                      </p>
                    </div>
                    <div className={`flex items-center ${getStatusColor(skill.status)}`}>
                      <StatusIcon size={20} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-text-secondary">
                      <DemoIcon size={16} className="mr-2" />
                      <span className="text-sm capitalize">
                        {skill.demonstrationMethod.replace('-', ' ')}
                      </span>
                    </div>
                    
                    {skill.rating && (
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < skill.rating! ? '#FCD34D' : 'none'}
                            stroke={i < skill.rating! ? '#FCD34D' : 'currentColor'}
                            className="text-accent-secondary"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium capitalize ${getStatusColor(skill.status)}`}>
                      {skill.status.replace('-', ' ')}
                    </span>
                    
                    {skill.verifiedAt && (
                      <span className="text-xs text-text-secondary">
                        Verified {skill.verifiedAt}
                      </span>
                    )}
                  </div>
                </Card.Header>

                <Card.Footer>
                  <div className="flex gap-2">
                    {skill.status === 'planned' && (
                      <Button variant="outline" size="small" className="flex-1">
                        <Upload size={14} className="mr-1" />
                        Start Demo
                      </Button>
                    )}
                    {skill.status === 'in-progress' && (
                      <Button variant="outline" size="small" className="flex-1">
                        <Upload size={14} className="mr-1" />
                        Continue
                      </Button>
                    )}
                    {skill.status === 'completed' && (
                      <Button size="small" className="flex-1 bg-primary hover:bg-primary-hover">
                        <Award size={14} className="mr-1" />
                        Submit for Verification
                      </Button>
                    )}
                    {skill.status === 'verified' && (
                      <Button variant="outline" size="small" className="flex-1">
                        <Award size={14} className="mr-1" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            );
          })}
        </div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12">
            <Target size={48} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No skills found
            </h3>
            <p className="text-text-secondary mb-4">
              {selectedCategory === 'all' 
                ? "Start building your skill portfolio by adding your first skill."
                : `No ${selectedCategory} skills found. Try a different category.`
              }
            </p>
            <Button className="bg-primary hover:bg-primary-hover">
              <Plus size={16} className="mr-2" />
              Add Your First Skill
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelSkillsDashboard; 