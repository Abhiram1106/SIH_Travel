import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;