import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Clock, AlertCircle, CheckCircle2, UserCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5246/api';

const PrescriptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      const customerName = user.fullName || user.username;
      axios.get(`${API_BASE_URL}/Prescriptions/customer/${customerName}`)
        .then(res => {
          setHistory(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi lấy lịch sử:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-100">
        <UserCircle size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Bạn cần đăng nhập để xem lịch sử tư vấn đơn thuốc.</p>
      </div>
    );
  }

  if (loading) return <div className="text-center p-8 text-slate-500 font-bold animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
      <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
        <FileText className="text-orange-500" /> Đơn thuốc của tôi
      </h3>

      {history.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">Bạn chưa gửi yêu cầu tư vấn nào.</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
          {history.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:border-orange-200 transition-all">
              <div className="flex gap-4 p-4 border-b border-slate-50 items-center bg-slate-50/50">
                <img src={p.imageUrl} alt="Đơn thuốc" className="w-16 h-16 object-cover rounded-2xl shadow-sm border border-slate-200" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-1">
                    <Clock size={12}/> {new Date(p.createdAt).toLocaleString('vi-VN')}
                  </p>
                  {p.status === 'Pending' ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-amber-100">
                      <AlertCircle size={12}/> Đang chờ dược sĩ
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      <CheckCircle2 size={12}/> Đã có phản hồi
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <p className="text-sm text-slate-600 italic mb-4">" {p.note || 'Không có ghi chú'} "</p>
                
                {/* HIỂN THỊ PHẢN HỒI CỦA ADMIN LÊN CHO KHÁCH ĐỌC ĐÂY SẾP! */}
                {p.status === 'Processed' && p.adminReply && (
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest mb-1">Dược sĩ SaHa tư vấn:</p>
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">{p.adminReply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionHistory;