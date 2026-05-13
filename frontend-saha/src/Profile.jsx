import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  Edit2,
  ShieldCheck,
  LogOut,
  Package,
  History,
  Settings,
  Home,
  ChevronRight,
  Calendar // 🔥 Đã thêm icon Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrescriptionHistory from './PrescriptionHistory';
import MyAppointmentHistory from './MyAppointmentHistory'; // 🔥 Đã import Component lịch hẹn

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // STATE XỬ LÝ ĐỔI TÊN
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setEditName(parsedUser.fullName || '');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  const handleSaveName = () => {
    if (!editName.trim()) {
      alert("Tên không được để trống!");
      return;
    }
    const updatedUser = { ...user, fullName: editName };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
    alert("Đã cập nhật tên thành công!");
  };

  const handleCancelEdit = () => {
    setEditName(user.fullName || '');
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/80 py-12 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto px-6">

        {/* THANH MENU ĐIỀU HƯỚNG */}
        <div className="flex items-center gap-2 text-sm font-semibold mb-10">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-orange-500 transition-colors"
          >
            <Home size={18} />
            Trang chủ
          </div>
          <ChevronRight size={16} className="text-slate-300" />
          <span className="text-orange-500 font-bold">Hồ sơ cá nhân</span>
        </div>

        {/* BỐ CỤC DASHBOARD CHUẨN MỰC (TRÁI 1/3 - PHẢI 2/3) */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= CỘT TRÁI: SIDEBAR LÀM VIỆC ================= */}
          <div className="w-full lg:w-1/3 space-y-6 lg:sticky lg:top-8 shrink-0">
            
            {/* THẺ AVATAR & TÊN */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-2xl pointer-events-none"></div>

              <div className="w-24 h-24 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-5 relative z-10 border border-orange-100">
                <User size={40} strokeWidth={1.5} />
              </div>

              {/* KHU VỰC ĐỔI TÊN */}
              {isEditing ? (
                <div className="w-full space-y-3 mb-3 relative z-10 animate-in fade-in zoom-in duration-200">
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-center text-lg font-bold text-slate-900 border-b-2 border-orange-500 bg-orange-50/50 px-3 py-2 outline-none rounded-t-lg transition-colors focus:bg-orange-50"
                    autoFocus
                  />
                  <div className="flex justify-center gap-2">
                    <button onClick={handleSaveName} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm">Lưu</button>
                    <button onClick={handleCancelEdit} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Hủy</button>
                  </div>
                </div>
              ) : (
                <div 
                  className="flex items-center justify-center gap-2 mb-1 group cursor-pointer relative z-10" 
                  onClick={() => setIsEditing(true)}
                  title="Nhấn để đổi tên"
                >
                  <h2 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    {user.fullName || 'Chưa cập nhật tên'}
                  </h2>
                  <Edit2 size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                </div>
              )}

              <p className="text-sm text-slate-500 mb-6 font-medium relative z-10">@{user.username || 'user_saha'}</p>
              
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full relative z-10">
                <ShieldCheck size={14} /> Tài khoản xác thực
              </div>
            </div>

            {/* MENU SIDEBAR */}
            <div className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 flex flex-col gap-1">
              <button className="flex items-center gap-3 px-5 py-4 bg-orange-50 text-orange-600 rounded-2xl font-bold transition-colors text-left">
                <Settings size={20} /> Hồ sơ của tôi
              </button>
              
              <button 
                onClick={() => navigate('/order-history')}
                className="flex items-center gap-3 px-5 py-4 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-bold transition-colors text-left"
              >
                <Package size={20} className="text-slate-400" /> Lịch sử đơn hàng
              </button>

              <div className="h-px bg-slate-100 my-2 mx-5"></div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl font-bold transition-colors text-left group"
              >
                <LogOut size={20} className="text-red-400 group-hover:text-red-500 transition-colors" /> Đăng xuất
              </button>
            </div>

          </div>

          {/* ================= CỘT PHẢI: NỘI DUNG HIỂN THỊ ================= */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* 1. THÔNG TIN CÁ NHÂN */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">
                Thông tin cá nhân
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Mail size={14} /> Địa chỉ Email
                  </p>
                  <p className="font-bold text-slate-800 text-lg truncate">{user.email}</p>
                </div>
                
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/50">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User size={14} /> Mã khách hàng (ID)
                  </p>
                  <p className="font-bold text-slate-800 text-lg truncate">{user.id || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-8 p-5 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex items-start gap-4">
                <MapPin size={20} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  Tính năng cập nhật <span className="font-bold text-slate-700">địa chỉ nhận hàng</span> và <span className="font-bold text-slate-700">số điện thoại</span> liên lạc sẽ được mở khóa ở phiên bản nâng cấp tiếp theo để tối ưu trải nghiệm mua sắm.
                </p>
              </div>
            </div>

            {/* 2. HỒ SƠ Y TẾ */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <History size={22} className="text-emerald-500" /> Hồ sơ y tế
                </h3>
              </div>
              <div className="rounded-2xl overflow-hidden">
                <PrescriptionHistory />
              </div>
            </div>

            {/* 3. 🔥 LỊCH HẸN TƯ VẤN ONLINE 🔥 */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <Calendar size={22} className="text-blue-500" /> Lịch khám Online
                </h3>
              </div>
              {/* Bọc margin âm để bù trừ padding dư thừa từ component con */}
              <div className="-mx-6 mt-4">
                <MyAppointmentHistory />
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;