import React from 'react';
import { HeartPulse, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
      
      {/* Chỉ để lệnh chuyển trang ở đúng cái nút này thôi */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-10 left-10 flex items-center gap-2 text-slate-400 hover:text-brand transition-all text-sm font-medium border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft size={18} /> Trang chủ
      </button>

      <div className="w-full max-w-[400px]">
        {/* Logo tối giản ở giữa */}
        <div className="text-center mb-10">
          <div className="inline-flex bg-brand-light p-3 rounded-2xl mb-4">
            <HeartPulse size={32} className="text-brand" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mừng bạn trở lại!</h2>
          <p className="text-slate-400 text-sm mt-2">Đăng nhập để tiếp tục cùng SaHa</p>
        </div>

        {/* Form trắng tinh khôi */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="name@gmail.com" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5 outline-none transition-all text-sm"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand/20 focus:ring-4 focus:ring-brand/5 outline-none transition-all text-sm"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>

            <div className="text-right">
              <a href="#" className="text-xs font-semibold text-brand/80 hover:text-brand">Quên mật khẩu?</a>
            </div>

            {/* Nút bấm Cam đặc trưng */}
            <button className="w-full bg-brand text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-brand/20 hover:bg-brand-hover hover:shadow-brand/30 transition-all active:scale-[0.98] mt-2">
              Đăng nhập
            </button>
          </form>
        </div>

        {/* Chuyển sang trang Register */}
        <p className="text-center mt-8 text-sm text-slate-400">
          Bạn mới biết đến SaHa? 
          <span 
            onClick={(e) => {
              e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt
              navigate('/register');
            }} 
            className="font-bold text-brand ml-1 cursor-pointer hover:underline"
          >
            Tạo tài khoản
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;