import React from 'react';
import { HeartPulse, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

  return (
    // Đã XÓA onClick ở div cha để không bị lỗi bấm đâu cũng quay về trang chủ
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
      
      {/* Nút quay lại - Chỉ đặt lệnh navigate ở đây */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-10 left-10 flex items-center gap-2 text-slate-400 hover:text-brand transition-all text-sm font-medium border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft size={18} /> Trang chủ
      </button>

      <div className="w-full max-w-[400px]">
        {/* Tiêu đề */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-brand-light p-3 rounded-2xl mb-4">
            <HeartPulse size={32} className="text-brand" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tạo tài khoản mới</h2>
          <p className="text-slate-400 text-sm mt-2">Tham gia cùng cộng đồng sức khỏe SaHa</p>
        </div>

        {/* Form trắng sạch sẽ - Đầy đủ các trường */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            
            {/* 1. Họ và Tên */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Họ và Tên</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nguyễn Nhật Hào" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5 outline-none transition-all text-sm"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
              </div>
            </div>

            {/* 2. Số điện thoại (Mới thêm) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Số điện thoại</label>
              <div className="relative">
                <input 
                  type="tel" 
                  placeholder="0858 xxx xxx" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5 outline-none transition-all text-sm"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
              </div>
            </div>

            {/* 3. Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="hao@example.com" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5 outline-none transition-all text-sm"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
              </div>
            </div>

            {/* 4. Mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Mật khẩu</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5 outline-none transition-all text-sm"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
              </div>
            </div>

            {/* 5. Xác nhận mật khẩu (Mới thêm) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5 outline-none transition-all text-sm"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={17} />
              </div>
            </div>

            {/* Điều khoản */}
            <p className="text-[11px] text-slate-400 px-1 pt-2 leading-relaxed">
              Bằng cách đăng ký, bạn đồng ý với <span className="text-brand font-bold cursor-pointer hover:underline">Điều khoản dịch vụ</span> của SaHa.
            </p>

            {/* Nút đăng ký */}
            <button className="w-full bg-brand text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-brand/20 hover:bg-brand-hover hover:shadow-brand/30 transition-all active:scale-[0.98] mt-2">
              Đăng ký tài khoản
            </button>
          </form>
        </div>

        {/* Chuyển sang đăng nhập */}
        <p className="text-center mt-8 text-sm text-slate-400">
          Đã có tài khoản? 
          <span 
            onClick={() => navigate('/login')} 
            className="font-bold text-brand ml-1 cursor-pointer hover:underline"
          >
            Đăng nhập ngay
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;