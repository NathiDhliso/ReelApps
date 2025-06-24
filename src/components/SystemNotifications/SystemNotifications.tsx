import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useSystemStore } from '../../store/systemStore';
import styles from './SystemNotifications.module.css';

const SystemNotifications: React.FC = () => {
  const { notifications, dismissNotification } = useSystemStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'error': return <AlertCircle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const visibleNotifications = notifications.filter(n => !n.dismissed);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={styles.container}>
      {visibleNotifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`${styles.notification} ${styles[notification.type]}`}
        >
          <div className={styles.icon}>
            {getIcon(notification.type)}
          </div>
          <div className={styles.content}>
            <h4 className={styles.title}>{notification.title}</h4>
            <p className={styles.message}>{notification.message}</p>
          </div>
          <button 
            onClick={() => dismissNotification(notification.id)}
            className={styles.dismissButton}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SystemNotifications;