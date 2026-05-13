import React, { useState } from 'react';
import { FileText, X } from 'lucide-react';
import PrescriptionUpload from './PrescriptionUpload';

const FloatingPrescription = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Đã đổi sang relative để nó ngoan ngoãn xếp hàng
    <div className="relative z-50">
      
      {isOpen && (
        // Đã chỉnh bottom-[calc(100%+20px)] để popup luôn nổi lên trên cái nút
        <div className="absolute bottom-[calc(100%+20px)] right-0 w-[400px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-5 duration-300">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center hover:text-red-500 hover:border-red-200 transition-all shadow-sm z-10"
          >
            <X size={16} />
          </button>
          
          <div className="max-h-[80vh] overflow-y-auto rounded-[2rem] scrollbar-hide">
            <PrescriptionUpload />
          </div>
        </div>
      )}

      {/* Đổi màu nút thành đen slate-800 để phân biệt với nút AI màu cam */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-800/30 hover:bg-slate-900 transition-colors hover:scale-110 duration-200 relative group"
      >
        {isOpen ? <X size={24} /> : <FileText size={24} />}
        
        {!isOpen && (
          <span className="absolute right-[70px] bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Gửi đơn thuốc
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingPrescription;