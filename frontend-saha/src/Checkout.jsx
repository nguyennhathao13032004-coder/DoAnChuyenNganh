import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingBag, CreditCard, Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useCart } from './CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  useEffect(() => {
    if (cart.length === 0) navigate('/cart');
  }, [cart, navigate]);

  // ==========================================
  // 1. STATE QUẢN LÝ FORM & ĐỊA CHỈ
  // ==========================================
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    note: ''
  });

  // State lưu danh sách tỉnh/huyện/xã lấy từ API
  const [locations, setLocations] = useState({ provinces: [], districts: [], wards: [] });
  
  // State lưu ID và Tên địa danh người dùng đang chọn
  const [selectedAddr, setSelectedAddr] = useState({
    provinceId: '', provinceName: '',
    districtId: '', districtName: '',
    wardId: '', wardName: ''
  });

  // ==========================================
  // 2. TỰ ĐỘNG CẬP NHẬT TỈNH/THÀNH MỚI NHẤT (API Esgoo - Cập nhật liên tục sáp nhập)
  // ==========================================
  useEffect(() => {
    // Lấy danh sách Tỉnh/Thành
    axios.get('https://esgoo.net/api-tinhthanh/1/0.htm').then(res => {
      if(res.data.error === 0) setLocations(prev => ({ ...prev, provinces: res.data.data }));
    });
  }, []);

  const handleProvinceChange = (e) => {
    const pId = e.target.value;
    const pName = e.target.options[e.target.selectedIndex].text;
    setSelectedAddr({ provinceId: pId, provinceName: pName, districtId: '', districtName: '', wardId: '', wardName: '' });
    
    // Lấy danh sách Quận/Huyện dựa vào Tỉnh
    if(pId) {
      axios.get(`https://esgoo.net/api-tinhthanh/2/${pId}.htm`).then(res => {
        if(res.data.error === 0) setLocations(prev => ({ ...prev, districts: res.data.data, wards: [] }));
      });
    }
  };

  const handleDistrictChange = (e) => {
    const dId = e.target.value;
    const dName = e.target.options[e.target.selectedIndex].text;
    setSelectedAddr(prev => ({ ...prev, districtId: dId, districtName: dName, wardId: '', wardName: '' }));
    
    // Lấy danh sách Phường/Xã dựa vào Quận/Huyện
    if(dId) {
      axios.get(`https://esgoo.net/api-tinhthanh/3/${dId}.htm`).then(res => {
        if(res.data.error === 0) setLocations(prev => ({ ...prev, wards: res.data.data }));
      });
    }
  };

  const handleWardChange = (e) => {
    const wId = e.target.value;
    const wName = e.target.options[e.target.selectedIndex].text;
    setSelectedAddr(prev => ({ ...prev, wardId: wId, wardName: wName }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ==========================================
  // 3. XỬ LÝ TÍNH TOÁN & CHỐT ĐƠN (GỬI C#)
  // ==========================================
  const safeCartTotal = Number(cartTotal) || 0;
  const shipping = safeCartTotal >= 500000 ? 0 : 30000;
  const finalTotal = safeCartTotal + shipping;
  const freeshipProgress = safeCartTotal >= 500000 ? 100 : (safeCartTotal / 500000) * 100;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if(!formData.fullName || !formData.phone || !formData.street || !selectedAddr.wardName) {
      alert("Sếp vui lòng điền đầy đủ thông tin giao hàng nhé!");
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const fullAddress = `${formData.street}, ${selectedAddr.wardName}, ${selectedAddr.districtName}, ${selectedAddr.provinceName}`;

      const orderPayload = {
        userId: currentUser ? currentUser.id : null, 
        totalAmount: finalTotal,
        shippingAddress: `Người nhận: ${formData.fullName} | SĐT: ${formData.phone} | Địa chỉ: ${fullAddress} | Email: ${formData.email} | Ghi chú: ${formData.note || 'Không'}`,
        paymentMethod: paymentMethod, 
        items: cart.map(item => ({
          productId: item.id,
          qty: item.quantity,
          priceAtPurchase: item.price
        }))
      };

      const response = await axios.post('http://localhost:5246/api/Orders', orderPayload);

      if(response.status === 200 || response.status === 201) {
        clearCart(); 

        if (paymentMethod === 'vnpay' && response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          alert("🎉 ĐẶT HÀNG THÀNH CÔNG! SaHa sẽ sớm giao hàng cho bạn.");
          navigate('/order-history');
        }
      }
    } catch (error) {
      const realError = error.response?.data?.error || error.response?.data?.message || "Lỗi không xác định từ Backend";
      alert("❌ Bị Database từ chối rồi sếp ơi! Lý do: " + realError);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-slate-800">
      {/* HEADER TỐI GIẢN */}
      <header className="bg-white border-b border-slate-100 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer">
             <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
               <ShieldCheck className="text-orange-500" size={24} />
             </div>
             <span className="text-2xl font-black text-slate-900 tracking-tight">SaHa Health</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
            <ShoppingBag size={18} /> Giỏ hàng của bạn
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm mb-10">
          <ArrowLeft size={18} /> Tiếp tục mua sắm
        </button>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN TỐI GIẢN (Giống UI sếp gửi) */}
          <div className="lg:col-span-7 space-y-12">
            
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-medium tracking-wide uppercase mb-8">THÔNG TIN GIAO HÀNG</h2>
              
              {/* PHẦN 1 */}
              <p className="text-sm text-slate-400 mb-6 font-medium">1. Thông tin người mua hàng</p>
              <div className="space-y-6 max-w-lg">
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Họ và tên" className="w-full pb-2 bg-transparent border-b border-slate-300 focus:border-slate-800 outline-none transition-colors text-slate-700 placeholder:text-slate-400" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email liên hệ..." className="w-full pb-2 bg-transparent border-b border-slate-300 focus:border-slate-800 outline-none transition-colors text-slate-700 placeholder:text-slate-400" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Số điện thoại..." className="w-full pb-2 bg-transparent border-b border-slate-300 focus:border-slate-800 outline-none transition-colors text-slate-700 placeholder:text-slate-400" />
                <input required type="text" name="street" value={formData.street} onChange={handleInputChange} placeholder="Số nhà, Tên đường..." className="w-full pb-2 bg-transparent border-b border-slate-300 focus:border-slate-800 outline-none transition-colors text-slate-700 placeholder:text-slate-400" />
              </div>

              {/* PHẦN 2 */}
              <p className="text-sm text-slate-400 mt-10 mb-6 font-medium">2. Thông tin địa chỉ giao hàng</p>
              <div className="space-y-6 max-w-lg">
                <div>
                   <label className="block text-sm text-slate-600 mb-2">Tỉnh / Thành Phố</label>
                   <select required value={selectedAddr.provinceId} onChange={handleProvinceChange} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-full outline-none focus:border-slate-800 transition-colors text-slate-700 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_16px_center]">
                     <option value="">Chọn Tỉnh / Thành phố</option>
                     {locations.provinces.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm text-slate-600 mb-2">Quận / Huyện</label>
                   <select required value={selectedAddr.districtId} onChange={handleDistrictChange} disabled={!selectedAddr.provinceId} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-full outline-none focus:border-slate-800 transition-colors text-slate-700 cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_16px_center]">
                     <option value="">Chọn Quận / Huyện</option>
                     {locations.districts.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm text-slate-600 mb-2">Phường / Xã</label>
                   <select required value={selectedAddr.wardId} onChange={handleWardChange} disabled={!selectedAddr.districtId} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-full outline-none focus:border-slate-800 transition-colors text-slate-700 cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:10px_10px] bg-[right_16px_center]">
                     <option value="">Chọn Phường / Xã</option>
                     {locations.wards.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                   </select>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center md:text-left">
              <h2 className="text-2xl font-medium tracking-wide uppercase mb-6">PHƯƠNG THỨC THANH TOÁN</h2>
              <div className="space-y-5 max-w-lg mx-auto md:mx-0">
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center ${paymentMethod === 'vnpay' ? 'border-orange-500' : ''}`}>
                    {paymentMethod === 'vnpay' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                  </div>
                  <input type="radio" name="payment" value="vnpay" checked={paymentMethod === 'vnpay'} onChange={() => setPaymentMethod('vnpay')} className="hidden" />
                  <span className="text-[15px] font-medium text-slate-700">Thanh toán VNPAY</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-orange-500' : ''}`}>
                    {paymentMethod === 'cod' && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                  </div>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                  <span className="text-[15px] font-medium text-slate-700">Thanh toán khi nhận hàng</span>
                </label>
                
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CARD TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 sticky top-24">
              <h2 className="text-xl font-black mb-8">Tóm tắt đơn hàng</h2>
              
              {/* Freeship Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2 text-slate-500">
                  <span>Tiến trình freeship</span>
                  <span className="font-bold text-slate-800">{Math.min(100, freeshipProgress).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, freeshipProgress)}%` }}></div>
                </div>
              </div>

              {/* Order Lines */}
              <div className="space-y-4 mb-6 text-[15px] border-b border-slate-100 pb-6">
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-400"/> Tạm tính</span>
                  <span className="text-slate-800">{safeCartTotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-400"/> Vận chuyển</span>
                  <span className="text-slate-800">{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()}đ`}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-slate-400"/> Ưu đãi</span>
                  <span className="text-slate-800">0đ</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-base font-bold text-slate-800">Tổng cộng</span>
                <span className="text-[28px] font-black text-orange-500">{finalTotal.toLocaleString()} VNĐ</span>
              </div>

              <button type="submit" className="w-full bg-[#111827] hover:bg-orange-500 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-lg shadow-slate-200">
                <CreditCard size={20} /> Thanh toán ngay
              </button>
            </div>
          </div>
          
        </form >
      </main>
    </div>
  );
};

export default Checkout;