import React from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, 
  Settings, Search, Bell, Plus, TrendingUp, ArrowUpRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Dữ liệu giả cho Dashboard
  const stats = [
    { id: 1, label: 'Doanh thu tháng', value: '45.800.000đ', icon: <TrendingUp size={20}/>, color: 'bg-blue-50 text-blue-600' },
    { id: 2, label: 'Đơn hàng mới', value: '128', icon: <ShoppingBag size={20}/>, color: 'bg-emerald-50 text-emerald-600' },
    { id: 3, label: 'Tổng sản phẩm', value: '1,240', icon: <Package size={20}/>, color: 'bg-amber-50 text-amber-600' },
    { id: 4, label: 'Khách hàng', value: '850', icon: <Users size={20}/>, color: 'bg-purple-50 text-purple-600' },
  ];

  const recentOrders = [
    { id: '#SH-9921', customer: 'Nguyễn Văn A', product: 'Vitamin C 1000mg', amount: '350.000đ', status: 'Đã giao' },
    { id: '#SH-9922', customer: 'Trần Thị B', product: 'Omega 3 Fish Oil', amount: '420.000đ', status: 'Chờ xử lý' },
    { id: '#SH-9923', customer: 'Lê Văn C', product: 'Ginkgo Biloba', amount: '280.000đ', status: 'Đang giao' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans">
      
      {/* 1. SIDEBAR TỐI GIẢN */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-slate-900 p-1.5 rounded-lg text-white font-black text-xl italic">S.</div>
            <span className="font-black text-slate-900 tracking-tighter text-xl">SAHA ADMIN</span>
          </div>

          <nav className="space-y-1">
            {[
              { icon: <LayoutDashboard size={18}/>, label: 'Tổng quan', active: true },
              { icon: <Package size={18}/>, label: 'Kho hàng' },
              { icon: <ShoppingBag size={18}/>, label: 'Đơn hàng' },
              { icon: <Users size={18}/>, label: 'Khách hàng' },
              { icon: <Settings size={18}/>, label: 'Cài đặt' },
            ].map((item, index) => (
              <button key={index} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${item.active ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-50">
          <button onClick={() => navigate('/')} className="text-xs font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest">Đăng xuất</button>
        </div>
      </aside>

      {/* 2. NỘI DUNG CHÍNH */}
      <main className="flex-1 p-10">
        {/* Header Dashboard */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chào buổi sáng, Hào!</h2>
            <p className="text-slate-400 text-sm font-medium">Hôm nay hệ thống của bạn hoạt động ổn định.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder="Tìm dữ liệu..." className="pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-100 w-64" />
            </div>
            <button className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"><Bell size={20}/></button>
          </div>
        </header>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {stats.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`${item.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <h4 className="text-xl font-black text-slate-900">{item.value}</h4>
            </div>
          ))}
        </div>

        {/* Bảng đơn hàng gần đây */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-slate-50">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Đơn hàng mới nhất</h3>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
              <Plus size={16}/> Thêm sản phẩm
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5 text-sm font-bold text-slate-900">{order.id}</td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600">{order.customer}</td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600">{order.product}</td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">{order.amount}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;