import React, { useState } from 'react';

const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b flex justify-between items-center relative">
           <h3 className="text-lg font-bold text-gray-800">{title}</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 absolute top-3 right-3">
             <i className="fas fa-times text-xl"></i>
           </button>
        </div>

        {/* Body */}
        <div className="p-6 text-gray-600 font-light text-sm leading-relaxed text-center">
           {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <div className="p-4 bg-gray-50 flex gap-3 justify-center border-t">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
