import React from 'react';
import classNames from 'classnames';

export default function Skeleton({ className = '', rounded = 'lg' }) {
  const roundedMap = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={classNames(
        'relative overflow-hidden bg-gray-200 dark:bg-opaque',
        roundedMap[rounded] || roundedMap.lg,
        className
      )}
      role="status"
      aria-label="Loading"
      aria-busy="true">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
      <style>
        {`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
}
