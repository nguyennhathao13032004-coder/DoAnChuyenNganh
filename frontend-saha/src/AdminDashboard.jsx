import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingCart, Pill, Users, LogOut, TrendingUp, DollarSign, Package,
  Bell, Search, User, X, Plus, Edit, Trash2, Image as ImageIcon, AlertTriangle, Save, Leaf, 
  Clock, FileText, Sparkles, ShieldAlert, MessageSquare, BookOpen, Eye, Brain, 
  RefreshCw, Lightbulb, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const API_BASE_URL = 'http://localhost:5246/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState(null);

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [products, setProducts] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [productFormData, setProductFormData] = useState({
    name: '', price: '', stockQty: '', imageUrl: '', brand: ''
  });

  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerFormData, setCustomerFormData] = useState({ fullName: '', email: '', username: '' });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);

  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  // State quản lý việc nhập link Meet
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  // 1. Khai báo mảng chứa lịch hẹn
  const [appointments, setAppointments] = useState([]);

  // 2. Hàm gọi API lấy danh sách lịch hẹn
  const fetchAppointments = async () => {
      try {
          const res = await axios.get(`http://localhost:5246/api/Admin/appointments`);
          setAppointments(res.data);
      } catch (error) {
          console.error("Lỗi lấy lịch hẹn:", error);
      }
  };

  // 3. Hàm xử lý Duyệt/Từ chối
  const handleUpdateAptStatus = async (id, newStatus, link = '') => {
      try {
          await axios.put(`http://localhost:5246/api/Admin/appointments/${id}/status`, {
              status: newStatus,
              meetLink: link
          });
          
          fetchAppointments(); // Load lại dữ liệu
          setShowMeetModal(false); // Tắt form nhập link
          setMeetLink(''); // Xóa trắng ô nhập
      } catch (error) {
          alert("Không thể cập nhật lịch hẹn!");
      }
  };
  // 4. Tự động load dữ liệu khi mở tab Lịch hẹn
  useEffect(() => {
      if (activeTab === 'appointments') {
          fetchAppointments();
      }
  }, [activeTab]);

  // ==========================================
  // STATE CHO ĐƠN THUỐC
  // ==========================================
  const [prescriptions, setPrescriptions] = useState([]);
  const [replyingId, setReplyingId] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // ==========================================
  // 🔥 BỔ SUNG STATE CHO TÍNH NĂNG AI (BLOG + CHAT LOGS)
  // ==========================================
  const [aiLogs, setAiLogs] = useState([]);
  const [blogTopic, setBlogTopic] = useState('');
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState({ title: '', description: '', content: '' });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setAdminUser(JSON.parse(savedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchProducts = () => {
    axios.get(`${API_BASE_URL}/Products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Lỗi lấy sản phẩm:", err));
  };

  const fetchOrders = () => {
    axios.get(`${API_BASE_URL}/Orders`) 
      .then(res => setOrders(res.data))
      .catch(err => {
        console.error("Lỗi lấy đơn hàng, thử lại /Orders/all:", err);
        axios.get(`${API_BASE_URL}/Orders/all`).then(r => setOrders(r.data));
      });
  };

  const fetchCustomers = () => {
    axios.get(`${API_BASE_URL}/Users`)
      .then(res => setCustomers(res.data))
      .catch(err => console.error("Lỗi lấy khách hàng:", err));
  };

  const fetchPrescriptions = () => {
    axios.get(`${API_BASE_URL}/Prescriptions`)
      .then(res => setPrescriptions(res.data))
      .catch(err => console.error("Lỗi lấy đơn thuốc:", err));
  };

  // ==========================================
  // 🔥 HÀM FETCH AI CHAT LOGS
  // ==========================================
  const fetchAiLogs = () => {
    axios.get(`${API_BASE_URL}/Admin/chat-logs`)
      .then(res => setAiLogs(res.data))
      .catch(err => console.error("Lỗi lấy Chat Logs:", err));
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
    fetchPrescriptions(); 
    fetchAiLogs(); // <-- GỌI HÀM LẤY LOGS AI
    fetchPublishedBlogs(); // <-- GỌI HÀM LẤY DANH SÁCH BLOG
  }, []);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const totalRevenue = orders
    .filter(order => order.status === 'paid' || order.status === 'completed')
    .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    name: `Tháng ${i + 1}`,
    DoanhThu: 0
  }));

  orders.forEach(order => {
    if (order.status === 'paid' || order.status === 'completed') { 
      if (order.createdAt) {
        const date = new Date(order.createdAt);
        if (date.getFullYear() === new Date().getFullYear()) {
          const monthIndex = date.getMonth(); 
          chartData[monthIndex].DoanhThu += (order.totalAmount || 0);
        }
      }
    }
  });

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.id?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(c => 
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductFormData({ ...productFormData, [name]: value });
  };

  const handleOpenAddModal = () => {
    setIsEditingProduct(false);
    setEditingProductId(null);
    setProductFormData({ name: '', price: '', stockQty: '', imageUrl: '', brand: '' }); 
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product) => {
    setIsEditingProduct(true);
    setEditingProductId(product.id);
    setProductFormData({
      name: product.name,
      price: product.price,
      stockQty: product.stockQty || product.stock_qty, 
      imageUrl: product.imageUrl,
      brand: product.brand || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSavingProduct(true);
    const payload = {
      Name: productFormData.name,
      Price: parseFloat(productFormData.price),
      StockQty: parseInt(productFormData.stockQty),
      ImageUrl: productFormData.imageUrl,
      Brand: productFormData.brand
    };

    try {
      if (isEditingProduct) {
        await axios.put(`${API_BASE_URL}/Products/${editingProductId}`, payload);
        alert("🎉 Đã cập nhật thông tin thuốc thành công!");
      } else {
        await axios.post(`${API_BASE_URL}/Products`, payload);
        alert("🎉 Đã thêm thuốc mới vào kho!");
      }
      setShowProductModal(false); 
      fetchProducts(); 
    } catch (error) {
      alert("Lỗi khi lưu sản phẩm!");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await axios.delete(`${API_BASE_URL}/Products/${productToDelete.id}`);
      setProductToDelete(null); 
      fetchProducts(); 
    } catch (error) {
      alert("Lỗi khi xóa sản phẩm!");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setIsAddingCustomer(true);
    try {
      await axios.post(`${API_BASE_URL}/Auth/register`, {
        FullName: newCustomerForm.fullName,
        Username: newCustomerForm.username,
        Email: newCustomerForm.email,
        Password: newCustomerForm.password
      });
      setShowAddCustomerModal(false);
      setNewCustomerForm({ fullName: '', username: '', email: '', password: '' });
      fetchCustomers();
    } catch (error) {
      alert("Lỗi khi thêm!");
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const handleOpenEditCustomer = (cust) => {
    setSelectedCustomer(cust);
    setCustomerFormData({ 
      fullName: cust.fullName || '', 
      email: cust.email || '', 
      username: cust.username || '' 
    });
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setIsSavingCustomer(true);
    try {
      await axios.put(`${API_BASE_URL}/Users/${selectedCustomer.id}`, customerFormData);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      alert("Lỗi khi cập nhật!");
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeletingCustomer(true);
    try {
      await axios.delete(`${API_BASE_URL}/Users/${customerToDelete.id}`);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch (error) {
      alert("Lỗi khi xóa khách hàng!");
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  const handleSaveOrderStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      await axios.put(`${API_BASE_URL}/Orders/${selectedOrder.id}/status`, {
        status: newStatus
      });
      setSelectedOrder(null);
      fetchOrders(); 
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdatePrescriptionStatus = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/Prescriptions/${id}/status`, JSON.stringify("Processed"), {
        headers: { 'Content-Type': 'application/json' }
      });
      fetchPrescriptions(); 
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái đơn thuốc!");
    }
  };

  const handleSendReply = async () => {
    try {
      await axios.put(`${API_BASE_URL}/Prescriptions/${replyingId}/reply`, { reply: adminReplyText });
      setReplyingId(null);
      setAdminReplyText('');
      fetchPrescriptions(); 
      alert("Đã gửi phản hồi cho khách!");
    } catch (error) {
      alert("Lỗi khi gửi phản hồi!");
    }
  };

  // ==========================================
  // 🔥 HÀM TẠO BLOG BẰNG AI
  // ==========================================
  const handleGenerateBlog = async () => {
    if (!blogTopic) return alert("Vui lòng nhập chủ đề!");
    setIsGeneratingBlog(true);
    try {
      // Sửa cái đuôi generate-blog-ai thành tao-bai-viet
const res = await axios.post(`${API_BASE_URL}/Admin/tao-bai-viet`, { Topic: blogTopic });
      const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      setGeneratedBlog(data);
    } catch (error) {
      alert("Lỗi gọi AI rồi bạn ơi!");
    } finally {
      setIsGeneratingBlog(false);
    }
  };
// STATE CHO QUẢN LÝ BLOG
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [editingBlogId, setEditingBlogId] = useState(null); // Lưu ID bài đang sửa
  const [editFormData, setEditFormData] = useState({ title: '', description: '', content: '' });

  // 1. HÀM LẤY DANH SÁCH BLOG TỪ DATABASE
  const fetchPublishedBlogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Blogs`); 
      
      // 🔥 THÊM DÒNG NÀY ĐỂ SOI DỮ LIỆU:
      console.log("DỮ LIỆU TỪ C# TRẢ VỀ ĐÂY NÈ:", res.data); 

      // Lưu dữ liệu blog vào state
      setPublishedBlogs(res.data); 
      
    } catch (error) {
      console.error("Lỗi lấy danh sách blog:", error);
    }
  };


  // 2. HÀM XÓA BLOG
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/Blogs/${blogId}`);
      alert("Xóa thành công!");
      fetchPublishedBlogs(); // Load lại danh sách
    } catch (error) {
      alert("Lỗi khi xóa bài viết!");
      console.error(error);
    }
  };

  // 3. HÀM BẬT CHẾ ĐỘ SỬA
  const handleOpenEdit = (blog) => {
    setEditingBlogId(blog.id);
    setEditFormData({ title: blog.title, description: blog.description, content: blog.content });
  };

  // 4. HÀM LƯU CẬP NHẬT BLOG
  const handleSaveEdit = async () => {
    try {
      await axios.put(`${API_BASE_URL}/Blogs/${editingBlogId}`, {
        Title: editFormData.title,
        Description: editFormData.description,
        Content: editFormData.content
      });
      alert("Cập nhật thành công!");
      setEditingBlogId(null); // Tắt chế độ sửa
      fetchPublishedBlogs(); // Load lại danh sách
    } catch (error) {
      alert("Lỗi khi cập nhật! " + error.response?.data || error.message);
      console.error(error);
    }
  };
  const [aiInsights, setAiInsights] = useState(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);

const fetchAiInsights = async () => {
    setIsAnalyzing(true);
    try {
        const res = await axios.get(`${API_BASE_URL}/Admin/ai-insights`);
        
        // CỨ DÙNG THẲNG res.data, KHÔNG CẦN JSON.parse NỮA!
        console.log("Kết quả từ Gemini siêu xịn:", res.data); 
        
        // Nếu res.data đã là object rồi thì set thẳng vào luôn
        const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        setAiInsights(data);
        
    } catch (error) {
        console.error("Lỗi:", error);
    } finally {
        setIsAnalyzing(false);
    }
};

// Tự động gọi khi vào Tab Tổng quan
useEffect(() => {
    if (activeTab === 'ai-insights') {
        fetchAiInsights();
    }
}, [activeTab]);
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'ai-insights', label: 'Phân tích AI', icon: Brain },
    { id: 'orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
    { id: 'appointments', label: 'Lịch hẹn tư vấn', icon: Calendar },
    { id: 'inventory', label: 'Quản lý kho thuốc', icon: Pill },
    { id: 'customers', label: 'Khách hàng', icon: Users },
    { id: 'prescriptions', label: 'Đơn thuốc', icon: FileText },
    { id: 'manage-blogs', label: 'Danh sách Blog', icon: BookOpen },
    // 🔥 THÊM 2 MENU MỚI CHO AI
    { id: 'aiblog', label: 'Cẩm nang AI', icon: Sparkles },
    { id: 'ailogs', label: 'Giám sát Chat AI', icon: ShieldAlert },
  ];

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'paid': return <span className="bg-emerald-50 text-emerald-600 px-3.5 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider border border-emerald-100">Đã thanh toán</span>;
      case 'shipping': return <span className="bg-blue-50 text-blue-600 px-3.5 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider border border-blue-100">Đang giao hàng</span>;
      case 'completed': return <span className="bg-green-100 text-green-700 px-3.5 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider border border-green-200">Hoàn thành</span>;
      case 'cancelled': return <span className="bg-red-50 text-red-600 px-3.5 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider border border-red-100">Đã hủy</span>;
      case 'pending': default: return <span className="bg-amber-50 text-amber-600 px-3.5 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider border border-amber-100">Đang chờ xử lý</span>;
    }
  };
// 🔥 HÀM XUẤT BẢN BÀI VIẾT LÊN DATABASE C#
  const handlePublishBlog = async () => {
    if (!generatedBlog.title) return;
    
    try {
      // 1. Gọi API Blogs (C#) để lưu bài viết
      // Lưu ý: Tên các trường (Title, Content...) phải viết hoa chữ cái đầu cho đúng Model C#
      await axios.post(`${API_BASE_URL}/Blogs`, {
        Title: generatedBlog.title,
        Description: generatedBlog.description,
        Content: generatedBlog.content,
        Author: "Dược sĩ AI SaHa",
        ImageUrl: "https://vcdn1-suckhoe.vnecdn.net/2023/03/14/duoc-si-1678783472-1678783482-1406-1678783516.jpg",
        CreatedAt: new Date()
      });
      
      alert("🚀 Chúc mừng! Bài viết AI đã được xuất bản thành công!");
      
      // 2. Xóa trắng nội dung cũ để sẵn sàng viết bài tiếp theo
      setGeneratedBlog({ title: '', description: '', content: '' });
      setBlogTopic('');
      
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu bài viết! Bạn kiểm tra xem Server C# đã bật chưa và bảng Blogs đã có chưa nhé.");
    }
  };
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden relative">
      
      {/* POPUP THÊM TÀI KHOẢN KHÁCH HÀNG MỚI */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
            <button onClick={() => setShowAddCustomerModal(false)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:text-red-500 transition-colors"><X size={20}/></button>
            <h3 className="text-2xl font-black text-slate-800 mb-6">Tạo tài khoản mới</h3>
            <form onSubmit={handleAddCustomer}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                  <input type="text" required value={newCustomerForm.fullName} onChange={(e) => setNewCustomerForm({...newCustomerForm, fullName: e.target.value})} placeholder="Nguyễn Văn A" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 font-bold transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên đăng nhập</label>
                  <input type="text" required value={newCustomerForm.username} onChange={(e) => setNewCustomerForm({...newCustomerForm, username: e.target.value})} placeholder="nguyenvana_123" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 font-bold transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" required value={newCustomerForm.email} onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})} placeholder="nguyenvana@gmail.com" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 font-bold transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                  <input type="password" required value={newCustomerForm.password} onChange={(e) => setNewCustomerForm({...newCustomerForm, password: e.target.value})} placeholder="••••••••" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 font-bold transition-all" />
                </div>
              </div>
              <button type="submit" disabled={isAddingCustomer} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                <Plus size={20}/> {isAddingCustomer ? "Đang tạo..." : "Khởi tạo tài khoản"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP XÓA SẢN PHẨM */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">Xác nhận xóa vĩnh viễn?</h3>
              <p className="text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3 mb-8">
                Thuốc: {productToDelete.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setProductToDelete(null)} className="px-6 py-3.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-bold text-sm">Hủy bỏ</button>
              <button onClick={handleDeleteProduct} disabled={isDeletingProduct} className="px-6 py-3.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition font-bold text-sm shadow-lg shadow-red-500/20 disabled:opacity-70">
                {isDeletingProduct ? 'Đang xóa...' : 'Vẫn xóa nó'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP THÊM/SỬA SẢN PHẨM */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowProductModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-full"><X size={20} /></button>
            <h3 className="text-3xl font-black text-slate-800 mb-2">{isEditingProduct ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'}</h3>
            <form onSubmit={handleSaveProduct}>
              <div className="grid grid-cols-2 gap-5 mb-10">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên thuốc/sản phẩm</label>
                  <input type="text" name="name" required value={productFormData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:border-orange-300 focus:ring-2 focus:ring-orange-50 outline-none font-bold text-slate-800 transition-all" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Thương hiệu / Nhà sản xuất</label>
                  <input type="text" name="brand" value={productFormData.brand} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:border-orange-300 focus:ring-2 focus:ring-orange-50 outline-none font-medium text-slate-700 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Giá bán (VNĐ)</label>
                  <input type="number" name="price" required value={productFormData.price} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:border-orange-300 focus:ring-2 focus:ring-orange-50 outline-none font-black text-orange-500 transition-all text-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Số lượng tồn kho</label>
                  <input type="number" name="stockQty" required value={productFormData.stockQty} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:border-orange-300 focus:ring-2 focus:ring-orange-50 outline-none font-bold text-slate-700 transition-all text-lg" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Đường dẫn hình ảnh (URL)</label>
                  <input type="text" name="imageUrl" value={productFormData.imageUrl} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:border-orange-300 focus:ring-2 focus:ring-orange-50 outline-none font-medium text-slate-600 transition-all text-sm" />
                </div>
              </div>
              <button type="submit" disabled={isSavingProduct} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 disabled:opacity-70 text-lg uppercase tracking-wide">
                {isSavingProduct ? 'Đang xử lý...' : (isEditingProduct ? 'Lưu thay đổi thuốc' : 'Tạo thuốc mới ngay')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP XÓA KHÁCH HÀNG */}
      {customerToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-3">Xác nhận xóa tài khoản?</h3>
              <p className="text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100 mt-3 mb-8">
                Khách: {customerToDelete.fullName || customerToDelete.username}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCustomerToDelete(null)} className="px-6 py-3.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-bold text-sm">Hủy bỏ</button>
              <button onClick={handleDeleteCustomer} disabled={isDeletingCustomer} className="px-6 py-3.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition font-bold text-sm shadow-lg shadow-red-500/20 disabled:opacity-70">
                {isDeletingCustomer ? 'Đang xóa...' : 'Xóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP SỬA KHÁCH HÀNG */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-8 duration-300">
            <button onClick={() => setSelectedCustomer(null)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full hover:text-red-500 transition-colors"><X size={20}/></button>
            <h3 className="text-2xl font-black text-slate-800 mb-6">Sửa thông tin khách</h3>
            <form onSubmit={handleSaveCustomer}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                  <input type="text" value={customerFormData.fullName} onChange={(e) => setCustomerFormData({...customerFormData, fullName: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white font-bold transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên đăng nhập</label>
                  <input type="text" value={customerFormData.username} onChange={(e) => setCustomerFormData({...customerFormData, username: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white font-bold transition-all" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" value={customerFormData.email} onChange={(e) => setCustomerFormData({...customerFormData, email: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:bg-white font-bold transition-all" />
                </div>
              </div>
              <button type="submit" disabled={isSavingCustomer} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-all shadow-xl">
                <Save size={20}/> {isSavingCustomer ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-50">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mr-3">
            <Pill className="text-orange-500" size={24} />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">SaHa <span className="text-orange-500">Admin</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'}`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-50">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10">
          <h1 className="text-2xl font-black text-slate-800 capitalize">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-6">
            
            <div className="relative group hidden md:block">
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-slate-100 border-transparent focus:bg-white focus:border-orange-200 focus:ring-2 focus:ring-orange-100 rounded-full w-64 transition-all text-sm font-medium outline-none" 
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-orange-500 transition-colors">
              <Bell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-700">{adminUser?.fullName || adminUser?.username || 'Admin'}</p>
                <p className="text-xs font-semibold text-slate-400">Quản trị viên</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-slate-600">
                {adminUser?.fullName ? adminUser.fullName.charAt(0).toUpperCase() : <User size={20} className="text-slate-500" />}
              </div>
            </div>

          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          
          {/* TAB TỔNG QUAN */}
          {activeTab === 'dashboard' && ( 
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-2">
                <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
                  <Leaf size={16} className="text-emerald-500" /> Trung tâm quản lý phân phối Thực phẩm chức năng SaHa
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-emerald-100 font-medium mb-1">Tổng doanh thu</p>
                      <h3 className="text-3xl font-black">{totalRevenue.toLocaleString()}đ</h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><TrendingUp size={24} /></div>
                  </div>
                  <p className="text-sm text-emerald-100 mt-4">Doanh thu qua VNPay</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-6 rounded-3xl text-white shadow-xl shadow-orange-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-orange-100 font-medium mb-1">Đơn hàng TPCN</p>
                      <h3 className="text-3xl font-black">{orders.length} <span className="text-lg font-medium">đơn</span></h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><ShoppingCart size={24} /></div>
                  </div>
                  <p className="text-sm text-orange-100 mt-4">Tổng số đơn trên hệ thống</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-100 font-medium mb-1">Kho Thực phẩm chức năng</p>
                      <h3 className="text-3xl font-black">{products.length} <span className="text-lg font-medium">sản phẩm</span></h3>
                    </div>
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><Package size={24} /></div>
                  </div>
                  <p className="text-sm text-blue-100 mt-4">Cam kết 100% hàng chính hãng</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Biểu đồ Tăng trưởng Doanh thu</h3>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b'}}
                        tickFormatter={(value) => `${value / 1000000}Tr`} 
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="DoanhThu" 
                        stroke="#10b981" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorDoanhThu)" 
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#f97316' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div> 
          )}

          {/* TAB QUẢN LÝ ĐƠN HÀNG */}
          {activeTab === 'orders' && ( 
            <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0">
                <h2 className="text-xl font-black text-slate-800">Danh sách đơn hàng</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest font-black">
                      <th className="px-8 py-5">Mã đơn</th>
                      <th className="px-8 py-5">Ngày đặt</th>
                      <th className="px-8 py-5">Tổng tiền</th>
                      <th className="px-8 py-5">Trạng thái</th>
                      <th className="px-8 py-5 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5 font-bold text-slate-700">#{order.id.toString().substring(0, 8).toUpperCase()}</td>
                        <td className="px-8 py-5 text-slate-500 font-medium"> {new Date(order.createdAt).toLocaleString('vi-VN')} </td>
                        <td className="px-8 py-5 font-black text-orange-500">{(order.totalAmount || 0).toLocaleString()}đ</td>
                        <td className="px-8 py-5">{renderStatusBadge(order.status)}</td>
                        <td className="px-8 py-5 text-center">
                           {selectedOrder && selectedOrder.id === order.id && (
                              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
                                  <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-full"><X size={20} /></button>
                                  <h3 className="text-2xl font-black text-slate-800 mb-2">Cập nhật đơn</h3>
                                  <p className="text-slate-500 font-medium mb-6">Mã: <span className="font-bold text-orange-500">#{order.id.toString().substring(0, 8).toUpperCase()}</span></p>
                                  <div className="space-y-3 mb-8">
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl block p-3.5 outline-none">
                                      <option value="pending">Đang chờ xử lý</option>
                                      <option value="paid">Đã thanh toán (Chờ giao)</option>
                                      <option value="shipping">Đang giao hàng</option>
                                      <option value="completed">Hoàn thành</option>
                                      <option value="cancelled">Đã hủy bỏ</option>
                                    </select>
                                  </div>
                                  <button onClick={handleSaveOrderStatus} disabled={isUpdatingStatus} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-70">
                                    {isUpdatingStatus ? 'Đang lưu...' : 'Lưu trạng thái'}
                                  </button>
                                </div>
                              </div>
                            )}
                          <button onClick={() => { setSelectedOrder(order); setNewStatus(order.status); }} className="text-blue-500 hover:text-white hover:bg-blue-500 font-bold text-xs bg-blue-50 px-4 py-2 rounded-xl transition-colors">
                            Cập nhật
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && ( <tr><td colSpan="5" className="text-center py-16 text-slate-500 font-medium">Không tìm thấy đơn hàng nào!</td></tr> )}
                  </tbody>
                </table>
              </div>
            </div> 
          )}

          {/* TAB QUẢN LÝ KHO THUỐC */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-xl font-black text-slate-800">Kho sản phẩm ({products.length})</h2>
                <button onClick={handleOpenAddModal} className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2.5 active:scale-[0.98]">
                  <Plus size={20} strokeWidth={3} /> THÊM THUỐC MỚI
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest font-black">
                      <th className="px-8 py-5">Hình ảnh</th>
                      <th className="px-8 py-5">Tên Sản phẩm & Thương hiệu</th>
                      <th className="px-8 py-5">Giá bán</th>
                      <th className="px-8 py-5 text-center">Tồn kho</th>
                      <th className="px-8 py-5 text-right">Thao tác Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {filteredProducts.map((product) => {
                      const stock = product.stockQty || product.stock_qty || 0;
                      return (
                        <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-8 py-5">
                            {product.imageUrl ? ( <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm" /> ) : (
                               <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner"><ImageIcon size={24} /></div>
                            )}
                          </td>
                          <td className="px-8 py-5">
                              <p className="font-bold text-slate-800 text-base line-clamp-2 leading-tight">{product.name}</p>
                              <p className="text-sm text-slate-500 mt-1 font-medium">{product.brand || 'Hãng đang cập nhật'}</p>
                          </td>
                          <td className="px-8 py-5 font-black text-orange-500 text-lg">
                            {product.price ? product.price.toLocaleString() : 0}<span className="text-sm font-bold ml-0.5">đ</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <p className="text-xl font-black text-slate-700">{stock}</p>
                            {stock > 10 ? ( <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full mt-1.5 inline-block border border-emerald-100">Sẵn hàng</span> ) : stock > 0 ? (
                              <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full mt-1.5 inline-block border border-amber-100">Sắp hết</span> ) : (
                              <span className="text-red-600 font-bold text-[10px] uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full mt-1.5 inline-block border border-red-100">Hết sạch</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenEditModal(product)} className="w-10 h-10 flex items-center justify-center text-blue-500 hover:text-white hover:bg-blue-500 rounded-xl transition-all border border-blue-100 hover:border-blue-500 shadow-sm"><Edit size={18} /></button>
                              <button onClick={() => setProductToDelete(product)} className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all border border-red-100 hover:border-red-500 shadow-sm"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB QUẢN LÝ KHÁCH HÀNG */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-xl font-black text-slate-800">Danh sách Khách hàng ({customers.length})</h2>
                <button 
                  onClick={() => setShowAddCustomerModal(true)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2.5"
                >
                  <Plus size={20} strokeWidth={3} /> TẠO TÀI KHOẢN
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest font-black">
                      <th className="px-8 py-5">Tài khoản</th>
                      <th className="px-8 py-5">Email liên hệ</th>
                      <th className="px-8 py-5 text-center">Trạng thái</th>
                      <th className="px-8 py-5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 font-bold border border-orange-100 shadow-sm text-lg">
                            {(c.fullName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base">{c.fullName || "Chưa đặt tên"}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">@{c.username}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-semibold text-slate-600">{c.email}</td>
                        <td className="px-8 py-6 text-center">
                          <span className="text-emerald-600 font-bold text-[11px] uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">Hoạt động</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleOpenEditCustomer(c)} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit size={18}/></button>
                            <button onClick={() => setCustomerToDelete(c)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB QUẢN LÝ ĐƠN THUỐC KHÁCH GỬI */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative p-8">
              <h2 className="text-xl font-black text-slate-800 mb-6">Đơn thuốc khách gửi ({prescriptions.length})</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prescriptions.map((p) => (
                  <div key={p.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group flex flex-col">
                    <div className="relative h-64 overflow-hidden bg-slate-200 shrink-0">
                      <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Đơn thuốc" />
                      <div className="absolute top-4 right-4">
                        {p.status === 'Pending' ? 
                          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Cần tư vấn</span> :
                          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Đã phản hồi</span>
                        }
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{p.customerName}</h4>
                      <p className="text-slate-400 text-xs mb-4 flex items-center gap-1"><Clock size={12}/> {new Date(p.createdAt).toLocaleString('vi-VN')}</p>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl mb-4">
                         <p className="text-sm text-slate-600 italic">" {p.note || 'Khách không để lại lời nhắn...'} "</p>
                      </div>

                      {p.status === 'Processed' && (
                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mt-auto">
                          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Dược sĩ đã trả lời:</p>
                          <p className="text-sm font-medium text-emerald-800">{p.adminReply}</p>
                        </div>
                      )}

                      {p.status === 'Pending' && replyingId !== p.id && (
                        <button 
                          onClick={() => setReplyingId(p.id)}
                          className="w-full mt-auto py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-orange-500 transition-all flex justify-center items-center gap-2"
                        >
                          <Edit size={16} /> Viết phản hồi ngay
                        </button>
                      )}

                      {replyingId === p.id && (
                        <div className="mt-auto animate-in zoom-in-95 duration-200">
                          <textarea 
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            placeholder="Gõ lời khuyên, đề xuất sản phẩm..."
                            className="w-full p-3 bg-white border-2 border-orange-200 rounded-xl outline-none focus:border-orange-500 font-medium text-sm h-24 mb-2"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => setReplyingId(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm">Hủy</button>
                            <button onClick={handleSendReply} className="flex-1 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600">Gửi khách</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
         {/* 🔥 TAB QUẢN LÝ BLOG: XEM, SỬA, XÓA */}
{activeTab === 'manage-blogs' && (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-black text-slate-800 mb-6">QUẢN LÝ CẨM NANG Y TẾ</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {publishedBlogs?.map((blog) => ( // Thêm dấu ? ở đây cho an toàn
                <div key={blog.id} className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col">
                    
                    {/* NẾU ĐANG Ở CHẾ ĐỘ SỬA BÀI NÀY */}
                    {editingBlogId === blog.id ? (
                        <div className="space-y-4 flex-1">
                            <input 
                                value={editFormData.title} 
                                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                className="w-full text-xl font-bold p-3 border border-slate-200 rounded-xl focus:border-orange-500 outline-none"
                                placeholder="Nhập tiêu đề"
                            />
                            <textarea 
                                value={editFormData.content} 
                                onChange={(e) => setEditFormData({...editFormData, content: e.target.value})}
                                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:border-orange-500 outline-none h-40"
                                placeholder="Nội dung"
                            />
                            <div className="flex gap-2 pt-2">
                                <button onClick={handleSaveEdit} className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600">
                                    <Save size={18} /> Lưu Thay Đổi
                                </button>
                                <button onClick={() => setEditingBlogId(null)} className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-300">
                                    <X size={18} /> Hủy
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* NẾU Ở CHẾ ĐỘ XEM BÌNH THƯỜNG */
                        <>
                            <div className="flex-1">
                                <h3 className="text-xl font-black text-slate-800 mb-2 line-clamp-2">{blog.title || 'Bài viết chưa có tiêu đề'}</h3>
                                
                                {/* 🔥 DÒNG NÀY ĐÃ ĐƯỢC CHỈNH LẠI ĐỂ KHÔNG BAO GIỜ BỊ SẬP */}
                                <p className="text-slate-500 text-sm line-clamp-3 mb-4 italic">
                                    {typeof blog.content === 'string' ? blog.content.substring(0, 150).replace(/<[^>]+>/g, '') + '...' : 'Không có nội dung'}
                                </p>
                                
                                <details className="group mb-4">
                                    <summary className="text-orange-500 text-sm font-bold cursor-pointer list-none flex items-center gap-1">
                                        <Eye size={16}/> Xem nhanh nội dung
                                    </summary>
                                    <div 
                                        className="mt-4 p-4 bg-slate-50 rounded-2xl text-sm prose prose-sm max-h-40 overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: blog.content || '' }} 
                                    />
                                </details>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-100 mt-auto">
                                <button 
                                    onClick={() => handleOpenEdit(blog)}
                                    className="flex-1 bg-slate-50 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                                >
                                    <Edit size={18} /> Sửa Bài
                                </button>
                                <button 
                                    onClick={() => handleDeleteBlog(blog.id)}
                                    className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
                                >
                                    <Trash2 size={18} /> Xóa Bỏ
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}

            {(!publishedBlogs || publishedBlogs.length === 0) && (
                <div className="col-span-2 text-center py-20 text-slate-400 font-medium">
                    Chưa có bài viết nào được xuất bản.
                </div>
            )}
        </div>
    </div>
)}
          {/* 🔥 TAB TẠO BLOG BẰNG AI (MỚI) */}
          {activeTab === 'aiblog' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Sparkles size={28} /></div>
                        SÁNG TẠO NỘI DUNG VỚI SAHA AI
                    </h2>
                    <div className="flex gap-3">
                        <input 
                            value={blogTopic} onChange={(e) => setBlogTopic(e.target.value)}
                            placeholder="Nhập chủ đề y tế (VD: Cách phòng ngừa đau dạ dày...)"
                            className="flex-1 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-orange-500 outline-none font-medium text-slate-700 transition-all"
                        />
                        <button 
                            onClick={handleGenerateBlog} disabled={isGeneratingBlog}
                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-orange-500 transition-all shadow-xl disabled:opacity-70"
                        >
                            {isGeneratingBlog ? 'ĐANG TƯ DUY...' : 'VIẾT BÀI NGAY'}
                        </button>
                    </div>
                </div>

                {/* ... các đoạn code phía trên ... */}

{generatedBlog.title && (
    <div className="bg-white p-10 rounded-[2rem] shadow-lg border border-orange-100 animate-in zoom-in-95 duration-500">
        <input 
            value={generatedBlog.title} 
            onChange={(e) => setGeneratedBlog({...generatedBlog, title: e.target.value})}
            className="text-3xl font-black text-slate-800 w-full border-none outline-none mb-4 focus:ring-0 p-0"
        />
        <textarea 
            value={generatedBlog.description} 
            onChange={(e) => setGeneratedBlog({...generatedBlog, description: e.target.value})}
            className="w-full text-slate-500 italic mb-8 border-none outline-none focus:ring-0 p-0 resize-none h-20"
        />

        {/* CHÍNH LÀ ĐOẠN NÀY ĐÂY HÀO: */}
        <div 
            dangerouslySetInnerHTML={{ __html: generatedBlog.content }} 
            className="prose prose-orange max-w-none border-t border-slate-100 pt-8"
        />

        <button 
            onClick={handlePublishBlog}
            className="mt-10 w-full bg-orange-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
        >
            <Save size={20} /> XUẤT BẢN BÀI VIẾT NÀY LÊN CẨM NANG Y TẾ
        </button>
    </div>
)}
            </div>
          )}

          {/* 🔥 TAB GIÁM SÁT CHAT LOGS AI (MỚI) */}
          {activeTab === 'ailogs' && (
            <div className="bg-white rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                      <div className="p-3 bg-red-50 text-red-500 rounded-2xl"><ShieldAlert size={28} /></div>
                      GIÁM SÁT TRỢ LÝ ẢO SAHA
                  </h2>
                  <div className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
                    Đã ghi nhận: <span className="text-slate-800">{aiLogs.length}</span> cuộc hội thoại
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {aiLogs.map((log) => (
                        <div key={log.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg">
                                    <User size={14} className="text-orange-500" /> {log.userEmail}
                                </div>
                                <div className="text-slate-400 text-xs font-bold flex items-center gap-1">
                                    <Clock size={12} /> {new Date(log.createdAt).toLocaleString('vi-VN')}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border-l-4 border-slate-300">
                                    <p className="text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest flex items-center gap-1"><MessageSquare size={12}/> Khách hỏi:</p>
                                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">{log.userMessage}</p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-2xl border-l-4 border-orange-500">
                                    <p className="text-[10px] font-black text-orange-600 mb-1.5 uppercase tracking-widest flex items-center gap-1"><Sparkles size={12}/> AI Tư vấn:</p>
                                    <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">{log.aiResponse}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {aiLogs.length === 0 && (
                      <div className="col-span-2 text-center py-20 text-slate-400 font-medium">
                        Chưa có lịch sử hội thoại nào được ghi nhận.
                      </div>
                    )}
                </div>
            </div>
          )}
{/* ========================================= */}
{/* 1. 🔥 TAB PHÂN TÍCH AI */}
{/* ========================================= */}
{activeTab === 'ai-insights' && (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl"><Brain size={28} /></div>
                BỘ NÃO PHÂN TÍCH SAHA AI
            </h2>
            <button 
                onClick={fetchAiInsights}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-500 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
            >
                <RefreshCw size={18} className={isAnalyzing ? "animate-spin" : ""} />
                LÀM MỚI PHÂN TÍCH
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 border-b-4 border-b-blue-500 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4 text-blue-500 font-black text-lg tracking-wide uppercase"><TrendingUp size={24} /> XU HƯỚNG</div>
                <p className="text-slate-600 font-medium leading-relaxed flex-1">{aiInsights?.trending || "Bấm 'Làm mới phân tích' để AI phân tích..."}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 border-b-4 border-b-orange-500 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4 text-orange-500 font-black text-lg tracking-wide uppercase"><AlertTriangle size={24} /> CẢNH BÁO KHO</div>
                <p className="text-slate-600 font-medium leading-relaxed flex-1">{aiInsights?.warning || "Đang chờ dữ liệu..."}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 border-b-4 border-b-purple-500 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4 text-purple-500 font-black text-lg tracking-wide uppercase"><Lightbulb size={24} /> GỢI Ý BLOG</div>
                <p className="text-slate-600 font-medium leading-relaxed flex-1 mb-4">{aiInsights?.blogSuggest || "Đang chờ ý tưởng..."}</p>
            </div>
        </div>
    </div>
)}


{/* ========================================= */}
{/* 2. 🔥 TAB QUẢN LÝ LỊCH HẸN (Gồm Bảng và Dữ liệu) */}
{/* ========================================= */}
{activeTab === 'appointments' && (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl"><Calendar size={28} /></div>
                QUẢN LÝ LỊCH HẸN TƯ VẤN
            </h2>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 font-bold text-slate-400 text-[13px] uppercase tracking-wider">Khách hàng</th>
                        <th className="px-8 py-5 font-bold text-slate-400 text-[13px] uppercase tracking-wider">Thời gian hẹn</th>
                        <th className="px-8 py-5 font-bold text-slate-400 text-[13px] uppercase tracking-wider">Trạng thái</th>
                        <th className="px-8 py-5 font-bold text-slate-400 text-[13px] uppercase tracking-wider text-right">Thao tác duyệt</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {appointments.map((apt) => {
                        const dateObj = new Date(apt.appointmentDate);
                        const timeStr = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        const dateStr = dateObj.toLocaleDateString('vi-VN');
                        const statusLower = apt.status?.toLowerCase() || 'pending';

                        return (
                            <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="text-slate-800 font-bold text-lg">{apt.patientName}</div>
                                    <div className="text-slate-400 text-xs mt-1 italic">Tạo lúc: {new Date(apt.createdAt).toLocaleString('vi-VN')}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 font-bold text-slate-700"><Clock size={16} className="text-emerald-500"/> {timeStr}</div>
                                    <div className="text-slate-500 text-sm mt-1 font-medium">{dateStr}</div>
                                </td>
                                <td className="px-8 py-5">
                                    {statusLower === 'pending' && <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-bold uppercase">Chờ duyệt</span>}
                                    {statusLower === 'confirmed' && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase">Đã duyệt</span>}
                                    {statusLower === 'cancelled' && <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold uppercase">Đã từ chối</span>}
                                </td>
                                <td className="px-8 py-5 text-right">
                                    {statusLower === 'pending' ? (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => { setSelectedAptId(apt.id); setShowMeetModal(true); }}
                                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-1 shadow-sm"
                                            >
                                                <CheckCircle size={16} /> Duyệt & Gửi Link
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateAptStatus(apt.id, 'Cancelled')}
                                                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-all flex items-center gap-1"
                                            >
                                                <XCircle size={16} /> Từ chối
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-sm font-bold flex justify-end gap-2">
                                            {statusLower === 'confirmed' && <span className="text-emerald-500">✓ Đã chốt lịch</span>}
                                            {statusLower === 'cancelled' && <span className="text-red-400">✕ Đã hủy hẹn</span>}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {appointments.length === 0 && (
                        <tr><td colSpan="4" className="py-20 text-center text-slate-400 font-medium">Chưa có lịch hẹn nào...</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
)}


{/* ========================================= */}
{/* 3. 🔥 FORM NHẬP LINK GOOGLE MEET (Nổi lên khi bấm Duyệt) */}
{/* Nằm ngoài các Tab để hiển thị đè lên trên cùng */}
{/* ========================================= */}
{showMeetModal && (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
                <Calendar size={28} />
                <h3 className="text-xl font-black text-slate-800">Xác nhận Lịch hẹn</h3>
            </div>
            <p className="text-slate-600 mb-4 font-medium text-sm">
                Hãy dán đường link phòng họp (Google Meet, Zalo, Zoom) để khách hàng tham gia đúng giờ nhé.
            </p>
            <input 
                type="text" 
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="Ví dụ: https://meet.google.com/abc-xyz"
                className="w-full border-2 border-slate-200 p-4 rounded-2xl focus:border-emerald-500 outline-none mb-6 font-medium text-slate-700"
            />
            <div className="flex gap-3">
                <button 
                    onClick={() => handleUpdateAptStatus(selectedAptId, 'Confirmed', meetLink)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/30"
                >
                    Chốt & Gửi Link
                </button>
                <button 
                    onClick={() => setShowMeetModal(false)}
                    className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl font-bold transition-all"
                >
                    Hủy
                </button>
            </div>
        </div>
    </div>
)}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;