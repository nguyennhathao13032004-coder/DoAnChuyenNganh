import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google' // Bổ sung import của Google

// Các trang chính
import App from './App.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import ProductDetail from './ProductDetail.jsx'
import ProductPage from './ProductPage.jsx'
import Cart from './Cart.jsx'
import Blogs from './Blogs.jsx'
import Brands from './Brands.jsx'
import Origins from './Origins.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import Profile from './Profile.jsx'
import ForgotPassword from './ForgotPassword.jsx';
import BlogDetail from './BlogDetail';
import Checkout from './Checkout.jsx';
import OrderHistory from './OrderHistory.jsx';
// 1. BỔ SUNG IMPORT KHO GIỎ HÀNG
import { CartProvider } from './CartContext.jsx';

// CSS
import './index.css'

// CHÌA KHÓA GOOGLE CỦA HÀO (Lấy từ ảnh chụp)
const GOOGLE_CLIENT_ID = "1014098207489-i5sg0h3vf9674gts9s29csg55eg5s3k1.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Bọc cái áo khoác của Google ở ngoài cùng */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/* 2. BỌC CÁI KHO GIỎ HÀNG BAO TRỌN TOÀN BỘ WEBSITE NÈ SẾP */}
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/origins" element={<Origins />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/blogs/:id" element={<BlogDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-history" element={<OrderHistory />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)