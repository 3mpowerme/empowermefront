import classNames from 'classnames';
import React from 'react';

const Button = ({ children, disabled = false, variant = 'primary', ...props }) => {
  const primaryClassName = classNames(
    'bg-primary text-white py-4 rounded-4xl hover:bg-purple-800 cursor-pointer',
    {
      'px-20': typeof children === 'string' && children.length <= 15,
      'px-10': typeof children === 'string' && children.length > 15,
    }
  );
  const googleClassName =
    'bg-white text-secondary border border-secondary px-16 py-3 rounded-xl shadow-md hover:shadow-lg cursor-pointer';
  let variantClassName = primaryClassName;
  if (variant === 'google') {
    variantClassName = googleClassName;
  }
  if (variant === 'wizard') {
    variantClassName =
      'px-5 w-10 rounded-4xl text-primary border border-primary hover:bg-primary hover:text-white cursor-pointer';
  }
  return (
    <button
      {...props}
      disabled={disabled}
      className={`w-auto ${variantClassName} ${disabled ? 'bg-gray-400' : ''} ${props.className || ''}`}>
      {children}
    </button>
  );
};

export default Button;
