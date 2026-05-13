import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, Send, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5246/api';

const PrescriptionUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(''); // Lưu ảnh thật thành chuỗi để đẩy lên DB
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. HÀM XỬ LÝ KHI KHÁCH BẤM CHỌN ẢNH
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Đọc ảnh và chuyển thành dạng Base64 (Để khỏi cần làm tính năng Upload Server phức tạp)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const user = JSON.parse(localStorage.getItem('user'));
    
    const payload = {
      customerName: user ? (user.fullName || user.username) : "Khách vãng lai",
      // Dùng ảnh thật khách gửi. Nếu khách không chọn ảnh thì lấy ảnh Demo.
      imageUrl: previewUrl || "https://vinmec-static.s3.amazonaws.com/images/don-thuoc-mau.jpg", 
      note: note,
      status: "Pending"
    };

    try {
      await axios.post(`${API_BASE_URL}/Prescriptions`, payload);
      setSuccess(true);
      // Reset lại form
      setNote('');
      setFile(null);
      setPreviewUrl('');
    } catch (error) {
      alert("Lỗi khi gửi đơn thuốc!");
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="bg-emerald-50 p-8 rounded-[2rem] text-center border border-emerald-100 animate-in zoom-in-95">
      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
        <CheckCircle className="text-white" size={32} />
      </div>
      <h3 className="text-xl font-black text-slate-800">Gửi thành công!</h3>
      <p className="text-slate-500 mt-2 font-medium">Dược sĩ SaHa sẽ xem đơn và tư vấn cho bạn trong ít phút.</p>
      <button onClick={() => setSuccess(false)} className="mt-6 text-emerald-600 font-bold underline">Gửi đơn khác</button>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-50 rounded-2xl text-orange-500"><FileText /></div>
        <h3 className="text-2xl font-black text-slate-800">Tư vấn qua đơn thuốc</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ĐÃ ĐỔI THẺ <div> THÀNH <label> ĐỂ BẤM VÀO ĐƯỢC */}
        <label className="block border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-orange-300 transition-colors cursor-pointer bg-slate-50 group">
          
          {previewUrl ? (
            // Nếu đã chọn ảnh thì hiện ảnh xem trước cực xịn
            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
              <img src={previewUrl} alt="Preview" className="h-24 object-contain rounded-lg mb-3 shadow-sm border border-slate-200" />
              <p className="text-brand font-bold text-sm truncate max-w-[250px]">{file.name}</p>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider group-hover:text-red-500 transition-colors">Bấm để đổi ảnh khác</p>
            </div>
          ) : (
            // Chưa chọn ảnh thì hiện icon Upload như cũ
            <>
              <UploadCloud className="mx-auto text-slate-300 group-hover:text-orange-400 transition-colors" size={48} />
              <p className="mt-3 text-slate-500 font-bold">Chụp ảnh đơn thuốc của bạn</p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
            </>
          )}

          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange} 
          />
        </label>

        <div>
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ghi chú cho dược sĩ</label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Tôi muốn tìm thực phẩm chức năng bổ trợ cho đơn này..."
            className="w-full mt-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 font-medium transition-all h-24"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
        >
          <Send size={20} /> {loading ? "Đang tải ảnh lên..." : "GỬI ĐƠN THUỐC NGAY"}
        </button>
      </form>
    </div>
  );
};

export default PrescriptionUpload;