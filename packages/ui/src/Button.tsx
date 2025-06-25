import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  id?: string;
  target?: string;
  rel?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  href,
  className = '',
  type = 'button',
  id,
  target,
  rel,
}) => {
  const baseClasses = [
    'reelapps-button',
    `reelapps-button--${variant}`,
    size !== 'medium' && `reelapps-button--${size}`,
    className,
  ].filter(Boolean).join(' ');

  if (href) {
    return (
      <a 
        href={href} 
        className={baseClasses}
        target={target}
        rel={rel}
        id={id}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled}
      onClick={onClick}
      id={id}
    >
      {children}
    </button>
  );
};

export default Button; 