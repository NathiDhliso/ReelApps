import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

interface CardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
}

interface CardStatProps {
  value: string | number;
  label: string;
}

const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Footer: React.FC<CardFooterProps>;
  Stat: React.FC<CardStatProps>;
} = ({
  children,
  variant = 'default',
  interactive = false,
  onClick,
  className = '',
}) => {
  const baseClasses = [
    'reelapps-card',
    `reelapps-card--${variant}`,
    interactive && 'reelapps-card--interactive',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ icon, title, description }) => (
  <div className="reelapps-card__header">
    {icon && <div className="reelapps-card__icon">{icon}</div>}
    <div>
      <h3 className="reelapps-card__title">{title}</h3>
      {description && <p className="reelapps-card__description">{description}</p>}
    </div>
  </div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children }) => (
  <div className="reelapps-card__footer">{children}</div>
);

const CardStat: React.FC<CardStatProps> = ({ value, label }) => (
  <div className="reelapps-card__stat">
    <span className="reelapps-card__stat-value">{value}</span>
    <span className="reelapps-card__stat-label">{label}</span>
  </div>
);

Card.Header = CardHeader;
Card.Footer = CardFooter;
Card.Stat = CardStat;

export default Card; 