import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { ChevronRight, ArrowRight, Activity, CalendarDays, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HealthRecordDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [warning, setWarning] = useState(null);
  
  const [weight, setWeight] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [painLevel, setPainLevel] = useState('');

  // 1. TẠO STATE ĐỂ LƯU TÊN NGƯỜI DÙNG ĐỘNG (Không fix cứng nữa)
  const [patientName, setPatientName] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');

  // 2. KIỂM TRA ĐĂNG NHẬP NGAY KHI VÀO TRANG
  useEffect(() => {
    // Sếp kiểm tra xem lúc Login sếp lưu thông tin vào localStorage tên là gì nhé (thường là 'user')
    const storedUser = localStorage.getItem('user'); 
    
    if (!storedUser) {
      alert("Bạn cần đăng nhập để xem Hồ sơ sức khỏe cá nhân!");
      navigate('/login'); // Chưa đăng nhập thì đuổi về trang Login
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      // Lấy tên thật của user (Tùy backend của sếp trả về key là fullName, FullName hay username)
      const currentUserName = parsedUser.fullName || parsedUser.FullName || parsedUser.username || parsedUser.Username;
      setPatientName(currentUserName);
    } catch (error) {
      console.error("Lỗi đọc dữ liệu user:", error);
      navigate('/login');
    }
  }, [navigate]);


  // 3. HÀM TẢI DỮ LIỆU ĐƯỢC CHỈNH LẠI NHẬN THAM SỐ TÊN (name)
  const fetchHealthData = async (name) => {
    try {
      // Lấy data đúng theo tên người đang đăng nhập
      const historyRes = await axios.get(`http://localhost:5246/api/HealthRecord/history/${name}`);
      const formattedData = historyRes.data.map(item => ({
        ...item,
        displayDate: new Date(item.recordDate).toLocaleDateString('vi-VN')
      }));
      setData(formattedData);

      const warningRes = await axios.get(`http://localhost:5246/api/HealthRecord/check-warning/${name}`);
      setWarning(warningRes.data);
    } catch (error) {
      console.error("Lỗi kết nối Backend hoặc user chưa có dữ liệu:", error);
      // Nếu là user mới tinh chưa có data thì set rỗng
      setData([]); 
      setWarning(null);
    }
  };

  // 4. CHỈ CHẠY FETCH DỮ LIỆU KHI ĐÃ CÓ TÊN (Đã đăng nhập thành công)
  useEffect(() => {
    if (patientName) {
      fetchHealthData(patientName);
    }
  }, [patientName]);


  const handleSaveRecord = async (e) => {
    e.preventDefault();
    const newRecord = {
      patientName: patientName, // Đẩy tên động lên server
      weight: parseFloat(weight),
      sleepHours: parseFloat(sleepHours),
      painLevel: parseInt(painLevel)
    };

    try {
      await axios.post('http://localhost:5246/api/HealthRecord/add', newRecord);
      alert('Đã cập nhật chỉ số thành công!');
      setWeight(''); setSleepHours(''); setPainLevel('');
      fetchHealthData(patientName); // Cập nhật lại biểu đồ
    } catch (error) {
      alert('Lỗi khi lưu dữ liệu!');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const appointmentDateTime = new Date(`${bookDate}T${bookTime}`);
      const payload = {
        patientName: patientName, // Đẩy tên động lên server
        appointmentDate: appointmentDateTime.toISOString()
      };
      const res = await axios.post('http://localhost:5246/api/Appointment/book', payload);
      alert(res.data.message);
      setShowModal(false);
      setBookDate('');
      setBookTime('');
    } catch (error) {
      alert('Lỗi khi đặt lịch!');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-emerald-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        
        {/* Menu Điều Hướng */}
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 mb-12">
          <span onClick={() => navigate('/')} className="hover:text-emerald-600 cursor-pointer transition-colors">Trang chủ</span>
          <ChevronRight size={14} className="opacity-50" />
          <span className="text-slate-900">Hồ sơ cá nhân</span>
        </div>

        {/* Tiêu đề */}
        <div className="mb-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Tổng quan Sức khỏe</h1>
          {/* Hiển thị câu chào tên thật của user đang đăng nhập */}
          <p className="text-lg text-emerald-600 font-bold mb-2">Xin chào, {patientName}!</p>
          <p className="text-lg text-slate-500 font-medium max-w-2xl">Theo dõi các chỉ số cơ thể hàng ngày để Dược sĩ SaHa giúp bạn điều chỉnh phác đồ dinh dưỡng tốt nhất.</p>
        </div>

        {/* CẢNH BÁO SỨC KHỎE */}
        {warning && warning.needsConsultation && (
          <div className="mb-16 bg-red-50/50 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border border-red-100/50">
            <div className="flex gap-4 items-start">
              <div className="mt-1 text-red-500"><AlertCircle size={28} /></div>
              <div>
                <h3 className="text-red-800 font-black text-xl mb-2">Chỉ số báo động!</h3>
                <p className="text-red-600/80 font-medium">{warning.message}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="whitespace-nowrap bg-red-500 text-white font-bold px-8 py-4 rounded-full hover:bg-red-600 transition-all active:scale-95"
            >
              Đặt lịch Dược sĩ
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-20">
          {/* CỘT TRÁI: FORM NHẬP */}
          <div className="w-full lg:w-1/3">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="text-emerald-500">+</span> Cập nhật hôm nay
            </h2>
            
            <form onSubmit={handleSaveRecord} className="space-y-8">
              <div className="group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 group-focus-within:text-emerald-500 transition-colors">Cân nặng (kg)</label>
                <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required 
                       className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white p-4 rounded-2xl outline-none font-bold text-lg text-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-300" 
                       placeholder="Ví dụ: 65.5" />
              </div>
              
              <div className="group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 group-focus-within:text-emerald-500 transition-colors">Thời gian ngủ (tiếng)</label>
                <input type="number" step="0.5" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} required 
                       className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white p-4 rounded-2xl outline-none font-bold text-lg text-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-300" 
                       placeholder="Ví dụ: 7.5" />
              </div>

              <div className="group">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2 group-focus-within:text-emerald-500 transition-colors">Mức độ đau (1-10)</label>
                <input type="number" min="1" max="10" value={painLevel} onChange={(e) => setPainLevel(e.target.value)} required 
                       className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white p-4 rounded-2xl outline-none font-bold text-lg text-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all placeholder:font-normal placeholder:text-slate-300" 
                       placeholder="Đánh giá từ 1 đến 10" />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-5 rounded-full hover:bg-emerald-600 transition-all flex justify-center items-center gap-2 group mt-4">
                LƯU CHỈ SỐ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: BIỂU ĐỒ */}
          <div className="w-full lg:w-2/3">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Activity size={24} className="text-emerald-500" /> Biểu đồ xu hướng
            </h2>
            
            <div className="w-full h-[450px] -ml-4">
              {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} />
                    <Tooltip 
                      cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '16px', fontWeight: 'bold', color: '#1e293b' }} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '14px', fontWeight: 'bold', color: '#64748b' }} />
                    <Line type="monotone" dataKey="weight" name="Cân nặng (kg)" stroke="#10b981" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="painLevel" name="Mức độ đau" stroke="#f59e0b" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="sleepHours" name="Giờ ngủ" stroke="#3b82f6" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <Activity size={64} strokeWidth={1} className="mb-4" />
                  <p className="font-medium text-lg text-slate-400">Hệ thống đang chờ dữ liệu của bạn...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL ĐẶT LỊCH VẪN GIỮ NGUYÊN */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-slate-900 mb-2">Đặt Lịch</h3>
            <p className="text-slate-500 font-medium mb-8">Dược sĩ SaHa sẽ gọi điện trực tiếp cho bạn.</p>
            
            <form onSubmit={handleBookAppointment} className="space-y-6">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><CalendarDays size={14} className="inline mr-1"/> Chọn ngày</label>
                <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} required className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 outline-none font-bold text-slate-700" />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><Clock size={14} className="inline mr-1"/> Chọn giờ</label>
                <input type="time" value={bookTime} onChange={(e) => setBookTime(e.target.value)} required className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 outline-none font-bold text-slate-700" />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 text-slate-400 font-bold rounded-full hover:bg-slate-50 hover:text-slate-600 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-colors">Xác nhận Đặt lịch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthRecordDashboard;