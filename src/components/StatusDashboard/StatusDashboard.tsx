import React from 'react';
import { Activity, Database, RefreshCw } from 'lucide-react';
import { useSystemStore } from '../../store/systemStore';
import Card from '../Card/Card';
import Button from '../Button/Button';
import styles from './StatusDashboard.module.css';

const StatusDashboard: React.FC = () => {
  const { status, checkSystemHealth } = useSystemStore();

  const getStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'healthy': return 'var(--accent-green)';
      case 'degraded': return 'var(--accent-yellow)';
      case 'down': return 'var(--accent-red)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusText = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'healthy': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'down': return 'Down';
      default: return 'Unknown';
    }
  };

  const services = [
    {
      name: 'Database',
      status: status.supabaseService,
      icon: <Database size={20} />,
      description: 'User data and profiles'
    },
  ];

  const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' :
                       services.some(s => s.status === 'down') ? 'down' : 'degraded';

  return (
    <div className={styles.container}>
      <Card>
        <Card.Header
          icon={<Activity size={24} />}
          title="System Status"
          description={`Last checked: ${new Date(status.lastChecked).toLocaleTimeString()}`}
        />
        
        <div className={styles.overallStatus}>
          <div 
            className={styles.statusIndicator}
            style={{ backgroundColor: getStatusColor(overallHealth) }}
          />
          <span className={styles.statusText}>
            All Systems {getStatusText(overallHealth)}
          </span>
        </div>

        <div className={styles.servicesList}>
          {services.map((service) => (
            <div key={service.name} className={styles.serviceItem}>
              <div className={styles.serviceInfo}>
                <div className={styles.serviceIcon}>
                  {service.icon}
                </div>
                <div>
                  <div className={styles.serviceName}>{service.name}</div>
                  <div className={styles.serviceDescription}>{service.description}</div>
                </div>
              </div>
              <div className={styles.serviceStatus}>
                <div 
                  className={styles.statusDot}
                  style={{ backgroundColor: getStatusColor(service.status) }}
                />
                <span style={{ color: getStatusColor(service.status) }}>
                  {getStatusText(service.status)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Card.Footer>
          <Button 
            variant="outline" 
            size="small"
            onClick={checkSystemHealth}
          >
            <RefreshCw size={16} />
            Refresh Status
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default StatusDashboard;