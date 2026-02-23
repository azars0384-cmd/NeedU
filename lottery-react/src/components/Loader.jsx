import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="relative w-16 h-16 border-4 border-gray-200 border-t-brand-primary rounded-full animate-spin"></div>
      <p className="mt-4 text-brand-primary font-bold text-lg animate-pulse">กำลังโหลด...</p>
    </div>
  );
};

export default Loader;
