import React, { useState, useEffect } from 'react';
import ChatAI from './ChatAI.jsx';
import { supabase } from './services/supabase';
// GỘP CHUNG VÀO 1 KHỐI NÀY THÔI SẾP NHÉ (Đã thêm Camera vào cuối):
import { 
  Search, ShoppingCart, User, Phone, ShieldCheck, 
  ChevronRight, HeartPulse, Sparkles, MapPin, Mail, 
  Facebook, Instagram, Youtube, Clock,
  Pill, Leaf, Eye, LogOut, Camera,
  ScanLine, ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';
import FloatingPrescription from './FloatingPrescription';
import AiHealthQuiz from './AiHealthQuiz';
import SnapMatchModal from './SnapMatchModal'; 
import PrescriptionScanner from './PrescriptionScanner';

const mockCategories = [
  { id: 1, name: 'Vitamin & Khoáng chất', icon: '💊' },
  { id: 2, name: 'Miễn dịch & Đề kháng', icon: '🛡️' },
  { id: 3, name: 'Sinh lý & Nội tiết tố', icon: '🧬' },
  { id: 4, name: 'Mắt & Thị lực', icon: '👁️' },
  { id: 5, name: 'Tiêu hóa', icon: '🌿' },
  { id: 6, name: 'Thần kinh & Không / Não', icon: '🧠' },
  { id: 7, name: 'Hỗ trợ làm đẹp', icon: '✨' },
  { id: 8, name: 'Đường huyết & Tiểu đường', icon: '🩸' },
  { id: 9, name: 'Tim mạch & Huyết áp', icon: '❤️' },
  { id: 10, name: 'Hô hấp & Tai mũi họng', icon: '🫁' },
  { id: 11, name: 'Cơ xương khớp', icon: '🦴' },
  { id: 12, name: 'Gan mật', icon: '🧪' },
  { id: 13, name: 'Thận & Tiết niệu', icon: '💧' },
];

const App = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiQuizOpen, setIsAiQuizOpen] = useState(false);
  // --- BỔ SUNG CÁC BIẾN CÒN THIẾU GIỮ NGUYÊN LOGIC ---
  const { cartCount, isAnimating } = useCart(); 
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [realProducts, setRealProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(mockCategories); // Gán dữ liệu mẫu để hiện danh mục
  const [menuProducts, setMenuProducts] = useState([]);
  
  useEffect(() => {
    // 1. Kiểm tra đăng nhập
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 2. Lấy danh sách sản phẩm thật
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5246/api/Products');
        setRealProducts(res.data);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm từ Backend:", error);
      }
    };

    // 3. Lấy danh sách bài viết thật
    const fetchBlogs = async () => {
      try {
        const res = await axios.get('http://localhost:5246/api/Blogs');
        setBlogs(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách bài viết:", error);
      }
    };

    fetchProducts();
    fetchBlogs();
  }, []);

  // ==========================================
  // HÀM ĐĂNG XUẤT ĐÃ ĐƯỢC CẬP NHẬT
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload(); // Tải lại trang để kích hoạt Giỏ hàng Guest
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-slate-800 selection:bg-brand selection:text-white relative">
      
      <div className="bg-brand text-white text-xs py-2 font-medium tracking-wide">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> SaHa cam kết 100% hàng chính hãng</span>
          <span className="flex items-center gap-1.5"><Phone size={14} /> Hotline: 0858.433.409</span>
        </div>
      </div>

      {/* 2. HEADER */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
          
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer group shrink-0">
            <div className="bg-brand-light p-2 rounded-xl">
              <HeartPulse size={32} className="text-brand" />
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tight">Sa<span className="text-brand">Ha</span></span>
          </div>

          {/* Ô TÌM KIẾM TÍCH HỢP AI CAMERA */}
          <div className="flex-1 max-w-2xl relative group">
            <input 
              type="text" 
              placeholder="Tìm sản phẩm ... " 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/products?search=${searchQuery}`)}
              // Đã đổi pr-14 thành pr-24 để không đè chữ vào 2 nút bên phải
              className="w-full pl-5 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:bg-white focus:ring-2 focus:ring-brand outline-none transition-all text-sm" 
            />

            {/* NÚT 1: MẮT THẦN CAMERA AI */}
            <button 
              onClick={() => setIsSnapModalOpen(true)}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              title="Tìm thuốc bằng hình ảnh vỏ hộp"
            >
              <Camera size={20} />
            </button>

            {/* NÚT 2: TÌM KIẾM CHỮ */}
            <button 
              onClick={() => navigate(`/products?search=${searchQuery}`)}
              className="absolute right-1.5 top-1.5 bg-brand text-white p-1.5 rounded-full hover:bg-brand-hover transition-colors"
            >
              <Search size={18} />
            </button>
          </div>

          <div className="flex gap-6 items-center shrink-0">
            
            {/* KIỂM TRA ĐĂNG NHẬP */}
            {user ? (
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => navigate('/profile')}
                  className="flex flex-col items-center text-brand cursor-pointer hover:scale-105 transition-transform"
                  title="Xem hồ sơ cá nhân"
                >
                  <User size={22} className="mb-0.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider max-w-[85px] truncate">
                    {user.fullName || user.username}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-200"></div>
                
                {/* NÚT THOÁT ĐÃ ĐƯỢC THÊM HIỆU ỨNG VÀ HÀM LOGOUT */}
                <div 
                  onClick={handleLogout}
                  className="flex flex-col items-center cursor-pointer text-slate-400 hover:text-rose-500 transition-colors group"
                  title="Đăng xuất tài khoản"
                >
                  <LogOut size={20} className="mb-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Thoát</span>
                </div>

              </div>
            ) : (
              <div onClick={() => navigate('/login')} className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-brand transition-colors">
                <User size={22} className="mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Tài khoản</span>
              </div>
            )}

            <div onClick={() => navigate('/cart')} className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-brand transition-colors relative group">
            <div className="relative">
            {/* Icon xe đẩy */}
            <ShoppingCart size={22} className="mb-0.5 group-hover:scale-110 transition-transform" />
    
            {/* CHẤM ĐỎ BIẾT NHẢY */}
            {cartCount > 0 && (
              <span 
                className={`absolute -top-2 -right-2 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white transition-all duration-300 ease-out
                ${isAnimating ? 'scale-150 -translate-y-2 bg-orange-500 shadow-lg' : 'scale-100 bg-rose-500'}`
            }
            >
              {cartCount}
      </span>
    )}
  </div>
  <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Giỏ hàng</span>
</div>
          </div>
        </div>

        <div className="border-t border-slate-50 bg-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center relative">

            <div
              onMouseEnter={() => setIsMenuOpen(true)}
              onMouseLeave={() => setIsMenuOpen(false)}
              className="relative"
            >
              <button className="bg-brand text-white px-8 py-3 flex items-center gap-3 font-bold text-sm rounded-t-lg">
                <ChevronRight size={18} className={`transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} /> Danh mục
              </button>

              {isMenuOpen && (
                <div className="absolute top-full left-0 w-[1050px] bg-white shadow-2xl rounded-b-3xl border border-slate-100 p-8 flex gap-8 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  
                  {/* CỘT 1: THỰC PHẨM CHỨC NĂNG CƠ BẢN */}
                  <div className="flex-1">
                    <h4 className="font-bold text-brand mb-4 pb-2 border-b border-orange-50 uppercase text-xs tracking-widest">Thực Phẩm Chức Năng</h4>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                      <li onClick={() => navigate('/products?category=1')} className="hover:text-brand cursor-pointer transition-colors">1. Vitamin & Khoáng chất</li>
                      <li onClick={() => navigate('/products?category=2')} className="hover:text-brand cursor-pointer transition-colors">2. Miễn dịch & Đề kháng</li>
                      <li onClick={() => navigate('/products?category=3')} className="hover:text-brand cursor-pointer transition-colors">3. Sinh lý & Nội tiết tố</li>
                      <li onClick={() => navigate('/products?category=4')} className="hover:text-brand cursor-pointer transition-colors">4. Mắt & Thị lực</li>
                      <li onClick={() => navigate('/products?category=5')} className="hover:text-brand cursor-pointer transition-colors">5. Tiêu hóa</li>
                      <li onClick={() => navigate('/products?category=7')} className="hover:text-brand cursor-pointer transition-colors">7. Hỗ trợ làm đẹp</li>
                      <li onClick={() => navigate('/products?category=11')} className="hover:text-brand cursor-pointer transition-colors">11. Cơ xương khớp</li>
                    </ul>
                  </div>

                  {/* CỘT 2: HỖ TRỢ BỆNH LÝ */}
                  <div className="flex-1">
                    <h4 className="font-bold text-brand mb-4 pb-2 border-b border-orange-50 uppercase text-xs tracking-widest">Hỗ Trợ Bệnh Lý</h4>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                      <li onClick={() => navigate('/products?category=6')} className="hover:text-brand cursor-pointer transition-colors">6. Thần kinh & Não</li>
                      <li onClick={() => navigate('/products?category=8')} className="hover:text-brand cursor-pointer transition-colors">8. Đường huyết & Tiểu đường</li>
                      <li onClick={() => navigate('/products?category=9')} className="hover:text-brand cursor-pointer transition-colors">9. Tim mạch & Huyết áp</li>
                      <li onClick={() => navigate('/products?category=10')} className="hover:text-brand cursor-pointer transition-colors">10. Hô hấp & Tai mũi họng</li>
                      <li onClick={() => navigate('/products?category=12')} className="hover:text-brand cursor-pointer transition-colors">12. Gan mật</li>
                      <li onClick={() => navigate('/products?category=13')} className="hover:text-brand cursor-pointer transition-colors">13. Thận & Tiết niệu</li>
                    </ul>
                  </div>

                  {/* CỘT 3: DỊCH VỤ Y TẾ & TƯ VẤN (TÔ MÀU XANH NỔI BẬT) */}
                  <div className="flex-1">
                    <h4 className="font-bold text-emerald-600 mb-4 pb-2 border-b border-emerald-50 uppercase text-xs tracking-widest">Dịch Vụ Y Tế SaHa</h4>
                    <ul className="space-y-4 text-sm text-slate-700">
                      
                      {/* SỬA LINK 1: HỒ SƠ Y TẾ */}
                      <li onClick={() => navigate('/ho-so-y-te')} className="hover:text-emerald-600 cursor-pointer transition-colors font-bold flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="M9 15h6"></path></svg>
                        </div>
                        Hồ sơ y tế cá nhân
                      </li>
                      
                      {/* SỬA LINK 2 + ICON TAI NGHE: TRỢ LÝ DƯỢC SĨ */}
                      <li onClick={() => navigate('/tu-van')} className="hover:text-emerald-600 cursor-pointer transition-colors font-bold flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"></path>
                            <path d="M21 16v2a4 4 0 0 1-4 4h-5"></path>
                          </svg>
                        </div>
                        Trợ lý dược sĩ
                      </li>

                     {/* ĐÃ THU NHỎ: MUA THUỐC THEO ĐƠN AI (GIỐNG HỆT CÁC LINK CŨ) */}
                      <li 
                        onClick={() => navigate('/scan')} 
                        className="hover:text-brand cursor-pointer transition-colors font-bold flex items-center gap-3 group"
                      >
                      <div className="w-8 h-8 rounded-full bg-orange-50 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                        <ScanLine size={16} />
                      </div>
                              Mua thuốc theo đơn AI
                    </li>
                    </ul>

                    <div className="mt-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[11px] text-emerald-700 leading-relaxed font-semibold italic">
                        "SaHa lưu trữ bảo mật hồ sơ sức khỏe và đồng hành tư vấn trọn đời cho bạn và gia đình."
                      </p>
                    </div>
                  </div>

                  {/* CỘT 4: SẢN PHẨM MỚI */}
                  <div className="flex-1 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-widest">Sản phẩm mới</h4>
                    <div className="space-y-4">
                      <div onClick={() => navigate('/products?category=1')} className="flex gap-3 items-center cursor-pointer group bg-white p-2 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-white rounded-xl shrink-0 overflow-hidden border border-slate-100 group-hover:border-brand/30 transition-colors">
                          <img src="https://placehold.co/100x100/ea580c/white?text=DHC" className="w-full h-full object-cover" alt="DHC" />
                        </div>
                        <p className="text-[11px] font-bold leading-snug line-clamp-2 group-hover:text-brand transition-colors">Viên uống DHC Multi Vitamins gói 90 ngày</p>
                      </div>
                      <div onClick={() => navigate('/products?category=9')} className="flex gap-3 items-center cursor-pointer group bg-white p-2 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-white rounded-xl shrink-0 overflow-hidden border border-slate-100 group-hover:border-brand/30 transition-colors">
                          <img src="https://placehold.co/100x100/ea580c/white?text=Omega" className="w-full h-full object-cover" alt="Omega" />
                        </div>
                        <p className="text-[11px] font-bold leading-snug line-clamp-2 group-hover:text-brand transition-colors">Omega 3-6-9 Dầu cá hồi Na-uy bảo vệ tim mạch</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            <nav className="flex items-center ml-10 gap-8">
  {['Sản phẩm', 'Thương hiệu', 'Xuất xứ', 'Bài viết'].map((item) => (
    <div 
      key={item} 
      onClick={() => {
        if (item === 'Bài viết') navigate('/blogs');
        else if (item === 'Thương hiệu') navigate('/brands');
        else if (item === 'Xuất xứ') navigate('/origins'); // THÊM DÒNG NÀY
        else navigate('/products');
      }}
      className="group relative py-3 cursor-pointer"
    >
      <span className="text-sm font-bold text-slate-600 group-hover:text-brand transition-colors flex items-center gap-1">
        {item} <ChevronRight size={14} className="rotate-90 opacity-40" />
      </span>
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand group-hover:w-full transition-all duration-300"></div>
    </div>
  ))}
  {/* 2. THÊM MENU DỊCH VỤ Y TẾ SAHA VÀO ĐÂY (Đã chỉnh lại CSS đồng đều 100%) */}
  <div className="group relative py-3 cursor-pointer">
    
    {/* CHỈNH LẠI CHỖ NÀY: Dùng font-bold và text-slate-600 cho giống hệt anh em nó */}
    <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
      Dịch vụ y tế SaHa <ChevronRight size={14} className="rotate-90 opacity-40 group-hover:rotate-180 transition-transform duration-300" />
    </span>
    
    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></div>

    {/* Bảng Dropdown xổ xuống (Giữ nguyên không đổi) */}
    <div className="absolute top-full right-0 w-64 bg-white shadow-2xl rounded-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
      <ul className="py-2">
        <li onClick={() => navigate('/ho-so-y-te')} className="px-5 py-3 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 text-sm font-bold flex items-center gap-3 transition-colors">
          <div className="text-emerald-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="M9 15h6"></path></svg>
          </div>
          Hồ sơ y tế cá nhân
        </li>
        
        <li onClick={() => navigate('/tu-van')} className="px-5 py-3 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 text-sm font-bold flex items-center gap-3 transition-colors">
          <div className="text-emerald-500">
            {/* Đã thay icon Điện thoại thành icon Tai nghe (Trợ lý) cực xịn */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"></path>
              <path d="M21 16v2a4 4 0 0 1-4 4h-5"></path>
            </svg>
          </div>
          Trợ lý dược sĩ
        </li>
        <div className="h-px bg-slate-100 my-1 mx-4"></div>
        <li 
            onClick={() => navigate('/scan')} 
            className="px-5 py-3 hover:bg-orange-50 text-slate-700 hover:text-brand text-sm font-bold flex items-center gap-3 transition-colors group/scan"
        >
          <div className="text-brand group-hover/scan:animate-pulse">
       {/* Icon máy quét nhỏ gọn đúng chuẩn */}
      <ScanLine size={18} />
      </div>
            Mua thuốc theo đơn AI
      </li>
      </ul>
    </div>
  </div>
</nav>
          </div>
        </div>
        {/* MODAL MẮT THẦN ĐẶT Ở ĐÂY */}
        <SnapMatchModal isOpen={isSnapModalOpen} onClose={() => setIsSnapModalOpen(false)} />
      </header>

      {/* 3. HERO BANNER */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-brand-light rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-brand text-xs font-bold rounded-full mb-6 shadow-sm">
              <Sparkles size={14} /> Trợ lý AI tư vấn 24/7
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-5 leading-tight">
              Sức khỏe vững vàng, <br /><span className="text-brand">An tâm mỗi ngày.</span>
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Nhà thuốc SaHa cung cấp hàng ngàn sản phẩm TPCN chính hãng. Trải nghiệm tính năng hỏi đáp cùng Dược Sĩ AI thông minh nhất.
            </p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-brand text-white px-8 py-3.5 rounded-full font-bold hover:bg-brand-hover shadow-lg hover:shadow-brand/40 transition-all flex items-center gap-2"
            >
              Mua sắm ngay <ChevronRight size={18} />
            </button>
          </div>
          <div className="hidden md:block relative z-10 w-72 h-72 rounded-[3rem] rotate-3 shadow-2xl overflow-hidden border-4 border-white">
            <img src="https://placehold.co/600x600/ea580c/white?text=SaHa" alt="Banner" className="w-full h-full object-cover" />
          </div>
          <HeartPulse size={300} className="absolute -right-20 -bottom-20 text-orange-200 opacity-30" />
        </div>
      </div>
      
      {/* DANH MỤC TRUNG TÂM (Đã thay đổi Icon và Gắn Link chuyển trang) */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Danh Mục Chăm Sóc</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories
            .filter(cat => ['Vitamin & Khoáng chất', 'Hỗ trợ làm đẹp', 'Tiêu hóa', 'Miễn dịch & Đề kháng', 'Mắt & Thị lực'].includes(cat.name))
            .slice(0, 5)
            .map((cat) => {
              // Gán Icon Lucide tương ứng
              let IconComponent = Sparkles; 
              if (cat.name === 'Vitamin & Khoáng chất') IconComponent = Pill;
              if (cat.name === 'Tiêu hóa') IconComponent = Leaf;
              if (cat.name === 'Miễn dịch & Đề kháng') IconComponent = ShieldCheck;
              if (cat.name === 'Mắt & Thị lực') IconComponent = Eye;
              if (cat.name === 'Hỗ trợ làm đẹp') IconComponent = Sparkles;

              return (
                <div 
                  key={cat.id} 
                  // Gắn State categoryId để gửi sang trang Danh sách sản phẩm
                  onClick={() => navigate('/products', { state: { categoryId: cat.id } })} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center cursor-pointer hover:border-brand/50 hover:shadow-md transition-all group"
                >
                  <div className="mb-3 bg-slate-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center group-hover:bg-brand-light transition-colors">
                    <IconComponent size={32} className="text-slate-600 group-hover:text-brand transition-colors" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm group-hover:text-brand transition-colors">{cat.name}</p>
                </div>
              );
          })}
        </div>
      </div>
          
      {/* 5. SẢN PHẨM KHUYÊN DÙNG */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-black text-slate-900">Sản Phẩm Khuyên Dùng</h3>
          <button onClick={() => navigate('/products')} className="text-brand font-semibold text-sm hover:underline">Xem tất cả</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {realProducts.slice(0, 5).map(product => (
            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col cursor-pointer">
              <div className="relative aspect-square mb-4 rounded-xl overflow-hidden">
                {product.oldPrice && (
                  <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full z-10">
                    -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                )}
                <img src={product.imageUrl || 'https://placehold.co/400x400/fff7ed/ea580c?text=SaHa+Product'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <p className="text-[10px] font-bold text-brand uppercase mb-1">{product.category || 'Sản phẩm'}</p>
              <h4 className="font-bold text-slate-800 text-sm mb-3 flex-1 line-clamp-2">{product.name}</h4>
              <div className="flex items-end justify-between pt-3 border-t border-slate-50">
                <div>
                  <div className="text-lg font-black text-brand">{product.price ? product.price.toLocaleString() : '0'}đ</div>
                  {product.oldPrice && <div className="text-xs text-slate-400 line-through">{product.oldPrice.toLocaleString()}đ</div>}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/cart');
                  }}
                  className="bg-brand-light text-brand p-2 rounded-lg hover:bg-brand hover:text-white transition-colors"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {realProducts.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-500">
              Chưa có sản phẩm nào trong hệ thống! Hào vào Backend thêm vài dòng nhé.
            </div>
          )}
        </div>
      </div>
      
      {/* 6. GÓC SỨC KHỎE SAHA */}
      <div className="max-w-7xl mx-auto px-4 mt-16 mb-16">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Góc Sức Khỏe SaHa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((blog) => {
            const defaultImage = "https://placehold.co/600x400/ea580c/ffffff?text=SaHa+Pharmacy";

            return (
              <div 
                key={blog.id} 
                onClick={() => navigate(`/blogs/${blog.id}`)}
                className="flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 group cursor-pointer"
              >
                <div className="h-56 overflow-hidden">
                  <img 
                    src={blog.imageUrl || defaultImage} 
                    alt={blog.title}
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = defaultImage; 
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                    <Clock size={16} />
                    {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  <p className="text-slate-500 line-clamp-3 mb-6 flex-grow text-sm leading-relaxed">
                    {blog.content}
                  </p>
                  
                  <button className="flex items-center gap-2 text-brand font-black text-sm uppercase tracking-wider mt-auto">
                    ĐỌC BÀI VIẾT <span className="text-lg">›</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div onClick={() => navigate('/')} className="flex items-center gap-2 mb-6 cursor-pointer">
              <HeartPulse size={32} className="text-brand" />
              <span className="text-3xl font-black text-white tracking-tight">Sa<span className="text-brand">Ha</span></span>
            </div>
            <p className="text-sm mb-6 leading-relaxed">Hệ thống nhà thuốc SaHa chuyên cung cấp dược phẩm, thực phẩm chức năng chính hãng với công nghệ AI hỗ trợ tư vấn thông minh.</p>
            <div className="flex gap-4">
              <Facebook className="hover:text-brand cursor-pointer transition-colors" />
              <Instagram className="hover:text-brand cursor-pointer transition-colors" />
              <Youtube className="hover:text-brand cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Danh mục</h4>
            <ul className="space-y-3 text-sm">
              <li onClick={() => navigate('/products')} className="hover:text-brand cursor-pointer transition-colors">Thực phẩm chức năng</li>
              <li onClick={() => navigate('/products')} className="hover:text-brand cursor-pointer transition-colors">Dược mỹ phẩm</li>
              <li onClick={() => navigate('/products')} className="hover:text-brand cursor-pointer transition-colors">Chăm sóc cá nhân</li>
              <li onClick={() => navigate('/products')} className="hover:text-brand cursor-pointer transition-colors">Thiết bị y tế</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Hỗ trợ khách hàng</h4>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-brand cursor-pointer transition-colors">Chính sách đổi trả</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Chính sách bảo mật</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Câu hỏi thường gặp (FAQ)</li>
              <li className="hover:text-brand cursor-pointer transition-colors">Hướng dẫn mua hàng</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Liên hệ</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand shrink-0" />
                <span>Số 06 Trần Văn Ơn, Phú Hòa, Thủ Dầu Một, Bình Dương</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-brand shrink-0" />
                <span>0858.433.409</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-brand shrink-0" />
                <span>hotro@saha.vn</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm">
          <p>© 2026 Nhà thuốc SaHa. Đồ án chuyên ngành.</p>
        </div>
      </footer>

      {/* 8. NÚT FLOATING */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 items-end">
        <button className="bg-green-500 text-white p-3.5 rounded-full shadow-lg hover:scale-110 hover:bg-green-600 transition-all">
          <Phone size={24} />
        </button>
              <FloatingPrescription />
        <button className="bg-brand text-white p-4 rounded-full shadow-xl shadow-brand/30 hover:scale-110 hover:bg-brand-hover transition-all flex items-center gap-3 group">
          <Sparkles size={26} className="animate-pulse" />
          <span className="font-bold hidden group-hover:block whitespace-nowrap overflow-hidden origin-right transition-all">Hỏi AI SaHa</span>
        </button>
      </div>

      <ChatAI />
    </div>
  );
};

export default App;